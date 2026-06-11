from django.contrib import admin
from .models import Order, OrderHistory

class OrderHistoryInline(admin.TabularInline):
    model = OrderHistory
    extra = 0
    readonly_fields = ['old_status', 'new_status', 'changed_by', 'notes', 'created_at']
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'buyer', 'seller', 'quantity', 'total_price', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['product__name', 'buyer__email', 'seller__email']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at', 'total_price']
    inlines = [OrderHistoryInline]
    
    fieldsets = (
        ('Order Information', {'fields': ('product', 'quantity', 'unit_price', 'total_price')}),
        ('Parties', {'fields': ('buyer', 'seller')}),
        ('Status', {'fields': ('status', 'completed_at', 'cancelled_at')}),
        ('Meetup Details', {'fields': ('meetup_location', 'meetup_time', 'meetup_notes')}),
    )

@admin.register(OrderHistory)
class OrderHistoryAdmin(admin.ModelAdmin):
    list_display = ['order', 'old_status', 'new_status', 'changed_by', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['order', 'old_status', 'new_status', 'changed_by', 'notes', 'created_at']