from rest_framework import serializers
from .models import ChatThread, Message
from apps.products.serializers import ProductSerializer
from apps.users.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_name', 'receiver', 'receiver_name',
            'message', 'is_read', 'is_mine', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']
    
    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.email
    
    def get_receiver_name(self, obj):
        return obj.receiver.get_full_name() or obj.receiver.email
    
    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender == request.user
        return False

class ChatThreadSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    product_details = ProductSerializer(source='product', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatThread
        fields = [
            'id', 'product', 'product_details', 'order',
            'buyer', 'seller', 'other_user', 'last_message',
            'unread_count', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_other_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other = obj.get_other_user(request.user)
            return {
                'id': other.id,
                'email': other.email,
                'full_name': other.get_full_name(),
                'role': other.role
            }
        return None
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'message': last_msg.message[:100],
                'created_at': last_msg.created_at,
                'sender_id': last_msg.sender_id,
                'is_read': last_msg.is_read
            }
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.unread_count(request.user)
        return 0

class CreateThreadSerializer(serializers.Serializer):
    """Create or get existing chat thread"""
    product_id = serializers.IntegerField()
    order_id = serializers.IntegerField(required=False)
    initial_message = serializers.CharField(max_length=2000, required=False)

class SendMessageSerializer(serializers.Serializer):
    """Send a message in a thread"""
    thread_id = serializers.IntegerField()
    message = serializers.CharField(max_length=2000)