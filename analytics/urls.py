from django.urls import path
from .views import SellerDashboardView, SalesReportView, AdminDashboardView

urlpatterns = [
    path('seller-dashboard/', SellerDashboardView.as_view(), name='seller-dashboard'),
    path('sales-report/', SalesReportView.as_view(), name='sales-report'),
    path('admin-dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
]