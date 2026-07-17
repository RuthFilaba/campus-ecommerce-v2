from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import generics, status, permissions
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from .models import Coupon, CouponUsage
from .serializers import CouponSerializer, ApplyCouponSerializer, CouponUsageSerializer, CreateCouponSerializer
from apps.cart.models import Cart


class IsSellerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['seller', 'admin']


class ApplyCouponView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ApplyCouponSerializer(data=request.data)
        if serializer.is_valid():
            code = serializer.validated_data['code'].upper()
            cart_subtotal = serializer.validated_data.get('cart_subtotal', 0)
            
            try:
                coupon = Coupon.objects.get(code=code, is_active=True)
            except Coupon.DoesNotExist:
                return Response({'error': 'Invalid coupon code', 'valid': False}, status=404)
            
            cart = Cart.objects.filter(user=request.user).first()
            products = [item.product for item in cart.items.all()] if cart else []
            
            is_valid, message = coupon.is_valid(user=request.user, cart_subtotal=cart_subtotal, products=products)
            
            if not is_valid:
                return Response({'error': message, 'valid': False}, status=400)
            
            discount = coupon.calculate_discount(cart_subtotal)
            request.session['applied_coupon'] = code
            request.session['coupon_discount'] = float(discount)
            
            return Response({
                'success': True,
                'message': f'Coupon "{code}" applied!',
                'valid': True,
                'coupon': {
                    'code': coupon.code,
                    'discount_type': coupon.discount_type,
                    'discount_value': float(coupon.discount_value),
                    'discount_display': coupon.get_discount_display(),
                    'discount_amount': float(discount),
                    'new_total': float(cart_subtotal - discount)
                }
            })
        return Response(serializer.errors, status=400)


class RemoveCouponView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        if 'applied_coupon' in request.session:
            code = request.session.pop('applied_coupon')
            request.session.pop('coupon_discount', None)
            return Response({'success': True, 'message': f'Coupon "{code}" removed'})
        return Response({'success': False, 'message': 'No coupon applied'})


class ListCouponsView(generics.ListAPIView):
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        now = timezone.now()
        return Coupon.objects.filter(is_active=True, seller__isnull=True, valid_from__lte=now, valid_to__gte=now)


class SellerCouponListView(generics.ListCreateAPIView):
    serializer_class = CreateCouponSerializer
    permission_classes = [IsSellerOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Coupon.objects.filter(seller__isnull=False)
        return Coupon.objects.filter(seller=user)
    
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user, created_by=self.request.user)


class SellerCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CreateCouponSerializer
    permission_classes = [IsSellerOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Coupon.objects.filter(seller__isnull=False)
        return Coupon.objects.filter(seller=user)


class SellerCouponStatsView(APIView):
    permission_classes = [IsSellerOrAdmin]
    
    def get(self, request):
        user = request.user
        if user.role == 'admin':
            coupons = Coupon.objects.filter(seller__isnull=False)
        else:
            coupons = Coupon.objects.filter(seller=user)
        
        now = timezone.now()
        active = coupons.filter(is_active=True, valid_from__lte=now, valid_to__gte=now).count()
        used = coupons.aggregate(total=models.Sum('used_count'))['total'] or 0
        usages = CouponUsage.objects.filter(coupon__in=coupons)
        revenue = float(usages.aggregate(total=models.Sum('discount_amount'))['total'] or 0)
        expired = coupons.filter(valid_to__lt=now).count()
        
        return Response({'active': active, 'used': used, 'revenue': revenue, 'expired': expired})


class AdminCouponListView(generics.ListCreateAPIView):
    serializer_class = CreateCouponSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Coupon.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AdminCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CreateCouponSerializer
    permission_classes = [IsAdminUser]
    queryset = Coupon.objects.all()


class CouponUsageView(generics.ListAPIView):
    serializer_class = CouponUsageSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return CouponUsage.objects.all().order_by('-used_at')[:50]