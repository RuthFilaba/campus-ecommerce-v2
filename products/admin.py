from django.contrib import admin
from django.utils.html import format_html
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'name', 'seller_info', 'price_display', 
        'stock', 'is_approved', 'is_active', 'image_preview', 'created_at', 'is_featured', 'featured_order',
    ]
    list_filter = ['is_approved', 'is_active', 'category', 'condition', 'is_featured']
    search_fields = ['name', 'description', 'seller__email']
    list_editable = ['is_approved', 'is_active']
    list_per_page = 20
    readonly_fields = ['created_at', 'updated_at', 'views_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'condition')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'stock')
        }),
        ('Images', {
            'fields': ('image_url', 'image_1', 'image_2', 'image_3')
        }),
        ('Seller Information', {
            'fields': ('seller',)
        }),
        ('Status', {
            'fields': ('is_submitted', 'is_approved', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'views_count')
        }),
        ('Featured Product', {
           'fields': ('is_featured', 'featured_order', 'featured_start_date', 'featured_end_date')
        }),
    )
    
    def seller_info(self, obj):
        return format_html(
            '<strong>{}</strong><br/><span style="color:gray;">{}</span>',
            obj.seller.get_full_name() or obj.seller.email,
            obj.seller.role
        )
    seller_info.short_description = 'Seller'
    
    def price_display(self, obj):
        return f"K{obj.price}"
    price_display.short_description = 'Price'
    
    def image_preview(self, obj):
        images = obj.get_images_list()
        if images:
            return format_html('<img src="{}" width="50" height="50" style="object-fit:cover;"/>', images[0])
        return '-'
    image_preview.short_description = 'Image'
    
    actions = ['approve_products', 'reject_products', 'activate_products', 'deactivate_products']
    
    def approve_products(self, request, queryset):
        count = queryset.update(is_approved=True, is_submitted=True)
        self.message_user(request, f"? {count} product(s) approved")
    approve_products.short_description = "? Approve selected products"
    
    def reject_products(self, request, queryset):
        count = queryset.update(is_approved=False, is_submitted=False)
        self.message_user(request, f"? {count} product(s) rejected")
    reject_products.short_description = "? Reject selected products"
    
    def activate_products(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"?? {count} product(s) activated")
    activate_products.short_description = "?? Activate selected products"
    
    def deactivate_products(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"?? {count} product(s) deactivated")
    deactivate_products.short_description = "?? Deactivate selected products"
