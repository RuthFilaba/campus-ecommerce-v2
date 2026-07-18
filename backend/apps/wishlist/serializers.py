from rest_framework import serializers
from .models import Wishlist, WishlistItem
from apps.products.serializers import ProductSerializer

class WishlistItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_details', 'added_at']
        read_only_fields = ['id', 'added_at']

class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'items', 'total_items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class AddToWishlistSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()

class RemoveFromWishlistSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()