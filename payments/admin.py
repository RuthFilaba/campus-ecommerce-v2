from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'user', 'amount', 'payment_method', 'status', 'transaction_reference', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['order__id', 'user__email', 'transaction_reference']
    readonly_fields = ['transaction_reference', 'created_at']
    
    fieldsets = (
        ('Order Information', {'fields': ('order', 'user', 'amount')}),
        ('Payment Details', {'fields': ('payment_method', 'status', 'transaction_reference', 'phone_number')}),
        ('Timestamps', {'fields': ('paid_at', 'created_at')}),
    )