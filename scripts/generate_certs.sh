#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CERTS_DIR="$PROJECT_ROOT/backend/certs"

mkdir -p "$CERTS_DIR"

echo "Generating local TLS 1.3 self-signed certificates..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERTS_DIR/key.pem" \
  -out "$CERTS_DIR/cert.pem" \
  -subj "/C=US/ST=State/L=Campus/O=CampusECommerce/OU=Engineering/CN=localhost" \
  -addext "subjectAltName = DNS:localhost,DNS:api.campus-ecommerce.internal,IP:127.0.0.1"

chmod 600 "$CERTS_DIR/key.pem"
chmod 644 "$CERTS_DIR/cert.pem"

echo "TLS 1.3 certificates successfully generated in $CERTS_DIR"
