import os
import json
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views import View

class OpenAPISpecView(View):
    """Serves the raw OpenAPI 3.1 JSON definition."""
    def get(self, request):
        spec_path = os.path.join(settings.BASE_DIR, 'openapi.json')
        if not os.path.exists(spec_path):
            return JsonResponse({"error": "openapi.json not found"}, status=404)
        with open(spec_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return JsonResponse(data, safe=False)


class SwaggerUIDocsView(View):
    """Renders the interactive Swagger UI configured for TLS and credentials."""
    def get(self, request):
        html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Campus E-Commerce API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .swagger-ui .topbar { background-color: #1e3a8a; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
  <script>
  window.onload = function() {
    window.ui = SwaggerUIBundle({
      url: "/api-docs/openapi.json",
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      layout: "BaseLayout",
      requestInterceptor: function(request) {
        // Include session credentials/cookies for all requests
        request.credentials = 'include';
        return request;
      }
    });
  };
  </script>
</body>
</html>"""
        return HttpResponse(html_content, content_type='text/html')
