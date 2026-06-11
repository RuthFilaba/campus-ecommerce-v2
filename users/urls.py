from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, UserMeView, 
    ChangePasswordView, LogoutView, UserStatsView,
    SellerVerificationStatusView, RequestVerificationView,
    SellerBadgeView, AdminVerificationListView,
    AdminApproveVerificationView, TopSellersView
)

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Profile endpoints
    path('me/', UserMeView.as_view(), name='user-me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    
    # Seller verification endpoints
    path('seller/verification/', SellerVerificationStatusView.as_view(), name='seller-verification'),
    path('seller/request-verification/', RequestVerificationView.as_view(), name='request-verification'),
    path('seller/<int:seller_id>/badge/', SellerBadgeView.as_view(), name='seller-badge'),
    
    # Admin verification endpoints
    path('admin/verification-requests/', AdminVerificationListView.as_view(), name='admin-verification-requests'),
    path('admin/verify-seller/<int:seller_id>/', AdminApproveVerificationView.as_view(), name='admin-verify-seller'),
    
    # Public endpoints
    path('top-sellers/', TopSellersView.as_view(), name='top-sellers'),
]