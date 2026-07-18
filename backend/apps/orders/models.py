from django.db import models
from django.conf import settings
from apps.products.models import Product
from django.utils import timezone

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending - Awaiting seller confirmation'),
        ('processing', 'Processing - Meetup being arranged'),
        ('ready', 'Ready for Pickup - Item ready at meetup location'),
        ('completed', 'Completed - Transaction finished'),
        ('cancelled', 'Cancelled - Order cancelled'),
    ]
    
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='purchases')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sales')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    meetup_location = models.CharField(max_length=255, blank=True)
    meetup_time = models.DateTimeField(null=True, blank=True)
    meetup_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    cancellation_reason = models.TextField(blank=True)
    cancelled_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                      null=True, blank=True, related_name='cancelled_orders')
    
    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)
    
    def can_cancel(self):
        return self.status in ['pending', 'processing']
    
    def __str__(self):
        return f"Order #{self.id} - {self.product.name}"
    
    def get_current_step(self):
        """Get the current step in the order process"""
        status_map = {
            'pending': 'order_placed',
            'processing': 'meetup_arranged',
            'ready': 'ready_for_pickup',
            'completed': 'completed',
            'cancelled': 'cancelled'
        }
        return status_map.get(self.status, 'order_placed')
    
    def get_timeline(self):
        """Get order timeline with status history and timestamps"""
        timeline = []
        
        # Order created
        if self.created_at:
            timeline.append({
                'status': 'order_placed',
                'title': 'Order Placed',
                'description': 'Your order has been created and is awaiting seller confirmation.',
                'timestamp': self.created_at.isoformat(),
                'completed': True,
                'icon': '📦'
            })
        
        # Payment completed
        if hasattr(self, 'payment') and self.payment and self.payment.status == 'completed':
            timeline.append({
                'status': 'payment_confirmed',
                'title': 'Payment Confirmed',
                'description': f'Payment of K{self.payment.amount} has been confirmed.',
                'timestamp': self.payment.paid_at.isoformat() if self.payment.paid_at else self.payment.created_at.isoformat(),
                'completed': True,
                'icon': '💰'
            })
        elif self.created_at:
            timeline.append({
                'status': 'payment_confirmed',
                'title': 'Payment Confirmed',
                'description': 'Awaiting payment confirmation.',
                'timestamp': None,
                'completed': False,
                'icon': '💰'
            })
        
        # Meetup arranged
        if self.status in ['processing', 'ready', 'completed'] and self.meetup_time:
            timeline.append({
                'status': 'meetup_arranged',
                'title': 'Meetup Arranged',
                'description': f'Seller has arranged a meetup at "{self.meetup_location}".',
                'timestamp': self.meetup_time.isoformat(),
                'completed': True,
                'icon': '📍'
            })
        elif self.status in ['processing', 'ready', 'completed']:
            timeline.append({
                'status': 'meetup_arranged',
                'title': 'Meetup Arranged',
                'description': 'Seller will arrange a meetup soon.',
                'timestamp': None,
                'completed': False,
                'icon': '📍'
            })
        
        # Ready for pickup
        if self.status in ['ready', 'completed']:
            timeline.append({
                'status': 'ready_for_pickup',
                'title': 'Ready for Pickup',
                'description': 'Your item is ready for pickup at the arranged meetup location.',
                'timestamp': self.updated_at.isoformat(),
                'completed': True,
                'icon': '✅'
            })
        else:
            timeline.append({
                'status': 'ready_for_pickup',
                'title': 'Ready for Pickup',
                'description': 'Seller will mark the item as ready when available.',
                'timestamp': None,
                'completed': False,
                'icon': '✅'
            })
        
        # Completed
        if self.status == 'completed':
            completed_time = self.completed_at or self.updated_at
            timeline.append({
                'status': 'completed',
                'title': 'Order Completed',
                'description': 'Order has been completed successfully!',
                'timestamp': completed_time.isoformat() if completed_time else None,
                'completed': True,
                'icon': '🎉'
            })
        elif self.status != 'cancelled':
            timeline.append({
                'status': 'completed',
                'title': 'Order Completed',
                'description': 'Awaiting order completion.',
                'timestamp': None,
                'completed': False,
                'icon': '🎉'
            })
        
        # Cancelled
        if self.status == 'cancelled':
            cancel_time = self.cancelled_at or self.updated_at
            timeline.append({
                'status': 'cancelled',
                'title': 'Order Cancelled',
                'description': 'Order has been cancelled.',
                'timestamp': cancel_time.isoformat() if cancel_time else None,
                'completed': True,
                'is_cancelled': True,
                'icon': '❌'
            })
        
        return timeline
    
    class Meta:
        ordering = ['-created_at']


class OrderHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='history')
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Order #{self.order.id}: {self.old_status} -> {self.new_status}"
