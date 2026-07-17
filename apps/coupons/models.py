from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone
from apps.products.models import Product


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage (%)'),
        ('fixed', 'Fixed Amount (K)'),
    ]
    
    # Basic info
    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.CharField(max_length=200, blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    
    # Seller association (null = platform coupon)
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='coupons'
    )
    
    # Requirements
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    maximum_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Validity period
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField()
    
    # Usage limits
    usage_limit = models.PositiveIntegerField(default=100)
    used_count = models.PositiveIntegerField(default=0)
    per_user_limit = models.PositiveIntegerField(default=1)
    
    # Product restrictions (optional)
    applicable_products = models.ManyToManyField(Product, blank=True, related_name='applicable_coupons')
    
    # User restrictions (optional)
    applicable_users = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='applicable_coupons')
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_coupons')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.get_discount_display()}"
    
    def get_discount_display(self):
        if self.discount_type == 'percentage':
            return f"{self.discount_value}% off"
        return f"K{self.discount_value} off"
    
    def is_valid(self, user=None, cart_subtotal=0, products=None):
        if not self.is_active:
            return False, "Coupon is inactive"
        if timezone.now() < self.valid_from:
            return False, f"Coupon starts on {self.valid_from.strftime('%Y-%m-%d')}"
        if timezone.now() > self.valid_to:
            return False, f"Coupon expired on {self.valid_to.strftime('%Y-%m-%d')}"
        if self.used_count >= self.usage_limit:
            return False, "Coupon usage limit reached"
        if cart_subtotal < self.minimum_order_amount:
            return False, f"Minimum order amount is K{self.minimum_order_amount}"
        
        if user and self.applicable_users.exists():
            if user not in self.applicable_users.all():
                return False, "Coupon not applicable to your account"
        
        if products and self.applicable_products.exists():
            product_ids = [p.id for p in products]
            applicable_ids = self.applicable_products.values_list('id', flat=True)
            if not any(pid in applicable_ids for pid in product_ids):
                return False, "Coupon not applicable to items in your cart"
        
        return True, "Coupon is valid"
    
    def calculate_discount(self, subtotal):
        if self.discount_type == 'percentage':
            discount = subtotal * (self.discount_value / 100)
        else:
            discount = self.discount_value
        if self.maximum_discount and discount > self.maximum_discount:
            discount = self.maximum_discount
        if discount > subtotal:
            discount = subtotal
        return discount
    
    def use_coupon(self, user=None, order=None):
        self.used_count += 1
        self.save()
        
        if user:
            CouponUsage.objects.create(
                coupon=self,
                user=user,
                order=order,
                discount_amount=self.calculate_discount(0)
            )


class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coupon_usages')
    order = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['coupon', 'user']
        ordering = ['-used_at']
    
    def __str__(self):
        return f"{self.coupon.code} used by {self.user.email}"
