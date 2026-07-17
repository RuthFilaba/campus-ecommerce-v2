from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer, AddToWishlistSerializer, RemoveFromWishlistSerializer
from apps.products.models import Product

class GetOrCreateWishlistMixin:
    def get_wishlist(self, user):
        wishlist, created = Wishlist.objects.get_or_create(user=user)
        return wishlist

class WishlistView(APIView, GetOrCreateWishlistMixin):
    """
    Get user's wishlist
    Shneiderman Rule 8: Reduce memory load - saved items
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        wishlist = self.get_wishlist(request.user)
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data)

class AddToWishlistView(APIView, GetOrCreateWishlistMixin):
    """
    Add product to wishlist
    Norman's Feedback: Confirmation when added
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = AddToWishlistSerializer(data=request.data)
        if serializer.is_valid():
            product = get_object_or_404(
                Product, 
                id=serializer.validated_data['product_id'],
                is_active=True
            )
            
            # Cannot wishlist your own product
            if product.seller == request.user:
                return Response({
                    'error': 'You cannot add your own product to wishlist'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            wishlist = self.get_wishlist(request.user)
            created = wishlist.add_product(product)
            
            if created:
                return Response({
                    'success': True,
                    'message': f'Added "{product.name}" to your wishlist',
                    'in_wishlist': True
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'message': f'"{product.name}" is already in your wishlist',
                    'in_wishlist': True
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RemoveFromWishlistView(APIView, GetOrCreateWishlistMixin):
    """
    Remove product from wishlist
    Shneiderman Rule 6: Easy reversal - can remove anytime
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        serializer = RemoveFromWishlistSerializer(data=request.data)
        if serializer.is_valid():
            product = get_object_or_404(Product, id=serializer.validated_data['product_id'])
            wishlist = self.get_wishlist(request.user)
            wishlist.remove_product(product)
            
            return Response({
                'success': True,
                'message': f'Removed "{product.name}" from your wishlist',
                'in_wishlist': False
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckInWishlistView(APIView, GetOrCreateWishlistMixin):
    """
    Check if product is in wishlist
    Norman's Visibility: Show wishlist status
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        wishlist = self.get_wishlist(request.user)
        in_wishlist = wishlist.has_product(product)
        
        return Response({
            'product_id': product_id,
            'in_wishlist': in_wishlist
        })

class ClearWishlistView(APIView, GetOrCreateWishlistMixin):
    """
    Clear entire wishlist
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        wishlist = self.get_wishlist(request.user)
        count = wishlist.items.count()
        wishlist.clear()
        
        return Response({
            'success': True,
            'message': f'Cleared {count} items from your wishlist'
        }, status=status.HTTP_200_OK)