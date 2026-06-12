import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatThread, Message
from users.models import User
from django.utils import timezone

class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat
    - Live message delivery
    - Read receipts
    - Typing indicators
    - Online status
    """
    
    async def connect(self):
        self.thread_id = self.scope['url_route']['kwargs']['thread_id']
        self.room_group_name = f'chat_{self.thread_id}'
        self.user = self.scope['user']
        
        # Check authentication
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
        
        # Send online status to other user
        other_user = await self.get_other_user()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'status': 'online',
                'username': self.user.get_full_name() or self.user.email,
            }
        )
        
        # Mark messages as read when user connects
        await self.mark_messages_read()
        
        # Send unread count to other user
        await self.send_unread_count()
    
    async def disconnect(self, close_code):
        # Send offline status to other user
        if hasattr(self, 'room_group_name') and hasattr(self, 'user'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status',
                    'user_id': self.user.id,
                    'status': 'offline',
                    'username': self.user.get_full_name() or self.user.email,
                }
            )
            
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Receive message from WebSocket"""
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'message')
        
        if message_type == 'message':
            # Regular chat message
            message = text_data_json['message']
            
            # Save message to database
            saved_message = await self.save_message(message)
            
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': saved_message['message'],
                    'message_id': saved_message['id'],
                    'sender_id': saved_message['sender_id'],
                    'sender_name': saved_message['sender_name'],
                    'created_at': saved_message['created_at'],
                    'is_read': saved_message['is_read'],
                }
            )
            
            # Send unread count update
            await self.send_unread_count()
            
        elif message_type == 'typing':
            # Typing indicator
            is_typing = text_data_json.get('is_typing', False)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user_id': self.user.id,
                    'user_name': self.user.get_full_name() or self.user.email,
                    'is_typing': is_typing,
                }
            )
            
        elif message_type == 'mark_read':
            # Mark messages as read
            message_id = text_data_json.get('message_id')
            await self.mark_single_message_read(message_id)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_read',
                    'message_id': message_id,
                    'reader_id': self.user.id,
                }
            )
    
    async def chat_message(self, event):
        """Send message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'message_id': event['message_id'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'created_at': event['created_at'],
            'is_read': event['is_read'],
            'is_mine': event['sender_id'] == self.user.id,
        }))
    
    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'user_name': event['user_name'],
            'is_typing': event['is_typing'],
        }))
    
    async def message_read(self, event):
        """Send read receipt to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id'],
            'reader_id': event['reader_id'],
        }))
    
    async def user_status(self, event):
        """Send user online/offline status"""
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'status': event['status'],
            'username': event['username'],
        }))
    
    @database_sync_to_async
    def is_user_authorized(self):
        try:
            thread = ChatThread.objects.get(id=self.thread_id)
            return thread.buyer == self.user or thread.seller == self.user
        except ChatThread.DoesNotExist:
            return False
    
    @database_sync_to_async
    def get_other_user(self):
        thread = ChatThread.objects.get(id=self.thread_id)
        return thread.get_other_user(self.user)
    
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
        
        # Update thread timestamp
        thread.save()
        
        return {
            'id': msg.id,
            'message': msg.message,
            'sender_id': msg.sender.id,
            'sender_name': msg.sender.get_full_name() or msg.sender.email,
            'created_at': msg.created_at.isoformat(),
            'is_read': msg.is_read,
        }
    
    @database_sync_to_async
    def mark_messages_read(self):
        thread = ChatThread.objects.get(id=self.thread_id)
        count = thread.messages.filter(receiver=self.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return count
    
    @database_sync_to_async
    def mark_single_message_read(self, message_id):
        try:
            message = Message.objects.get(id=message_id, receiver=self.user)
            if not message.is_read:
                message.is_read = True
                message.read_at = timezone.now()
                message.save()
                return True
        except Message.DoesNotExist:
            pass
        return False
    
    @database_sync_to_async
    def get_unread_count(self):
        thread = ChatThread.objects.get(id=self.thread_id)
        return thread.messages.filter(receiver=self.user, is_read=False).count()
    
    async def send_unread_count(self):
        unread_count = await self.get_unread_count()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'unread_update',
                'user_id': self.user.id,
                'unread_count': unread_count,
            }
        )
    
    async def unread_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'unread_update',
            'user_id': event['user_id'],
            'unread_count': event['unread_count'],
        }))


class OnlineStatusConsumer(AsyncWebsocketConsumer):
    """Track online status of users"""
    
    async def connect(self):
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.group_name = 'online_users'
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Broadcast online status
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'user_online',
                'user_id': self.user.id,
                'username': self.user.get_full_name() or self.user.email,
            }
        )
    
    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'user_offline',
                    'user_id': self.user.id,
                }
            )
            
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
    
    async def user_online(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_online',
            'user_id': event['user_id'],
            'username': event['username'],
        }))
    
    async def user_offline(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_offline',
            'user_id': event['user_id'],
        }))