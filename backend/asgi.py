"""
ASGI config for backend project.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from chat import consumers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# WebSocket URL patterns
websocket_urlpatterns = [
    path('ws/chat/<int:thread_id>/', consumers.ChatConsumer.as_asgi()),
    path('ws/chat/online/', consumers.OnlineStatusConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})