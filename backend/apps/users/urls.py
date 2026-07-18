from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, UserMeView, ChangePasswordView,
    UserStatsView, AllUsersView, UserDetailView, UpdateUserRoleView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # User Profile
    path('me/', UserMeView.as_view(), name='user-me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    
    # Admin User Management
    path('all/', AllUsersView.as_view(), name='all-users'),
    path('<int:user_id>/', UserDetailView.as_view(), name='user-detail'),
    path('<int:user_id>/role/', UpdateUserRoleView.as_view(), name='update-role'),
]