import secrets
from django.conf import settings
from django.http import HttpResponsePermanentRedirect

class SecurityHeadersMiddleware:
    """
    Enforces HSTS (HTTP Strict Transport Security), Content-Security-Policy (CSP Level 3),
    and defense-in-depth HTTP security headers.
    Upgrades insecure HTTP requests to HTTPS when SSL redirect is active.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. SSL Redirection check
        if getattr(settings, 'SECURE_SSL_REDIRECT', False) and not request.is_secure():
            host = request.get_host().split(':')[0]
            https_port = getattr(settings, 'HTTPS_PORT', 8443)
            port_suffix = f":{https_port}" if https_port not in (443, 80) else ""
            url = f"https://{host}{port_suffix}{request.get_full_path()}"
            return HttpResponsePermanentRedirect(url)

        # Generate cryptographic CSP nonce for this request
        csp_nonce = secrets.token_urlsafe(16)
        request.csp_nonce = csp_nonce

        response = self.get_response(request)

        # 2. HSTS Header (RFC 6797)
        hsts_seconds = getattr(settings, 'SECURE_HSTS_SECONDS', 31536000)
        if hsts_seconds:
            hsts_header = f"max-age={hsts_seconds}"
            if getattr(settings, 'SECURE_HSTS_INCLUDE_SUBDOMAINS', True):
                hsts_header += "; includeSubDomains"
            if getattr(settings, 'SECURE_HSTS_PRELOAD', True):
                hsts_header += "; preload"
            response['Strict-Transport-Security'] = hsts_header

        # 3. Content-Security-Policy (CSP Level 3 with nonces)
        csp_directives = [
            "default-src 'self'",
            f"script-src 'self' 'nonce-{csp_nonce}' https://unpkg.com",
            f"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: https: blob: https://unpkg.com",
            "connect-src 'self' ws: wss:",
            "object-src 'none'",
            "base-uri 'self'",
            "frame-ancestors 'none'",
        ]
        response['Content-Security-Policy'] = "; ".join(csp_directives)

        # 4. Content security & frame protection
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        return response
