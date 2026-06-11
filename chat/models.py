from django.db import models
from django.conf import settings
from products.models import Product
from orders.models import Order
from django.utils import timezone

class ChatThread(models.Model):
    """
    Chat thread between buyer and seller
    ONE thread per buyer-seller pair (not per product)
    """
    
    # Optional product reference (can change as they discuss different products)
    product = models.ForeignKey(
        Product, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='chat_threads',
        help_text='Currently discussed product (optional)'
    )
    order = models.OneToOneField(
        Order, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='chat_thread',
        help_text='Associated order (if any)'
    )
    
    # Core identifiers - ONE thread per buyer-seller pair
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='buyer_chats'
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='seller_chats'
    )
    
    # Thread metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Ensure only ONE thread per buyer-seller pair
        unique_together = ['buyer', 'seller']
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Chat: {self.buyer.email} ↔ {self.seller.email}"
    
    def get_other_user(self, user):
        """Get the conversation partner"""
        return self.seller if user == self.buyer else self.buyer
    
    def mark_as_read(self, user):
        """Mark all messages as read for the specified user"""
        self.messages.filter(receiver=user, is_read=False).update(is_read=True, read_at=timezone.now())
    
    def unread_count(self, user):
        """Get unread message count for a user"""
        return self.messages.filter(receiver=user, is_read=False).count()

class Message(models.Model):
    """
    Individual message in a chat thread
    """
    
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField(max_length=2000)
    
    # Message status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.email}: {self.message[:50]}"
    
    def mark_as_read(self):
        """Mark message as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()