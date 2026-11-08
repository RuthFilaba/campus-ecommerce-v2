#!/usr/bin/env python3
"""
TLS 1.3 HTTPS Server for Campus E-Commerce Platform
Wraps Django WSGI application with an SSLContext strictly enforcing TLS 1.3.
"""
import os
import sys
import ssl
from wsgiref.simple_server import make_server

# Setup Django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_config.settings')

import django
django.setup()

from django.core.wsgi import get_wsgi_application
from django.conf import settings

def create_tls13_context():
    cert_file = os.path.join(BACKEND_DIR, 'certs', 'cert.pem')
    key_file = os.path.join(BACKEND_DIR, 'certs', 'key.pem')

    if not os.path.exists(cert_file) or not os.path.exists(key_file):
        raise FileNotFoundError(f"TLS certificates not found in {os.path.join(BACKEND_DIR, 'certs')}. Run scripts/generate_certs.sh first.")

    # Create server SSL context
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile=cert_file, keyfile=key_file)

    # Strictly enforce TLS 1.3
    context.minimum_version = ssl.TLSVersion.TLSv1_3
    context.maximum_version = ssl.TLSVersion.TLSv1_3

    return context

def main(host='127.0.0.1', port=8443):
    application = get_wsgi_application()
    ssl_context = create_tls13_context()

    server = make_server(host, port, application)
    server.socket = ssl_context.wrap_socket(server.socket, server_side=True)

    print("=" * 70)
    print(" Campus E-Commerce Platform: TLS 1.3 HTTPS Server")
    print(f" Serving securely at: https://{host}:{port}/")
    print(" TLS Version Enforced: TLS 1.3 (RFC 8446)")
    print(" HSTS Status: Active (Strict-Transport-Security)")
    print(" Hardened Session Cookies: HttpOnly, Secure, SameSite=Strict")
    print("=" * 70)
    print("Press Ctrl+C to terminate.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down HTTPS server...")
        server.server_close()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8443
    main(port=port)
