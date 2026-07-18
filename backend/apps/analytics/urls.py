from django.urls import path
from .views import seller_dashboard, sales_report, admin_dashboard

urlpatterns = [
    path('seller-dashboard/', seller_dashboard, name='seller-dashboard'),
    path('sales-report/', sales_report, name='sales-report'),
    path('admin-dashboard/', admin_dashboard, name='admin-dashboard'),
]