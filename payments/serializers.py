from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    payment_method_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'transaction_reference', 'created_at']
    
    def get_payment_method_display(self, obj):
        return dict(Payment.PAYMENT_METHOD).get(obj.payment_method, obj.payment_method)
    
    def get_status_display(self, obj):
        return dict(Payment.PAYMENT_STATUS).get(obj.status, obj.status)

class CreatePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=[m[0] for m in Payment.PAYMENT_METHOD])
    phone_number = serializers.CharField(required=False, allow_blank=True)