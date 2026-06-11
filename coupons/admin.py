from django.contrib import admin
from .models import Coupon, CouponUsage

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'seller', 'valid_from', 'valid_to', 'used_count', 'usage_limit', 'is_active']
    list_filter = ['discount_type', 'is_active', 'valid_from', 'valid_to']
    search_fields = ['code', 'description']
    list_editable = ['is_active']
    readonly_fields = ['used_count', 'created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'description', 'discount_type', 'discount_value')
        }),
        ('Limits', {
            'fields': ('minimum_order_amount', 'maximum_discount', 'usage_limit', 'per_user_limit')
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_to', 'is_active')
        }),
        ('Restrictions', {
            'fields': ('applicable_products', 'applicable_users')
        }),
        ('Metadata', {
            'fields': ('seller', 'used_count', 'created_by', 'created_at')
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(seller=request.user)

@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ['coupon', 'user', 'discount_amount', 'used_at']
    list_filter = ['used_at']
    search_fields = ['coupon__code', 'user__email']
    readonly_fields = ['coupon', 'user', 'discount_amount', 'used_at']