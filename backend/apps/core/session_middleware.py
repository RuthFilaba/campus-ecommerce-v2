import json
from django.conf import settings
from django.http import JsonResponse

class SessionSecurityMiddleware:
    """
    Validates session state and returns RFC 7807 401 Problem Details for expired or invalid sessions.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        cookie_name = getattr(settings, 'SESSION_COOKIE_NAME', 'sessionid')
        session_key = request.COOKIES.get(cookie_name)

        if session_key:
            # Check if this session exists and is still valid in backend store
            is_valid = False
            try:
                if hasattr(request, 'session') and request.session.session_key == session_key:
                    # Force retrieval from storage backend to confirm active session existence
                    session_data = request.session.load()
                    if session_data and ('_auth_user_id' in session_data or len(session_data) > 0):
                        is_valid = True
            except Exception:
                is_valid = False

            # If user provided a cookie that is expired or purged from store
            if not is_valid and request.path.startswith('/api/'):
                exempt_paths = ['/api/users/login/', '/api/users/register/', '/api/docs/']
                if not any(request.path.startswith(p) for p in exempt_paths):
                    if hasattr(request, 'session'):
                        try:
                            request.session._session_key = None
                            request.session._session_cache = {}
                        except Exception:
                            pass

                    response_payload = {
                        "type": "https://api.campus-ecommerce.internal/errors/http-401",
                        "title": "Unauthorized",
                        "status": 401,
                        "detail": "Session token is invalid or has expired.",
                        "instance": request.get_full_path(),
                        "invalidParams": []
                    }
                    response = JsonResponse(response_payload, status=401)
                    response['Content-Type'] = 'application/problem+json'
                    return response

        return self.get_response(request)
