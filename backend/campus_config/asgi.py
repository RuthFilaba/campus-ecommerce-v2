"""
ASGI config for backend project.
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_config.settings')

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from apps.chat import consumers
from apps.core.websocket_auth import SessionHandshakeAuthMiddleware

# WebSocket URL patterns
websocket_urlpatterns = [
    path('ws/chat/<int:thread_id>/', consumers.ChatConsumer.as_asgi()),
    path('ws/chat/online/', consumers.OnlineStatusConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': SessionHandshakeAuthMiddleware(
        AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
    ),
})
