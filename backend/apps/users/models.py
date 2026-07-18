from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
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
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """
    Complete User Model with Role Management
    All new fields are nullable for migration safety
    """
    
    ROLE_CHOICES = [
        ('buyer', '🛒 Buyer - Can purchase products'),
        ('seller', '📦 Seller - Can list and sell products'),
        ('admin', '👑 Administrator - Full system access'),
        ('moderator', '🛡️ Moderator - Content management'),
        ('support', '🎧 Support - Customer support'),
    ]
    
    # Basic Information
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=100, blank=True, default='')
    last_name = models.CharField(max_length=100, blank=True, default='')
    
    # Contact Information
    phone_regex = RegexValidator(
        regex=r'^(\+260|0)[0-9]{9}$',
        message='Phone must be Zambian format: 097xxxxxxx or +26097xxxxxxx'
    )
    phone = models.CharField(validators=[phone_regex], max_length=15, blank=True, default='')
    alternate_phone = models.CharField(validators=[phone_regex], max_length=15, blank=True, default='')
    
    # Campus Information
    student_id = models.CharField(max_length=50, blank=True, default='')
    campus = models.CharField(max_length=100, blank=True, default='')
    department = models.CharField(max_length=100, blank=True, default='')
    year_of_study = models.IntegerField(null=True, blank=True, choices=[(1, '1st Year'), (2, '2nd Year'), (3, '3rd Year'), (4, '4th Year'), (5, '5th Year+')])
    
    # Role & Permissions
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='buyer')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Verification Status
    is_verified = models.BooleanField(default=False)
    is_campus_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    
    # Trust Metrics
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    review_count = models.IntegerField(default=0)
    total_sales = models.IntegerField(default=0)
    total_purchases = models.IntegerField(default=0)
    trust_score = models.IntegerField(default=0)
    
    # Security
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_location = models.CharField(max_length=200, blank=True, default='')
    
    # Profile
    profile_picture = models.URLField(max_length=500, blank=True, default='')
    bio = models.TextField(max_length=500, blank=True, default='')
    
    # Social Links
    facebook_url = models.URLField(max_length=200, blank=True, default='')
    twitter_url = models.URLField(max_length=200, blank=True, default='')
    instagram_url = models.URLField(max_length=200, blank=True, default='')
    
    # Preferences
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    language = models.CharField(max_length=10, default='en', choices=[('en', 'English'), ('fr', 'French'), ('sw', 'Swahili')])
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(default=timezone.now)
    last_password_change = models.DateTimeField(default=timezone.now)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email
    
    def get_short_name(self):
        return self.first_name or self.email.split('@')[0]
    
    def get_role_display(self):
        role_map = {
            'buyer': '🛒 Buyer',
            'seller': '📦 Seller',
            'admin': '👑 Admin',
            'moderator': '🛡️ Moderator',
            'support': '🎧 Support',
        }
        return role_map.get(self.role, self.role)
    
    def get_role_badge(self):
        badge_map = {
            'buyer': {'color': 'blue', 'icon': 'shopping_cart'},
            'seller': {'color': 'green', 'icon': 'store'},
            'admin': {'color': 'red', 'icon': 'admin_panel_settings'},
            'moderator': {'color': 'orange', 'icon': 'gavel'},
            'support': {'color': 'purple', 'icon': 'support_agent'},
        }
        return badge_map.get(self.role, {'color': 'gray', 'icon': 'person'})
    
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
    
    def can_sell(self):
        return self.role in ['seller', 'admin'] and self.is_verified
    
    def can_buy(self):
        return self.is_active and self.is_verified
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_seller(self):
        return self.role == 'seller'
    
    def is_buyer(self):
        return self.role == 'buyer'
    
    def update_trust_score(self):
        score = 0
        if self.is_verified:
            score += 20
        if self.is_campus_verified:
            score += 30
        if self.is_phone_verified:
            score += 10
        if self.review_count > 0:
            score += min(self.review_count, 20)
        if self.total_sales > 0:
            score += min(self.total_sales, 20)
        score += int(self.rating * 4)
        self.trust_score = min(score, 100)
        self.save()
    
    def update_last_active(self):
        self.last_active = timezone.now()
        self.save()