from rest_framework import serializers
from django.utils import timezone
from .models import Order, OrderHistory
from apps.products.models import Product

class OrderSerializer(serializers.ModelSerializer):
    buyer_name = serializers.SerializerMethodField()
    buyer_email = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()
    seller_email = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    can_complete = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()
    current_step = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['buyer', 'status', 'created_at', 'updated_at', 'total_price']
    
    def get_buyer_name(self, obj):
        return obj.buyer.get_full_name() or obj.buyer.email
    
    def get_buyer_email(self, obj):
        return obj.buyer.email
    
    def get_seller_name(self, obj):
        return obj.seller.get_full_name() or obj.seller.email
    
    def get_seller_email(self, obj):
        return obj.seller.email
    
    def get_product_name(self, obj):
        return obj.product.name
    
    def get_product_image(self, obj):
        return obj.product.image_url if obj.product.image_url else None
    
    def get_status_display(self, obj):
        return dict(Order.STATUS_CHOICES).get(obj.status, obj.status)
    
    def get_can_cancel(self, obj):
        return obj.can_cancel()
    
    def get_can_complete(self, obj):
        return obj.status == 'ready'
    
    def get_timeline(self, obj):
        return obj.get_timeline()
    
    def get_current_step(self, obj):
        return obj.get_current_step()

class CreateOrderSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    meetup_location = serializers.CharField(required=False, allow_blank=True)
    meetup_notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_product_id(self, value):
        try:
            product = Product.objects.get(id=value, is_approved=True, is_active=True)
            quantity = self.initial_data.get('quantity', 1)
            if product.stock < quantity:
                raise serializers.ValidationError(f"Only {product.stock} items available")
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found")

class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)

class MeetupSerializer(serializers.Serializer):
    meetup_location = serializers.CharField(required=True)
    meetup_time = serializers.DateTimeField(required=True)
    meetup_notes = serializers.CharField(required=False, allow_blank=True)

class CancelOrderSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)

class OrderHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderHistory
        fields = ['old_status', 'new_status', 'changed_by_name', 'notes', 'created_at']
    
    def get_changed_by_name(self, obj):
        return obj.changed_by.get_full_name() or obj.changed_by.email
