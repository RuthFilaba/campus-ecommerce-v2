from django.contrib import admin
from .models import ChatThread, Message

class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ['sender', 'receiver', 'message', 'is_read', 'created_at']
    can_delete = False
    max_num = 0

@admin.register(ChatThread)
class ChatThreadAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'buyer', 'seller', 'message_count', 'is_active', 'updated_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['product__name', 'buyer__email', 'seller__email']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [MessageInline]
    
    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = 'Messages'

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'thread', 'sender', 'receiver', 'message_preview', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['sender__email', 'receiver__email', 'message']
    readonly_fields = ['created_at', 'read_at']
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'