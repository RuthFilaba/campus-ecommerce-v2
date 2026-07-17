from django.contrib import admin
from .models import DailySalesReport, SellerPerformance, ProductPerformance, CategorySalesSummary, UserActivityLog

@admin.register(DailySalesReport)
class DailySalesReportAdmin(admin.ModelAdmin):
    list_display = ['report_date', 'total_orders', 'completed_orders', 'total_revenue', 'average_order_value']
    list_filter = ['report_date']
    search_fields = ['report_date']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(SellerPerformance)
class SellerPerformanceAdmin(admin.ModelAdmin):
    list_display = ['seller', 'report_date', 'total_sales', 'total_revenue', 'average_rating']
    list_filter = ['report_date']
    search_fields = ['seller__email']

@admin.register(ProductPerformance)
class ProductPerformanceAdmin(admin.ModelAdmin):
    list_display = ['product', 'report_date', 'units_sold', 'revenue', 'views_count']
    list_filter = ['report_date']
    search_fields = ['product__name']

@admin.register(CategorySalesSummary)
class CategorySalesSummaryAdmin(admin.ModelAdmin):
    list_display = ['category', 'report_date', 'total_orders', 'total_revenue', 'percentage_of_total']
    list_filter = ['report_date', 'category']

@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'created_at', 'ip_address']
    list_filter = ['action', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at']