import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatThread, Message
from users.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat
    Norman's Feedback: Instant message delivery
    Shneiderman Rule 3: Real-time typing indicators
    """
    
    async def connect(self):
        self.thread_id = self.scope['url_route']['kwargs']['thread_id']
        self.room_group_name = f'chat_{self.thread_id}'
        self.user = self.scope['user']
        
        # Check if user is authorized
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Verify user is part of the chat
        if not await self.is_user_authorized():
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Receive message from WebSocket"""
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        
        # Save message to database
        saved_message = await self.save_message(message)
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': saved_message['message'],
                'sender_id': saved_message['sender_id'],
                'sender_name': saved_message['sender_name'],
                'created_at': saved_message['created_at'],
            }
        )
    
    async def chat_message(self, event):
        """Send message to WebSocket"""
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'created_at': event['created_at'],
        }))
    
    @database_sync_to_async
    def is_user_authorized(self):
        try:
            thread = ChatThread.objects.get(id=self.thread_id)
            return thread.buyer == self.user or thread.seller == self.user
        except ChatThread.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, message):
        thread = ChatThread.objects.get(id=self.thread_id)
        receiver = thread.get_other_user(self.user)
        
        msg = Message.objects.create(
            thread=thread,
            sender=self.user,
            receiver=receiver,
            message=message
        )
        
        return {
            'message': msg.message,
            'sender_id': msg.sender.id,
            'sender_name': msg.sender.get_full_name() or msg.sender.email,
            'created_at': msg.created_at.isoformat(),
        }