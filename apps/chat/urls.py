from django.urls import path
from .views import (
    MyChatsView, CreateThreadView, ThreadMessagesView,
    SendMessageView, UnreadCountView, MarkMessageReadView,
    ThreadOnlineStatusView
)

urlpatterns = [
    # Existing endpoints
    path('my-chats/', MyChatsView.as_view(), name='my-chats'),
    path('create-thread/', CreateThreadView.as_view(), name='create-thread'),
    path('unread-count/', UnreadCountView.as_view(), name='unread-count'),
    path('<int:thread_id>/messages/', ThreadMessagesView.as_view(), name='thread-messages'),
    path('send-message/', SendMessageView.as_view(), name='send-message'),
    
    # New real-time endpoints
    path('message/<int:message_id>/read/', MarkMessageReadView.as_view(), name='mark-message-read'),
    path('<int:thread_id>/online-status/', ThreadOnlineStatusView.as_view(), name='thread-online-status'),
]