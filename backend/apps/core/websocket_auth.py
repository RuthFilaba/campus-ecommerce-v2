from http.cookies import SimpleCookie

from channels.db import database_sync_to_async
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sessions.backends.db import SessionStore
from django.utils import timezone


class SessionHandshakeAuthMiddleware:
    """Reject invalid or unauthenticated session cookies before WebSocket routing."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "websocket":
            return await self.app(scope, receive, send)

        cookie = SimpleCookie()
        try:
            cookie.load(dict(scope.get("headers", [])).get(b"cookie", b"").decode("latin1"))
            morsel = cookie.get(settings.SESSION_COOKIE_NAME)
            session_key = morsel.value if morsel else None
            user = await self._get_session_user(session_key) if session_key else None
        except Exception:
            user = None

        if user is None or not user.is_active:
            await send({"type": "websocket.http.response.start", "status": 401, "headers": [(b"content-type", b"text/plain; charset=utf-8")]})
            await send({"type": "websocket.http.response.body", "body": b"Unauthorized"})
            return

        return await self.app(scope, receive, send)

    @staticmethod
    @database_sync_to_async
    def _get_session_user(session_key):
        store = SessionStore(session_key=session_key)
        if store.get_expiry_date() <= timezone.now():
            return None
        user_id = store.get("_auth_user_id")
        if not user_id:
            return None
        try:
            return get_user_model().objects.get(pk=user_id)
        except get_user_model().DoesNotExist:
            return None
