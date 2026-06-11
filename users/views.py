from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import User
from .serializers import RegisterSerializer, UserSerializer, ChangePasswordSerializer, UpdateProfileSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        user.reset_failed_logins()
        
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
            return Response({
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            
            if user.is_locked():
                remaining = user.get_remaining_lockout_minutes()
                return Response({
                    'error': f'Account locked. Try again in {remaining} minutes.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if user.check_password(password):
                user.reset_failed_logins()
                
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'success': True,
                    'message': f'Welcome back, {user.get_full_name()}!',
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                })
            else:
                user.increment_failed_logins()
                remaining_attempts = 5 - user.failed_login_attempts
                
                return Response({
                    'error': f'Invalid credentials. {remaining_attempts} attempts remaining.'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

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
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({
                    'error': 'Current password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.last_password_change = timezone.now()
            user.save()
            
            return Response({
                'success': True,
                'message': 'Password changed successfully. Please login again.'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'success': True,
                'message': 'Logged out successfully'
            })
        except Exception:
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)

class UserStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        return Response({
            'total_purchases': user.total_purchases,
            'total_sales': user.total_sales,
            'average_rating': float(user.rating),
            'review_count': user.review_count,
            'member_since': user.created_at,
            'is_verified_seller': user.is_campus_verified and user.role == 'seller'
        })

class SellerVerificationStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role != 'seller':
            return Response({'error': 'Only sellers can access verification status'}, status=403)
        
        badge_display = {
            'basic': 'Basic Member',
            'campus': 'Campus Verified',
            'verified': 'Verified Seller',
            'premium': 'Premium Seller'
        }.get(user.verification_level, 'Basic Member')
        
        badge_icon = {
            'basic': '🟢',
            'campus': '🏫',
            'verified': '✅',
            'premium': '⭐'
        }.get(user.verification_level, '🟢')
        
        return Response({
            'success': True,
            'verification': {
                'verification_level': user.verification_level,
                'is_verified_seller': user.is_verified_seller,
                'badge_display': badge_display,
                'badge_icon': badge_icon,
            },
            'stats': {
                'total_reviews': user.review_count,
                'average_rating': float(user.rating),
                'total_sales': user.total_sales,
            },
            'requirements': []
        })

class RequestVerificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if user.role != 'seller':
            return Response({'error': 'Only sellers can request verification'}, status=403)
        
        user.verification_requested_at = timezone.now()
        user.verification_notes = request.data.get('notes', '')
        user.save()
        
        return Response({
            'success': True,
            'message': 'Verification request submitted. Admin will review your application.',
            'requested_at': user.verification_requested_at
        })

class SellerBadgeView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, seller_id):
        seller = get_object_or_404(User, id=seller_id, role='seller')
        
        badge_display = {
            'basic': 'Basic Member',
            'campus': 'Campus Verified',
            'verified': 'Verified Seller',
            'premium': 'Premium Seller'
        }.get(seller.verification_level, 'Basic Member')
        
        badge_icon = {
            'basic': '🟢',
            'campus': '🏫',
            'verified': '✅',
            'premium': '⭐'
        }.get(seller.verification_level, '🟢')
        
        return Response({
            'seller_id': seller.id,
            'seller_name': seller.get_full_name(),
            'badge': {
                'verification_level': seller.verification_level,
                'badge_display': badge_display,
                'badge_icon': badge_icon,
            },
            'stats': {
                'total_reviews': seller.review_count,
                'average_rating': float(seller.rating),
                'total_sales': seller.total_sales,
            }
        })

class AdminVerificationListView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        pending_sellers = User.objects.filter(
            role='seller',
            verification_level='basic',
            verification_requested_at__isnull=False
        )
        
        data = []
        for seller in pending_sellers:
            data.append({
                'id': seller.id,
                'email': seller.email,
                'name': seller.get_full_name(),
                'requested_at': seller.verification_requested_at,
                'notes': seller.verification_notes,
                'stats': {
                    'sales': seller.total_sales,
                    'reviews': seller.review_count,
                    'rating': float(seller.rating),
                }
            })
        
        return Response({'pending_requests': data})

class AdminApproveVerificationView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, seller_id):
        seller = get_object_or_404(User, id=seller_id, role='seller')
        
        verification_level = request.data.get('verification_level', 'campus')
        notes = request.data.get('notes', '')
        
        seller.verification_level = verification_level
        seller.is_verified_seller = verification_level in ['campus', 'verified', 'premium']
        seller.verified_at = timezone.now()
        seller.verification_notes = notes
        seller.save()
        
        return Response({
            'success': True,
            'message': f'Seller {seller.email} verified as {verification_level} level',
            'verification_level': verification_level
        })

class TopSellersView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        top_sellers = User.objects.filter(
            role='seller',
            is_verified_seller=True
        ).order_by('-rating', '-total_sales')[:10]
        
        data = []
        for seller in top_sellers:
            data.append({
                'id': seller.id,
                'name': seller.get_full_name(),
                'rating': float(seller.rating),
                'total_sales': seller.total_sales,
                'review_count': seller.review_count,
                'verification_level': seller.verification_level,
            })
        
        return Response({'top_sellers': data})