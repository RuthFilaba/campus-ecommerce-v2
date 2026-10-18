from django.db import models
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Min, Max
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from .models import Product
from .serializers import ProductSerializer, ProductCreateSerializer
import os
import time
import base64

class IsSellerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role == 'admin' or request.user.can_sell()

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'condition']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_approved=True, is_active=True)
        
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
        
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        sort_by = self.request.query_params.get('sort', '-created_at')
        valid_sort_fields = ['price', '-price', 'created_at', '-created_at', 'name', '-name']
        if sort_by in valid_sort_fields:
            queryset = queryset.order_by(sort_by)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        price_range = Product.objects.filter(is_approved=True, is_active=True).aggregate(
            min_price=Min('price'),
            max_price=Max('price')
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'results': serializer.data,
                'filters': {
                    'min_price': float(price_range['min_price'] or 0),
                    'max_price': float(price_range['max_price'] or 0),
                    'categories': dict(Product.CATEGORY_CHOICES),
                    'conditions': dict(Product.CONDITION_CHOICES),
                },
                'total': queryset.count()
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'filters': {
                'min_price': float(price_range['min_price'] or 0),
                'max_price': float(price_range['max_price'] or 0),
                'categories': dict(Product.CATEGORY_CHOICES),
                'conditions': dict(Product.CONDITION_CHOICES),
            },
            'total': queryset.count()
        })

class ProductCreateView(generics.CreateAPIView):
    serializer_class = ProductCreateSerializer
    permission_classes = [IsSellerOrAdmin]
    
    def perform_create(self, serializer):
        return serializer.save(seller=self.request.user, is_submitted=True)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = self.perform_create(serializer)
        
        read_serializer = ProductSerializer(product)
        return Response({
            'success': True,
            'message': 'Product submitted for admin approval',
            'product': read_serializer.data
        }, status=status.HTTP_201_CREATED)

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True, is_approved=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        product = self.get_object()
        product.views_count += 1
        product.save(update_fields=['views_count'])
        return response

class ProductUpdateView(generics.UpdateAPIView):
    serializer_class = ProductCreateSerializer
    permission_classes = [IsSellerOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Product.objects.all()
        return Product.objects.filter(seller=self.request.user)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        instance.is_approved = False
        instance.is_submitted = True
        instance.save()
        
        return Response({
            'success': True,
            'message': 'Product updated. Re-submitted for admin approval.',
            'product': ProductSerializer(instance).data
        })

class ProductDeleteView(generics.DestroyAPIView):
    permission_classes = [IsSellerOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Product.objects.all()
        return Product.objects.filter(seller=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        product_name = instance.name
        product_id = instance.id
        
        for i in range(1, 4):
            image_field = getattr(instance, f'image_{i}')
            if image_field:
                try:
                    image_field.delete(save=False)
                except Exception as e:
                    print(f"Could not delete image {i}: {e}")
        
        instance.delete()
        
        return Response({
            'success': True,
            'message': f'Product "{product_name}" has been permanently deleted',
            'deleted_product_id': product_id
        }, status=status.HTTP_200_OK)

class MyProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user)

class PendingProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        return Product.objects.filter(is_submitted=True, is_approved=False)

class ApproveProductView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            product.is_approved = True
            product.save()
            return Response({
                'success': True,
                'message': f'Product "{product.name}" has been approved'
            })
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

class RejectProductView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            reason = request.data.get('reason', '')
            product.is_approved = False
            product.is_submitted = False
            product.rejection_reason = reason
            product.save()
            return Response({
                'success': True,
                'message': f'Product "{product.name}" has been rejected'
            })
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

# ──────────────────────────────────────────────
# Seller Dashboard
# ──────────────────────────────────────────────

class SellerDashboardView(APIView):
    """
    Dashboard for authenticated sellers.
    Returns stats, recent orders, and low-stock alerts.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role not in ['seller', 'admin']:
            return Response({
                'stats': {
                    'revenue': 0,
                    'orders': 0,
                    'products': 0,
                    'customers': 0,
                    'new_orders': 0,
                    'messages': 0,
                    'payouts': 0,
                    'notifications': 0,
                },
                'recent_orders': [],
                'low_stock': [],
            })
        
        if user.role == 'admin':
            products = Product.objects.filter(is_active=True)
        else:
            products = Product.objects.filter(seller=user, is_active=True)
        
        total_products = products.count()
        low_stock_products = products.filter(stock__lte=3)
        
        stats = {
            'revenue': 0,
            'orders': 0,
            'products': total_products,
            'customers': 0,
            'new_orders': 0,
            'messages': 0,
            'payouts': 0,
            'notifications': 0,
        }
        
        recent_orders = []
        
        low_stock = [
            {
                'id': p.id,
                'name': p.name,
                'stock': p.stock,
            }
            for p in low_stock_products[:5]
        ]
        
        return Response({
            'stats': stats,
            'recent_orders': recent_orders,
            'low_stock': low_stock,
        })


class ProductImageUploadView(APIView):
    """
    Upload an image for a specific product.
    Supports multiple image uploads (max 3 images).
    """
    permission_classes = [IsSellerOrAdmin]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            
            # Check if user owns the product or is admin
            if request.user.role != 'admin' and product.seller != request.user:
                return Response(
                    {'error': 'You do not have permission to upload images for this product'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get the image from request
            image_file = request.FILES.get('image')
            if not image_file:
                return Response(
                    {'error': 'No image file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate file size (max 5MB)
            if image_file.size > 5 * 1024 * 1024:
                return Response(
                    {'error': 'Image size must be less than 5MB'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate file type
            valid_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if image_file.content_type not in valid_types:
                return Response(
                    {'error': 'Invalid file type. Please upload JPEG, PNG, GIF, or WEBP images.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Find the first available image slot
            image_slot = None
            for i in range(1, 4):
                image_field = getattr(product, f'image_{i}')
                if not image_field:
                    image_slot = i
                    break
            
            if not image_slot:
                return Response(
                    {'error': 'Maximum 3 images per product'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save the image
            image_field = getattr(product, f'image_{image_slot}')
            image_field.save(image_file.name, image_file, save=True)
            
            # Also set image_url if it's the first image
            if image_slot == 1:
                product.image_url = image_field.url
            
            product.save()
            
            return Response({
                'success': True,
                'message': f'Image uploaded successfully',
                'image_url': image_field.url,
                'image_slot': image_slot
            }, status=status.HTTP_200_OK)
            
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to upload image: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )