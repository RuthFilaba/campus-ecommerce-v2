from django.urls import path
from .views import (
    ApplyCouponView, RemoveCouponView, ListCouponsView,
    AdminCouponListView, AdminCouponDetailView, CouponUsageView,
    SellerCouponListView, SellerCouponDetailView, SellerCouponStatsView
)

urlpatterns = [
    # User endpoints
    path('apply/', ApplyCouponView.as_view(), name='apply-coupon'),
    path('remove/', RemoveCouponView.as_view(), name='remove-coupon'),
    path('', ListCouponsView.as_view(), name='list-coupons'),
    
    # Seller endpoints
    path('seller/', SellerCouponListView.as_view(), name='seller-coupons'),
    path('seller/stats/', SellerCouponStatsView.as_view(), name='seller-coupon-stats'),
    path('seller/<int:pk>/', SellerCouponDetailView.as_view(), name='seller-coupon-detail'),
    
    # Admin endpoints
    path('admin/', AdminCouponListView.as_view(), name='admin-coupons'),
    path('admin/<int:pk>/', AdminCouponDetailView.as_view(), name='admin-coupon-detail'),
    path('usage/', CouponUsageView.as_view(), name='coupon-usage'),
]