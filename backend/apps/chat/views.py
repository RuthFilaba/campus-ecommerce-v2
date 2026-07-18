from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ChatThread, Message
from .serializers import (
    ChatThreadSerializer, MessageSerializer, 
    CreateThreadSerializer, SendMessageSerializer
)
from apps.products.models import Product

class MyChatsView(generics.ListAPIView):
    serializer_class = ChatThreadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return ChatThread.objects.filter(
            Q(buyer=user) | Q(seller=user),
            is_active=True
        )
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class CreateThreadView(APIView):
    """
    Create a new chat thread OR get existing one
    ONE thread per buyer-seller pair
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CreateThreadSerializer(data=request.data)
        if serializer.is_valid():
            product = get_object_or_404(Product, id=serializer.validated_data['product_id'])
            
            # Cannot chat about own product
            if product.seller == request.user:
                return Response({
                    'error': 'You cannot chat about your own product'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # CRITICAL: Get or create thread by buyer-seller pair (NOT by product)
            thread, created = ChatThread.objects.get_or_create(
                buyer=request.user,
                seller=product.seller,
                defaults={
                    'product': product,
                    'order_id': serializer.validated_data.get('order_id')
                }
            )
            
            # Update product reference if thread already existed
            if not created and product:
                thread.product = product
                thread.save()
            
            # Send initial message if this is a new thread
            initial_message = serializer.validated_data.get('initial_message')
            if initial_message and created:
                Message.objects.create(
                    thread=thread,
                    sender=request.user,
                    receiver=product.seller,
                    message=initial_message
                )
            
            return Response({
                'success': True,
                'message': 'Chat thread created' if created else 'Existing chat thread retrieved',
                'thread': ChatThreadSerializer(thread, context={'request': request}).data
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ThreadMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        thread_id = self.kwargs.get('thread_id')
        thread = get_object_or_404(ChatThread, id=thread_id)
        
        if thread.buyer != self.request.user and thread.seller != self.request.user:
            return Message.objects.none()
        
        thread.mark_as_read(self.request.user)
        return thread.messages.all()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        if serializer.is_valid():
            thread = get_object_or_404(ChatThread, id=serializer.validated_data['thread_id'])
            
            if thread.buyer != request.user and thread.seller != request.user:
                return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
            receiver = thread.get_other_user(request.user)
            
            message = Message.objects.create(
                thread=thread,
                sender=request.user,
                receiver=receiver,
                message=serializer.validated_data['message']
            )
            
            thread.save()  # Update timestamp
            
            return Response({
                'success': True,
                'message': 'Message sent successfully',
                'data': MessageSerializer(message, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Add at the end of chat/views.py

class MarkMessageReadView(APIView):
    """Mark a single message as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id)
            if message.receiver == request.user and not message.is_read:
                message.is_read = True
                message.read_at = timezone.now()
                message.save()
                return Response({'success': True, 'message': 'Marked as read'})
        except Message.DoesNotExist:
            pass
        return Response({'error': 'Message not found'}, status=404)

class ThreadOnlineStatusView(APIView):
    """Get online status of users in a thread"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, thread_id):
        thread = get_object_or_404(ChatThread, id=thread_id)
        
        if thread.buyer != request.user and thread.seller != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        
        # This would be populated by WebSocket connections
        # For now, return placeholder
        return Response({
            'buyer_online': False,
            'seller_online': False,
        })

class UnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        threads = ChatThread.objects.filter(Q(buyer=user) | Q(seller=user), is_active=True)
        
        total_unread = 0
        for thread in threads:
            total_unread += thread.unread_count(user)
        
        return Response({
            'total_unread': total_unread
        })