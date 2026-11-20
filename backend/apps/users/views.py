from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.contrib.auth import login, logout
from .models import User
from .serializers import (
    RegisterSerializer, UserSerializer, UpdateProfileSerializer,
    ChangePasswordSerializer, AdminUserUpdateSerializer, UserListSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': f'Welcome {user.get_full_name()}! Registration successful.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password required'}, status=400)
        
        try:
            user = User.objects.get(email=email)
            
            if user.is_locked():
                remaining = (user.locked_until - timezone.now()).seconds // 60
                return Response({
                    'error': f'Account locked. Try again in {remaining} minutes.'
                }, status=401)
            
            if user.check_password(password):
                user.reset_failed_logins()
                user.update_last_active()
                
                # Stateful session establishment
                login(request, user)
                session_age = getattr(settings, 'SESSION_COOKIE_AGE', 1800)
                request.session.set_expiry(session_age)
                
                refresh = RefreshToken.for_user(user)
                
                response = Response({
                    'success': True,
                    'message': f'Welcome back, {user.get_full_name()}!',
                    'user': UserSerializer(user).data,
                    'session_key': request.session.session_key,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                })

                # Attach hardened session cookie (HttpOnly=True, SameSite=Strict, Secure)
                cookie_name = getattr(settings, 'SESSION_COOKIE_NAME', 'sessionid')
                is_secure = request.is_secure() or getattr(settings, 'SESSION_COOKIE_SECURE', False)
                samesite_setting = getattr(settings, 'SESSION_COOKIE_SAMESITE', 'Strict')

                response.set_cookie(
                    key=cookie_name,
                    value=request.session.session_key,
                    max_age=session_age,
                    path='/',
                    domain=getattr(settings, 'SESSION_COOKIE_DOMAIN', None),
                    secure=is_secure,
                    httponly=True,
                    samesite=samesite_setting,
                )
                return response
            else:
                user.increment_failed_logins()
                remaining = 5 - user.failed_login_attempts
                return Response({
                    'error': f'Invalid credentials. {remaining} attempts remaining.'
                }, status=401)
                
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=401)


class LogoutView(APIView):
    """
    Explicit server-side session revocation endpoint.
    Flushes active session record from backend store and clears client cookie.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if hasattr(request, 'session') and request.session:
            request.session.flush()
        logout(request)

        response = Response({
            'success': True,
            'message': 'Successfully logged out. Session invalidated.'
        }, status=status.HTTP_200_OK)

        cookie_name = getattr(settings, 'SESSION_COOKIE_NAME', 'sessionid')
        is_secure = request.is_secure() or getattr(settings, 'SESSION_COOKIE_SECURE', False)
        samesite_setting = getattr(settings, 'SESSION_COOKIE_SAMESITE', 'Strict')

        response.delete_cookie(
            key=cookie_name,
            path='/',
            samesite=samesite_setting
        )
        response.set_cookie(
            key=cookie_name,
            value='',
            max_age=0,
            expires='Thu, 01 Jan 1970 00:00:00 GMT',
            path='/',
            httponly=True,
            secure=is_secure,
            samesite=samesite_setting
        )
        return response

class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({
            'success': True,
            'user': UserSerializer(request.user).data
        })
    
    def patch(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'user': UserSerializer(request.user).data
            })
        return Response(serializer.errors, status=400)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Current password is incorrect'}, status=400)
            
            user.set_password(serializer.validated_data['new_password'])
            user.last_password_change = timezone.now()
            user.save()
            
            return Response({
                'success': True,
                'message': 'Password changed successfully'
            })
        return Response(serializer.errors, status=400)

class UserStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        return Response({
            'total_purchases': user.total_purchases,
            'total_sales': user.total_sales,
            'average_rating': float(user.rating),
            'review_count': user.review_count,
            'trust_score': user.trust_score,
            'member_since': user.created_at,
            'last_active': user.last_active,
            'verification_status': {
                'email': user.is_verified,
                'campus': user.is_campus_verified,
                'phone': user.is_phone_verified,
            },
            'role_info': {
                'name': user.get_role_display(),
                'badge': user.get_role_badge(),
                'can_sell': user.can_sell(),
                'can_buy': user.can_buy(),
            }
        })

class AllUsersView(generics.ListAPIView):
    """Admin view to list all users with filters"""
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = User.objects.all()
        
        # Filter by role
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        # Filter by verification status
        verified = self.request.query_params.get('verified')
        if verified == 'true':
            queryset = queryset.filter(is_verified=True)
        elif verified == 'false':
            queryset = queryset.filter(is_verified=False)
        
        # Search by email or name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        return queryset.order_by('-created_at')

class UserDetailView(APIView):
    """Admin view to get, update, or delete a specific user"""
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
    
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': f'User {user.email} updated successfully',
                    'user': UserSerializer(user).data
                })
            return Response(serializer.errors, status=400)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
    
    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            email = user.email
            user.delete()
            return Response({
                'success': True,
                'message': f'User {email} deleted successfully'
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class UpdateUserRoleView(APIView):
    """Admin view to update user role"""
    permission_classes = [permissions.IsAdminUser]
    
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            new_role = request.data.get('role')
            
            if new_role not in ['buyer', 'seller', 'admin', 'moderator', 'support']:
                return Response({'error': 'Invalid role'}, status=400)
            
            user.role = new_role
            user.save()
            
            return Response({
                'success': True,
                'message': f'User {user.email} role changed to {new_role}',
                'user': UserSerializer(user).data
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)