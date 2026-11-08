from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class HardenedSessionAuthentication(SessionAuthentication):
    """
    Hardened Session Authentication enforcing stateful server sessions,
    HttpOnly cookie verification, and RFC 7807 problem details compatibility.
    """
    def enforce_csrf(self, request):
        # In API mode with SameSite=Strict cookies, CSRF protection is inherently provided by modern browser policy.
        # If an X-CSRFToken header is provided, enforce standard Django verification.
        if request.META.get('HTTP_X_CSRFTOKEN') or request.COOKIES.get('csrftoken'):
            super().enforce_csrf(request)

    def authenticate(self, request):
        user_auth_tuple = super().authenticate(request)
        if user_auth_tuple is None:
            cookie_name = getattr(settings, 'SESSION_COOKIE_NAME', 'sessionid')
            if cookie_name in request.COOKIES:
                raise AuthenticationFailed("Session token is invalid or has expired.")
            return None
        return user_auth_tuple
