from django.db import models
from django.conf import settings
from apps.orders.models import Order
import uuid

class Payment(models.Model):
    """Payment model for Zambia - IEEE 830 REQ-18 to REQ-20"""
    
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    # Zambia-specific payment methods (Norman's Affordance)
    PAYMENT_METHOD = [
        ('cash', '💰 Cash on Meetup'),
        ('mtn_momo', '📱 MTN Mobile Money (*150#)'),
        ('airtel_money', '📱 Airtel Money (*115#)'),
        ('zamtel_kwacha', '📱 Zamtel Kwacha (*115#)'),
        ('bank_transfer', '🏦 Bank Transfer (Zanaco)'),
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Transaction tracking (IEEE 830 compliance)
    transaction_reference = models.CharField(max_length=100, unique=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.transaction_reference:
            self.transaction_reference = f"CAMPUS-ORDER-{self.order.id}-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Payment #{self.id} - {self.get_payment_method_display()} - {self.status}"
