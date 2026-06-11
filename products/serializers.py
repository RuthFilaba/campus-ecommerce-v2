from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    seller_name = serializers.SerializerMethodField()
    seller_email = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()
    condition_display = serializers.SerializerMethodField()
    is_featured = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['seller', 'is_submitted', 'is_approved', 'created_at', 'updated_at', 'views_count','is_featured', 'featured_order',]
    
    def get_seller_name(self, obj):
        return obj.seller.get_full_name() or obj.seller.email
    
    def get_seller_email(self, obj):
        return obj.seller.email
    
    def get_images(self, obj):
        return obj.get_images_list()
    
    def get_primary_image(self, obj):
        images = obj.get_images_list()
        return images[0] if images else None
    
    def get_category_display(self, obj):
        return dict(Product.CATEGORY_CHOICES).get(obj.category, obj.category)
    
    def get_condition_display(self, obj):
        return dict(Product.CONDITION_CHOICES).get(obj.condition, obj.condition)

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'category', 'condition', 'stock', 'image_url']

