from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('food', 'Food & Drinks'),
        ('academic', 'Academic'),
        ('fashion', 'Fashion'),
        ('tech-mobile', 'Tech & Mobile'),
        ('events', 'Events & Tickets'),
        ('marketplace', 'Marketplace'),
    ]

    CONDITION_CHOICES = [
        ('new', 'Brand New'),
        ('like_new', 'Like New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]

    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='marketplace')
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='good')
    stock = models.IntegerField(default=1, validators=[MinValueValidator(0)])

    image_url = models.URLField(max_length=500, blank=True, default='')
    image_1 = models.ImageField(upload_to='products/', blank=True, null=True)
    image_2 = models.ImageField(upload_to='products/', blank=True, null=True)
    image_3 = models.ImageField(upload_to='products/', blank=True, null=True)

    is_featured = models.BooleanField(default=False)
    featured_order = models.IntegerField(default=0)
    featured_start_date = models.DateTimeField(null=True, blank=True)
    featured_end_date = models.DateTimeField(null=True, blank=True)

    is_submitted = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def get_images_list(self):
        images = []
        if self.image_1:
            images.append(self.image_1.url)
        if self.image_2:
            images.append(self.image_2.url)
        if self.image_3:
            images.append(self.image_3.url)
        if self.image_url and not images:
            images.append(self.image_url)
        return images
