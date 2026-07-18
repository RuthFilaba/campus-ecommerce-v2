"""
Analytics Models for Campus E-Commerce
IEEE 830 REQ-21 to REQ-23: Report Generation and Data Storage
Norman's Visibility: Track key metrics over time
Shneiderman Rule 8: Store historical data for trend analysis
"""

from django.db import models
from django.conf import settings
from django.utils import timezone

class DailySalesReport(models.Model):
    """
    Store daily sales aggregates for quick reporting
    IEEE 830 REQ-22: Sales report data persistence
    Norman's Visibility: Historical data for trend analysis
    """
    
    report_date = models.DateField(unique=True, help_text='Date of the report')
    
    # Sales metrics
    total_orders = models.IntegerField(default=0)
    completed_orders = models.IntegerField(default=0)
    cancelled_orders = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Customer metrics
    unique_customers = models.IntegerField(default=0)
    new_customers = models.IntegerField(default=0)
    
    # Product metrics
    products_sold = models.IntegerField(default=0)
    top_product_id = models.IntegerField(null=True, blank=True)
    top_product_sales = models.IntegerField(default=0)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-report_date']
        verbose_name = 'Daily Sales Report'
        verbose_name_plural = 'Daily Sales Reports'
    
    def __str__(self):
        return f"Sales Report for {self.report_date} - K{self.total_revenue}"

class SellerPerformance(models.Model):
    """
    Track seller performance metrics over time
    IEEE 830 REQ-21: Seller performance tracking
    Norman's Visibility: Clear seller metrics
    """
    
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='performance_records')
    report_date = models.DateField()
    
    # Sales metrics
    total_sales = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    
    # Product metrics
    products_listed = models.IntegerField(default=0)
    active_products = models.IntegerField(default=0)
    
    # Customer metrics
    unique_buyers = models.IntegerField(default=0)
    returning_buyers = models.IntegerField(default=0)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['seller', 'report_date']
        ordering = ['-report_date']
        verbose_name = 'Seller Performance'
        verbose_name_plural = 'Seller Performances'
    
    def __str__(self):
        return f"{self.seller.email} - {self.report_date} - K{self.total_revenue}"

class ProductPerformance(models.Model):
    """
    Track individual product performance
    IEEE 830 REQ-22: Product sales analytics
    """
    
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='performance_records')
    report_date = models.DateField()
    
    # Sales metrics
    units_sold = models.IntegerField(default=0)
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    views_count = models.IntegerField(default=0)
    
    # Engagement metrics
    cart_adds = models.IntegerField(default=0)
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['product', 'report_date']
        ordering = ['-report_date', '-revenue']
        verbose_name = 'Product Performance'
        verbose_name_plural = 'Product Performances'
    
    def __str__(self):
        return f"{self.product.name} - {self.report_date} - {self.units_sold} sold"

class CategorySalesSummary(models.Model):
    """
    Aggregate sales by category
    Shneiderman Rule 8: Reduce cognitive load with category summaries
    """
    
    category = models.CharField(max_length=50)
    report_date = models.DateField()
    
    # Sales metrics
    total_orders = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    units_sold = models.IntegerField(default=0)
    
    # Percentage of total sales
    percentage_of_total = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['category', 'report_date']
        ordering = ['-report_date', '-total_revenue']
        verbose_name = 'Category Sales Summary'
        verbose_name_plural = 'Category Sales Summaries'
    
    def __str__(self):
        return f"{self.category} - {self.report_date} - K{self.total_revenue}"

class UserActivityLog(models.Model):
    """
    Track user activity for analytics
    IEEE 830: Audit trail for user actions
    """
    
    ACTION_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('view_product', 'View Product'),
        ('add_to_cart', 'Add to Cart'),
        ('create_order', 'Create Order'),
        ('complete_order', 'Complete Order'),
        ('create_review', 'Create Review'),
        ('send_message', 'Send Message'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=50, choices=ACTION_TYPES)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['action', 'created_at']),
        ]
        verbose_name = 'User Activity Log'
        verbose_name_plural = 'User Activity Logs'
    
    def __str__(self):
        return f"{self.user.email} - {self.action} - {self.created_at}"