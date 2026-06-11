from django.urls import path
from .views import (
    MyChatsView, CreateThreadView, ThreadMessagesView,
    SendMessageView, MarkThreadReadView, UnreadCountView
)

urlpatterns = [
    path('my-chats/', MyChatsView.as_view(), name='my-chats'),
    path('create-thread/', CreateThreadView.as_view(), name='create-thread'),
    path('unread-count/', UnreadCountView.as_view(), name='unread-count'),
    path('<int:thread_id>/messages/', ThreadMessagesView.as_view(), name='thread-messages'),
    path('send-message/', SendMessageView.as_view(), name='send-message'),
    path('<int:thread_id>/mark-read/', MarkThreadReadView.as_view(), name='mark-read'),
]