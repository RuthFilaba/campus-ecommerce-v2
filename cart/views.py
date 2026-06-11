from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer
from products.models import Product

class GetOrCreateCartMixin:
    def get_cart(self, user):
        cart, created = Cart.objects.get_or_create(user=user)
        return cart

class CartView(APIView, GetOrCreateCartMixin):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cart = self.get_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class AddToCartView(APIView, GetOrCreateCartMixin):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            product = get_object_or_404(Product, id=serializer.validated_data['product_id'])
            quantity = serializer.validated_data['quantity']
            
            if product.stock < quantity:
                return Response({'error': f'Only {product.stock} items available'}, status=400)
            
            cart = self.get_cart(request.user)
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )
            
            if not created:
                new_quantity = cart_item.quantity + quantity
                if product.stock < new_quantity:
                    return Response({'error': f'Only {product.stock - cart_item.quantity} more available'}, status=400)
                cart_item.quantity = new_quantity
                cart_item.save()
            
            return Response({
                'message': f'Added {quantity} x {product.name} to cart',
                'cart': CartSerializer(cart).data
            }, status=201)
        
        return Response(serializer.errors, status=400)

class UpdateCartItemView(APIView, GetOrCreateCartMixin):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, item_id):
        cart = self.get_cart(request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        
        serializer = UpdateCartItemSerializer(data=request.data)
        if serializer.is_valid():
            new_quantity = serializer.validated_data['quantity']
            
            if new_quantity == 0:
                cart_item.delete()
                message = 'Item removed from cart'
            else:
                if cart_item.product.stock < new_quantity:
                    return Response({'error': f'Only {cart_item.product.stock} items available'}, status=400)
                cart_item.quantity = new_quantity
                cart_item.save()
                message = f'Quantity updated to {new_quantity}'
            
            return Response({
                'message': message,
                'cart': CartSerializer(cart).data
            })
        
        return Response(serializer.errors, status=400)

class RemoveFromCartView(APIView, GetOrCreateCartMixin):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, item_id):
        cart = self.get_cart(request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        
        return Response({
            'message': 'Item removed from cart',
            'cart': CartSerializer(cart).data
        })

class ClearCartView(APIView, GetOrCreateCartMixin):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        cart = self.get_cart(request.user)
        cart.clear()
        
        return Response({
            'message': 'Cart cleared successfully',
            'cart': CartSerializer(cart).data
        })