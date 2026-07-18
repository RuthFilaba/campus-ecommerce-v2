from rest_framework import serializers
from .models import Coupon, CouponUsage
from apps.products.serializers import ProductSerializer


class CouponSerializer(serializers.ModelSerializer):
    discount_display = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()
    applicable_products_detail = ProductSerializer(source='applicable_products', many=True, read_only=True)
    
    class Meta:
        model = Coupon
        fields = '__all__'
        read_only_fields = ['used_count', 'created_at', 'created_by', 'seller']
    
    def get_discount_display(self, obj):
        return obj.get_discount_display()
    
    def get_is_valid(self, obj):
        is_valid, _ = obj.is_valid()
        return is_valid
    
    def get_seller_name(self, obj):
        return obj.seller.email if obj.seller else "Platform"


class ApplyCouponSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    cart_subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class CouponUsageSerializer(serializers.ModelSerializer):
    coupon_code = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = CouponUsage
        fields = ['id', 'coupon', 'coupon_code', 'user', 'user_email', 'discount_amount', 'used_at']
    
    def get_coupon_code(self, obj):
        return obj.coupon.code
    
    def get_user_email(self, obj):
        return obj.user.email


class CreateCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['code', 'description', 'discount_type', 'discount_value', 'minimum_order_amount', 
                  'maximum_discount', 'valid_from', 'valid_to', 'usage_limit', 'per_user_limit', 
                  'applicable_products', 'applicable_users', 'is_active']