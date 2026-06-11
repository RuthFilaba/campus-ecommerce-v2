# backend/users/models.py

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('admin', 'Administrator'),
    ]
    
    VERIFICATION_LEVELS = [
        ('basic', 'Basic - Email Verified'),
        ('campus', 'Campus - Student ID Verified'),
        ('verified', 'Verified - Official Badge'),
        ('premium', 'Premium - Top Seller'),
    ]
    
    # Basic Information
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=False, default='')
    last_name = models.CharField(max_length=100, blank=False, default='')
    
    # Phone - Made optional with no strict validation for global use
    phone = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        help_text="Optional: Phone number (any format)"
    )
    
    # Location/Campus Information (optional, for any country)
    student_id = models.CharField(max_length=50, blank=True, null=True)
    campus = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True, default='Zambia')
    city = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Role & Permissions
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='buyer')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Verification Status
    is_verified = models.BooleanField(default=True)  # Auto-verify for easier registration
    is_campus_verified = models.BooleanField(default=False)
    
    # Verification Badges
    is_verified_seller = models.BooleanField(default=False)
    verification_level = models.CharField(max_length=20, choices=VERIFICATION_LEVELS, default='basic')
    verification_documents = models.JSONField(default=list, blank=True)
    verification_requested_at = models.DateTimeField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True)
    
    # Seller Statistics
    total_reviews_positive = models.IntegerField(default=0)
    response_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    on_time_delivery_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Trust Metrics
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    review_count = models.IntegerField(default=0)
    total_sales = models.IntegerField(default=0)
    total_purchases = models.IntegerField(default=0)
    
    # Security
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    objects = UserManager()
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email
    
    def get_short_name(self):
        return self.first_name or self.email.split('@')[0]
    
    def increment_failed_logins(self):
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.locked_until = timezone.now() + timezone.timedelta(minutes=15)
        self.save()
    
    def reset_failed_logins(self):
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save()
    
    def is_locked(self):
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False
    
    def get_remaining_lockout_minutes(self):
        if self.locked_until and self.locked_until > timezone.now():
            remaining = (self.locked_until - timezone.now()).seconds // 60
            return remaining
        return 0
    
    def can_sell(self):
        return self.role in ['seller', 'admin'] and self.is_verified
    
    def can_buy(self):
        return self.is_active and self.is_verified
    
    class Meta:
        ordering = ['-created_at']