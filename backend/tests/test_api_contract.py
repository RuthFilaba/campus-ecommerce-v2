import json
from django.test import SimpleTestCase, Client
from django.core.cache import cache

class OpenAPIContractAndSecurityTests(SimpleTestCase):
    def setUp(self):
        self.client = Client()
        cache.clear()

    def test_registration_malformed_json_returns_rfc7807_400(self):
        """Malformed JSON syntax must return HTTP 400 with RFC 7807 problem details."""
        raw_malformed = '{"email": "student@campus.edu", "password": '
        response = self.client.post(
            '/api/users/register/',
            data=raw_malformed,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.headers.get('Content-Type'), 'application/problem+json')
        data = response.json()
        self.assertEqual(data.get('status'), 400)
        self.assertIn("Malformed JSON Syntax", data.get('title', ''))
        self.assertIn('/api/users/register/', data.get('instance', ''))

    def test_registration_unexpected_parameter_rejected_422(self):
        """Additional properties outside schema must be rejected with HTTP 422 under RFC 7807."""
        payload = {
            "email": "john.student@campus.edu",
            "password": "ValidPassword123!",
            "firstName": "John",
            "lastName": "Doe",
            "campusRole": "student",
            "isAdmin": True  # Injected property violating additionalProperties: false
        }
        response = self.client.post(
            '/api/users/register/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.headers.get('Content-Type'), 'application/problem+json')
        data = response.json()
        self.assertEqual(data.get('status'), 422)
        self.assertTrue(any("isAdmin" in param.get('reason', '') for param in data.get('invalidParams', [])))

    def test_swagger_ui_documentation_portal_accessible(self):
        """Interactive documentation must be served at /api-docs/ and openapi.json available."""
        doc_resp = self.client.get('/api-docs/')
        self.assertEqual(doc_resp.status_code, 200)
        self.assertIn(b"SwaggerUIBundle", doc_resp.content)

        spec_resp = self.client.get('/api-docs/openapi.json')
        self.assertEqual(spec_resp.status_code, 200)
        spec_data = spec_resp.json()
        self.assertEqual(spec_data.get('openapi'), '3.1.0')
        self.assertIn('components', spec_data)

    def test_rate_limiting_triggers_http_429_with_ietf_headers(self):
        """Exceeding 100 requests in 60s must return HTTP 429 with RFC 7807 and IETF headers."""
        triggered = False
        for i in range(105):
            res = self.client.get('/api/orders/')
            if res.status_code == 429:
                triggered = True
                self.assertEqual(res.headers.get('Content-Type'), 'application/problem+json')
                self.assertIn('Retry-After', res.headers)
                self.assertIn('RateLimit-Limit', res.headers)
                self.assertEqual(res.headers.get('RateLimit-Remaining'), '0')
                break
        self.assertTrue(triggered, "Rate limiter did not trigger HTTP 429 on request burst")
