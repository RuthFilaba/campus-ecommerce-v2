from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.orders.models import Order
from .models import Payment
from .serializers import PaymentSerializer, CreatePaymentSerializer

class CreatePaymentView(APIView):
    """
    Create payment for order - REQ-18, REQ-19, REQ-20 (IEEE 830)
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        if serializer.is_valid():
            order = get_object_or_404(Order, id=serializer.validated_data['order_id'])
            payment_method = serializer.validated_data['payment_method']
            phone_number = serializer.validated_data.get('phone_number', '')
            
            # Norman's Constraints: Only buyer can pay
            if order.buyer != request.user:
                return Response({'error': 'Only the buyer can make payment'}, status=403)
            
            # Check if payment already exists
            if hasattr(order, 'payment'):
                return Response({'error': 'Payment already exists for this order'}, status=400)
            
            # Create payment record
            payment = Payment.objects.create(
                order=order,
                user=request.user,
                amount=order.total_price,
                payment_method=payment_method,
                phone_number=phone_number,
                status='pending'
            )
            
            # Payment instructions (Norman's Affordance - clear next steps)
            instructions = {
                'cash': {
                    'message': 'Pay cash when you meet the seller at the arranged campus location',
                    'steps': ['Meet at arranged location', 'Pay exact amount', 'Confirm receipt']
                },
                'mtn_momo': {
                    'ussd': '*150#',
                    'message': 'Dial *150# and follow prompts to send money',
                    'steps': ['Dial *150#', 'Select Send Money', 'Enter amount', 'Confirm with PIN']
                },
                'airtel_money': {
                    'ussd': '*110#',
                    'message': 'Dial *110# and follow prompts to send money',
                    'steps': ['Dial *110#', 'Select Send Money', 'Enter amount', 'Confirm with PIN']
                },
                'zamtel_kwacha': {
                    'ussd': '*115#',
                    'message': 'Dial *115# and follow prompts to send money',
                    'steps': ['Dial *115#', 'Select Send Money', 'Enter amount', 'Confirm with PIN']
                },
                'bank_transfer': {
                    'bank': 'Zanaco Bank Zambia',
                    'account': '1234567890',
                    'message': 'Transfer to Zanaco account with your transaction reference',
                    'steps': ['Use reference: ' + payment.transaction_reference, 'Transfer exact amount', 'Payment verified within 24 hours']
                }
            }
            
            return Response({
                'message': 'Payment initiated',
                'payment_id': payment.id,
                'transaction_reference': payment.transaction_reference,
                'amount': str(payment.amount),
                'payment_method': payment.get_payment_method_display(),
                'status': payment.status,
                'instructions': instructions.get(payment_method, {})
            }, status=201)
        
        return Response(serializer.errors, status=400)

class VerifyPaymentView(APIView):
    """Verify payment status - Shneiderman Rule 3: Informative feedback"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, payment_id):
        payment = get_object_or_404(Payment, id=payment_id, user=request.user)
        
        return Response({
            'payment_id': payment.id,
            'transaction_reference': payment.transaction_reference,
            'amount': str(payment.amount),
            'status': payment.status,
            'payment_method': payment.get_payment_method_display(),
            'paid_at': payment.paid_at,
        })

class OrderPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        payment = get_object_or_404(Payment, order_id=order_id)
        if payment.order.buyer_id != request.user.id and payment.order.seller_id != request.user.id:
            return Response({'error': 'Not authorized'}, status=403)
        return Response(PaymentSerializer(payment).data)

class ConfirmPaymentView(APIView):
    """
    Confirm payment for cash on meetup
    Sends email notification on confirmation
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, payment_id):
        payment = get_object_or_404(Payment, id=payment_id, user=request.user)
        
        # Only buyer can confirm
        if payment.user != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        
        # Only pending payments can be confirmed
        if payment.status != 'pending':
            return Response({'error': f'Payment already {payment.status}'}, status=400)
        
        payment.status = 'completed'
        payment.paid_at = timezone.now()
        payment.save()
        
        # Update order status
        if payment.order.status == 'pending':
            payment.order.status = 'processing'
            payment.order.save(update_fields=['status', 'updated_at'])
        
        # Send payment confirmation email (REQ-17)
        try:
            send_payment_confirmation_email(payment)
            print(f"📧 Payment confirmation email sent to {payment.user.email}")
        except Exception as e:
            print(f"⚠️ Email error: {e}")
        
        return Response({
            'message': 'Payment confirmed successfully. Email notification sent.',
            'payment': PaymentSerializer(payment).data
        })