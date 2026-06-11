from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Order, OrderHistory
from .serializers import (
    OrderSerializer, CreateOrderSerializer, OrderStatusUpdateSerializer, 
    MeetupSerializer, CancelOrderSerializer, OrderHistorySerializer
)
from products.models import Product
from backend.email_service import send_order_status_email

class IsBuyerOrSeller(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.buyer == request.user or obj.seller == request.user

class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        if serializer.is_valid():
            product = Product.objects.get(id=serializer.validated_data['product_id'])
            
            if product.seller == request.user:
                return Response({'error': 'You cannot buy your own product'}, status=400)
            
            order = Order.objects.create(
                buyer=request.user,
                seller=product.seller,
                product=product,
                quantity=serializer.validated_data['quantity'],
                unit_price=product.price,
                meetup_location=serializer.validated_data.get('meetup_location', ''),
                meetup_notes=serializer.validated_data.get('meetup_notes', '')
            )
            
            product.stock -= order.quantity
            product.save()
            
            OrderHistory.objects.create(
                order=order,
                old_status='',
                new_status='pending',
                changed_by=request.user,
                notes='Order created by buyer'
            )
            
            return Response(OrderSerializer(order).data, status=201)
        return Response(serializer.errors, status=400)

class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user)

class MySalesView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(seller=self.request.user)

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuyerOrSeller]
    
    def get_queryset(self):
        return Order.objects.all()

class UpdateOrderStatusView(APIView):
    """
    Update order status with email notifications
    IEEE 830 REQ-15, REQ-17: Order status tracking and notifications
    Norman's Feedback: Email confirmation on status change
    Shneiderman Rule 3: Informative status updates
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = OrderStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            old_status = order.status
            new_status = serializer.validated_data['status']
            notes = serializer.validated_data.get('notes', '')
            
            # Permission checks
            if new_status == 'processing' and order.seller != request.user:
                return Response({'error': 'Only seller can start processing'}, status=403)
            
            if new_status == 'ready' and order.seller != request.user:
                return Response({'error': 'Only seller can mark as ready'}, status=403)
            
            if new_status == 'completed' and order.buyer != request.user:
                return Response({'error': 'Only buyer can confirm completion'}, status=403)
            
            if new_status == 'cancelled':
                if order.buyer != request.user and order.seller != request.user:
                    return Response({'error': 'Only buyer or seller can cancel'}, status=403)
                if order.status != 'pending':
                    return Response({'error': 'Only pending orders can be cancelled'}, status=400)
                order.cancelled_at = timezone.now()
                order.cancelled_by = request.user
                order.cancellation_reason = notes
                order.product.stock += order.quantity
                order.product.save()
            
            if new_status == 'completed':
                order.completed_at = timezone.now()
            
            order.status = new_status
            order.save()
            
            # Create history entry
            OrderHistory.objects.create(
                order=order,
                old_status=old_status,
                new_status=new_status,
                changed_by=request.user,
                notes=notes or f"Status changed from {old_status} to {new_status}"
            )
            
            # Send email notification (REQ-17)
            try:
                send_order_status_email(order, old_status, new_status)
                print(f"📧 Email sent to {order.buyer.email} and {order.seller.email}")
            except Exception as e:
                print(f"⚠️ Email error: {e}")
            
            return Response({
                'status': 'updated',
                'message': f'Order status updated to {new_status}. Email notification sent.',
                'order': OrderSerializer(order).data
            })
        
        return Response(serializer.errors, status=400)

class ArrangeMeetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        
        if order.seller != request.user:
            return Response({'error': 'Only seller can arrange meetup'}, status=403)
        
        serializer = MeetupSerializer(data=request.data)
        if serializer.is_valid():
            old_status = order.status
            order.meetup_location = serializer.validated_data['meetup_location']
            order.meetup_time = serializer.validated_data['meetup_time']
            order.meetup_notes = serializer.validated_data.get('meetup_notes', '')
            order.status = 'processing'
            order.save()
            
            OrderHistory.objects.create(
                order=order,
                old_status=old_status,
                new_status='processing',
                changed_by=request.user,
                notes=f"Meetup arranged at {order.meetup_location} on {order.meetup_time}"
            )
            
            # Send email notification about meetup
            try:
                send_order_status_email(order, old_status, 'processing')
                print(f"📧 Meetup email sent to {order.buyer.email}")
            except Exception as e:
                print(f"⚠️ Email error: {e}")
            
            return Response({
                'status': 'meetup_arranged',
                'message': f'Meetup arranged. Email notification sent to buyer.',
                'order': OrderSerializer(order).data
            })
        
        return Response(serializer.errors, status=400)

class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        
        if order.buyer != request.user and order.seller != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        
        if order.status != 'pending':
            return Response({'error': 'Only pending orders can be cancelled'}, status=400)
        
        old_status = order.status
        order.status = 'cancelled'
        order.cancelled_at = timezone.now()
        order.cancelled_by = request.user
        order.cancellation_reason = request.data.get('reason', '')
        order.save()
        
        order.product.stock += order.quantity
        order.product.save()
        
        OrderHistory.objects.create(
            order=order,
            old_status=old_status,
            new_status='cancelled',
            changed_by=request.user,
            notes=f"Order cancelled by {request.user.role}"
        )
        
        # Send cancellation email
        try:
            send_order_status_email(order, old_status, 'cancelled')
            print(f"📧 Cancellation email sent to {order.buyer.email} and {order.seller.email}")
        except Exception as e:
            print(f"⚠️ Email error: {e}")
        
        return Response({
            'status': 'cancelled',
            'message': 'Order cancelled successfully. Email notification sent.',
            'order': OrderSerializer(order).data
        })

class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        order_id = self.kwargs.get('pk')
        order = get_object_or_404(Order, pk=order_id)
        
        if order.buyer != self.request.user and order.seller != self.request.user:
            return OrderHistory.objects.none()
        
        return OrderHistory.objects.filter(order=order)
class OrderTimelineView(APIView):
    """
    Get order timeline for tracking
    GET /api/orders/{id}/timeline/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        
        if order.buyer != request.user and order.seller != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        
        timeline = order.get_timeline()
        current_step = order.get_current_step()
        
        steps = ['order_placed', 'payment_confirmed', 'meetup_arranged', 'ready_for_pickup', 'completed']
        current_index = steps.index(current_step) if current_step in steps else 0
        progress_percentage = (current_index / (len(steps) - 1)) * 100 if steps else 0
        
        return Response({
            'order_id': order.id,
            'status': order.status,
            'status_display': dict(Order.STATUS_CHOICES).get(order.status, order.status),
            'current_step': current_step,
            'progress_percentage': progress_percentage,
            'timeline': timeline,
            'estimated_completion': self.get_estimated_completion(order)
        })
    
    def get_estimated_completion(self, order):
        if order.status == 'completed':
            return 'Completed'
        elif order.status == 'cancelled':
            return 'Cancelled'
        elif order.status == 'ready':
            return 'Ready for pickup - Complete when you receive the item'
        elif order.status == 'processing':
            return 'Processing - Usually completed within 1-2 days'
        else:
            return 'Pending seller confirmation'


class OrderTrackingDashboardView(APIView):
    """
    Get all orders with tracking progress
    GET /api/orders/tracking/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        orders = Order.objects.filter(buyer=request.user).order_by('-created_at')
        
        tracking_data = []
        for order in orders:
            steps = ['order_placed', 'payment_confirmed', 'meetup_arranged', 'ready_for_pickup', 'completed']
            current_step = order.get_current_step()
            progress = 0
            if current_step in steps:
                current_index = steps.index(current_step)
                progress = (current_index / (len(steps) - 1)) * 100
            
            tracking_data.append({
                'order_id': order.id,
                'product_name': order.product.name,
                'product_image': order.product.image_url,
                'total_price': float(order.total_price),
                'status': order.status,
                'status_display': dict(Order.STATUS_CHOICES).get(order.status, order.status),
                'current_step': current_step,
                'progress_percentage': progress,
                'created_at': order.created_at,
                'meetup_location': order.meetup_location,
                'meetup_time': order.meetup_time
            })
        
        return Response({
            'total_orders': len(tracking_data),
            'orders': tracking_data
        })
