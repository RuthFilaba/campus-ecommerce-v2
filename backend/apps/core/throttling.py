import time
from django.core.cache import cache
from django.http import JsonResponse

class IETFRateLimitMiddleware:
    """
    Sliding-window IP rate limiter enforcing 100 req/60 sec.
    Outputs standard IETF RateLimit-* headers and RFC 7807 429 payloads.
    """
    RATE_LIMIT = 100          # Maximum requests
    WINDOW_SECONDS = 60       # Window size

    def __init__(self, get_response):
        self.get_response = get_response

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '127.0.0.1')

    def __call__(self, request):
        # Exclude documentation assets from rate limiting
        if request.path.startswith('/api-docs') or request.path.startswith('/admin'):
            return self.get_response(request)

        ip = self._get_client_ip(request)
        current_time = int(time.time())
        window_bucket = current_time // self.WINDOW_SECONDS
        cache_key = f"ratelimit:{ip}:{window_bucket}"

        # Atomic increment in cache (in-memory or Redis)
        try:
            req_count = cache.incr(cache_key)
        except (ValueError, Exception):
            cache.set(cache_key, 1, timeout=self.WINDOW_SECONDS + 5)
            req_count = 1

        remaining = max(0, self.RATE_LIMIT - req_count)
        reset_time = (window_bucket + 1) * self.WINDOW_SECONDS
        retry_after = max(1, reset_time - current_time)

        # Breach condition: Return RFC 7807 HTTP 429
        if req_count > self.RATE_LIMIT:
            response_data = {
                "type": "https://api.campus-ecommerce.internal/errors/http-429",
                "title": "Too Many Requests",
                "status": 429,
                "detail": f"Rate limit of {self.RATE_LIMIT} requests per {self.WINDOW_SECONDS}s exceeded.",
                "instance": request.get_full_path(),
                "invalidParams": []
            }
            res = JsonResponse(response_data, status=429)
            res['Content-Type'] = 'application/problem+json'
            res['Retry-After'] = str(retry_after)
            res['RateLimit-Limit'] = str(self.RATE_LIMIT)
            res['RateLimit-Remaining'] = "0"
            res['RateLimit-Reset'] = str(reset_time)
            return res

        # Normal execution
        response = self.get_response(request)
        response['RateLimit-Limit'] = str(self.RATE_LIMIT)
        response['RateLimit-Remaining'] = str(remaining)
        response['RateLimit-Reset'] = str(reset_time)
        return response
