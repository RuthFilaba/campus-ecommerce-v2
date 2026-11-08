import json
import os
import re
from django.conf import settings
from django.http import JsonResponse

try:
    from jsonschema import Draft202012Validator
    from jsonschema.exceptions import ValidationError
    HAS_JSONSCHEMA = True
except ImportError:
    HAS_JSONSCHEMA = False


class OpenAPISchemaValidationMiddleware:
    """
    Strict OpenAPI 3.1 request interceptor.
    Validates JSON bodies against compiled schemas and returns RFC 7807 Problem Details.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.spec = self._load_openapi_spec()
        self.validators = self._compile_validators()

    def _load_openapi_spec(self):
        spec_path = os.path.join(settings.BASE_DIR, 'openapi.json')
        if not os.path.exists(spec_path):
            return {}
        try:
            with open(spec_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}

    def _compile_validators(self):
        """Compile path-method pairs to validator."""
        validators = {}
        paths = self.spec.get('paths', {})
        components = self.spec.get('components', {})

        for path, path_item in paths.items():
            for method, operation in path_item.items():
                if method.lower() in ['post', 'put', 'patch']:
                    content = operation.get('requestBody', {}).get('content', {})
                    json_schema = content.get('application/json', {}).get('schema')
                    if json_schema:
                        compound_schema = {
                            "$schema": "https://json-schema.org/draft/2020-12/schema",
                            **json_schema,
                            "components": components
                        }
                        normalized_path = path.rstrip('/') + '/'
                        key = (normalized_path, method.upper())

                        if HAS_JSONSCHEMA:
                            try:
                                validators[key] = Draft202012Validator(compound_schema)
                            except Exception:
                                validators[key] = compound_schema
                        else:
                            validators[key] = compound_schema
        return validators

    def _resolve_schema(self, schema_or_ref):
        if not isinstance(schema_or_ref, dict):
            return {}
        if '$ref' in schema_or_ref:
            ref_path = schema_or_ref['$ref'].split('/')
            curr = self.spec
            for part in ref_path:
                if part == '#':
                    curr = self.spec
                elif isinstance(curr, dict) and part in curr:
                    curr = curr[part]
                else:
                    return {}
            return curr
        return schema_or_ref

    def _validate_node(self, val, schema, path="root"):
        schema = self._resolve_schema(schema)
        errors = []

        expected_type = schema.get('type')
        if expected_type == 'object':
            if not isinstance(val, dict):
                errors.append({"name": path, "reason": f"Expected object, got {type(val).__name__}"})
                return errors

            # Required properties
            for req in schema.get('required', []):
                if req not in val:
                    prop_path = f"{path}.{req}" if path != "root" else req
                    errors.append({"name": prop_path, "reason": f"'{req}' is a required property"})

            # Properties check
            props = schema.get('properties', {})
            for k, item_val in val.items():
                prop_path = f"{path}.{k}" if path != "root" else k
                if k in props:
                    errors.extend(self._validate_node(item_val, props[k], prop_path))
                elif schema.get('additionalProperties') is False:
                    errors.append({
                        "name": prop_path,
                        "reason": f"Additional properties are not allowed ('{k}' was unexpected)"
                    })

        elif expected_type == 'array':
            if not isinstance(val, list):
                errors.append({"name": path, "reason": f"Expected array, got {type(val).__name__}"})
                return errors
            if 'minItems' in schema and len(val) < schema['minItems']:
                errors.append({"name": path, "reason": f"Array has {len(val)} items, minimum is {schema['minItems']}"})
            items_schema = schema.get('items', {})
            for idx, item in enumerate(val):
                errors.extend(self._validate_node(item, items_schema, f"{path}[{idx}]"))

        elif expected_type == 'string':
            if not isinstance(val, str):
                errors.append({"name": path, "reason": f"Expected string, got {type(val).__name__}"})
            else:
                if 'minLength' in schema and len(val) < schema['minLength']:
                    errors.append({"name": path, "reason": f"String length {len(val)} is shorter than minLength {schema['minLength']}"})
                if 'maxLength' in schema and len(val) > schema['maxLength']:
                    errors.append({"name": path, "reason": f"String length {len(val)} is longer than maxLength {schema['maxLength']}"})
                if 'pattern' in schema and not re.search(schema['pattern'], val):
                    errors.append({"name": path, "reason": f"'{val}' does not match pattern '{schema['pattern']}'"})
                if 'enum' in schema and val not in schema['enum']:
                    errors.append({"name": path, "reason": f"'{val}' is not one of {schema['enum']}"})

        elif expected_type in ['integer', 'number']:
            if not isinstance(val, (int, float)) or (expected_type == 'integer' and isinstance(val, bool)):
                errors.append({"name": path, "reason": f"Expected {expected_type}, got {type(val).__name__}"})
            else:
                if 'minimum' in schema and val < schema['minimum']:
                    errors.append({"name": path, "reason": f"Value {val} is less than minimum {schema['minimum']}"})
                if 'maximum' in schema and val > schema['maximum']:
                    errors.append({"name": path, "reason": f"Value {val} is greater than maximum {schema['maximum']}"})

        elif expected_type == 'boolean':
            if not isinstance(val, bool):
                errors.append({"name": path, "reason": f"Expected boolean, got {type(val).__name__}"})

        return errors

    def __call__(self, request):
        if request.method in ['POST', 'PUT', 'PATCH']:
            # Normalize path with trailing slash
            lookup_path = request.path_info.rstrip('/') + '/'
            validator = self.validators.get((lookup_path, request.method))

            if validator:
                # 1. Syntax Verification (RFC 7807 - HTTP 400)
                try:
                    if len(request.body) == 0:
                        payload = {}
                    else:
                        payload = json.loads(request.body.decode('utf-8'))
                except (json.JSONDecodeError, UnicodeDecodeError) as exc:
                    return self._build_rfc7807_error(
                        request=request,
                        status_code=400,
                        title="Malformed JSON Syntax",
                        detail=f"Invalid JSON payload: {str(exc)}",
                        invalid_params=[]
                    )

                # 2. Schema Constraint & additionalProperties Verification (RFC 7807 - HTTP 422)
                invalid_params = []
                if HAS_JSONSCHEMA and isinstance(validator, Draft202012Validator):
                    for err in validator.iter_errors(payload):
                        field_path = ".".join([str(p) for p in err.path]) or "root"
                        invalid_params.append({
                            "name": field_path,
                            "reason": err.message
                        })
                else:
                    invalid_params = self._validate_node(payload, validator)

                if invalid_params:
                    return self._build_rfc7807_error(
                        request=request,
                        status_code=422,
                        title="Unprocessable Entity - Schema Validation Failure",
                        detail="The request body does not adhere to the OpenAPI specification.",
                        invalid_params=invalid_params
                    )

        return self.get_response(request)

    def _build_rfc7807_error(self, request, status_code, title, detail, invalid_params):
        response_payload = {
            "type": f"https://api.campus-ecommerce.internal/errors/http-{status_code}",
            "title": title,
            "status": status_code,
            "detail": detail,
            "instance": request.get_full_path(),
            "invalidParams": invalid_params
        }
        response = JsonResponse(response_payload, status=status_code)
        response['Content-Type'] = 'application/problem+json'
        return response
