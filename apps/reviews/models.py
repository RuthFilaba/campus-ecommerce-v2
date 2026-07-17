from django.db import models
from django.conf import settings
from apps.orders.models import Order

class Review(models.Model):
    """
    Reviews & Ratings System
    IEEE 830: Trust and reputation management
    Norman's Feedback: Buyer reviews help sellers improve
    Shneiderman Rule 3: Informative ratings
    
    REQ: Buyers can rate sellers after completed orders
    """
    
    RATING_CHOICES = [
        (1, '⭐ - Poor'),
        (2, '⭐⭐ - Fair'),
        (3, '⭐⭐⭐ - Good'),
        (4, '⭐⭐⭐⭐ - Very Good'),
        (5, '⭐⭐⭐⭐⭐ - Excellent'),
    ]
    
    # Relationships
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='review')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_given')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_received')
    
    # Rating & Comment
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(max_length=500, blank=True)
    
    # Detailed ratings (optional)
    product_quality = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    communication = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    meetup_punctuality = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    
    # Status
    is_verified_purchase = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['order', 'reviewer']
    
    def __str__(self):
        return f"Review for {self.seller.email} - {self.rating}★"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update seller's average rating
        from users.models import User
        seller = self.seller
        reviews = Review.objects.filter(seller=seller, is_approved=True)
        if reviews.exists():
            avg_rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
            seller.rating = avg_rating
            seller.review_count = reviews.count()
            seller.save()
