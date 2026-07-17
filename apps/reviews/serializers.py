from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    reviewer_email = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()
    rating_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['reviewer', 'created_at', 'updated_at']
    
    def get_reviewer_name(self, obj):
        return obj.reviewer.get_full_name() or obj.reviewer.email
    
    def get_reviewer_email(self, obj):
        return obj.reviewer.email
    
    def get_seller_name(self, obj):
        return obj.seller.get_full_name() or obj.seller.email
    
    def get_rating_display(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        return f"{stars} ({obj.rating}/5)"

class CreateReviewSerializer(serializers.Serializer):
    order = serializers.IntegerField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True)
    product_quality = serializers.IntegerField(min_value=1, max_value=5, required=False)
    communication = serializers.IntegerField(min_value=1, max_value=5, required=False)
    meetup_punctuality = serializers.IntegerField(min_value=1, max_value=5, required=False)
    
    def validate_order(self, value):
        from orders.models import Order
        try:
            order = Order.objects.get(id=value)
            return order
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")