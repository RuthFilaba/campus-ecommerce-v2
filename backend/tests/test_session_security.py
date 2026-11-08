from django.test import SimpleTestCase, Client
from django.conf import settings
from django.contrib.sessions.backends.db import SessionStore
import json

class SessionSecurityAndTLSTests(SimpleTestCase):
    def setUp(self):
        self.client = Client()

    def test_hsts_and_defense_in_depth_headers_enforced(self):
        """Task 1: Verify Strict-Transport-Security (HSTS) and security headers."""
        response = self.client.get('/api-docs/')
        self.assertEqual(response.status_code, 200)

        # HSTS (RFC 6797)
        hsts_header = response.headers.get('Strict-Transport-Security', '')
        self.assertIn('max-age=31536000', hsts_header)
        self.assertIn('includeSubDomains', hsts_header)
        self.assertIn('preload', hsts_header)

        # Defense-in-depth headers
        self.assertEqual(response.headers.get('X-Content-Type-Options'), 'nosniff')
        self.assertEqual(response.headers.get('X-Frame-Options'), 'DENY')
        self.assertEqual(response.headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin')

    def test_session_cookie_security_flags(self):
        """Task 2: Verify configured cookie attributes for XSS and CSRF prevention."""
        self.assertTrue(settings.SESSION_COOKIE_HTTPONLY, "SESSION_COOKIE_HTTPONLY must be True to prevent XSS token theft")
        self.assertEqual(settings.SESSION_COOKIE_SAMESITE, 'Strict', "SESSION_COOKIE_SAMESITE must be 'Strict' to mitigate CSRF")
        self.assertEqual(settings.SESSION_COOKIE_AGE, 1800, "Session timeout must be 1800 seconds (30 minutes)")

    def test_logout_endpoint_flushes_session_and_clears_cookie(self):
        """Task 3: Verify POST /api/users/logout/ invalidates session and explicitly expires cookie."""
        response = self.client.post('/api/users/logout/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('Successfully logged out', data.get('message'))

        # Verify cookie expiration
        cookie_header = response.cookies.get(settings.SESSION_COOKIE_NAME)
        self.assertIsNotNone(cookie_header)
        self.assertEqual(cookie_header.get('max-age'), 0)
        self.assertTrue(cookie_header.get('httponly'))
        self.assertEqual(cookie_header.get('samesite'), 'Strict')

    def test_invalid_session_token_returns_rfc7807_401(self):
        """Task 3: Middleware intercepts invalid/expired session cookie and returns RFC 7807 401."""
        self.client.cookies[settings.SESSION_COOKIE_NAME] = 'forged_expired_session_token_xyz'
        response = self.client.get('/api/orders/')

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.headers.get('Content-Type'), 'application/problem+json')
        body = response.json()
        self.assertEqual(body.get('status'), 401)
        self.assertEqual(body.get('title'), 'Unauthorized')
        self.assertIn('invalid or has expired', body.get('detail', ''))
        self.assertIn('/api/orders/', body.get('instance', ''))
