import jwt
import uuid
from functools import wraps
from datetime import datetime, timedelta, timezone
from django.conf import settings
from rest_framework.response import Response
from Backend.models import CustomUser

SECRET_KEY = getattr(settings, "SECRET_KEY", "fallback_secret_key")

# In-memory token blacklist for revoked refresh tokens
BLACK_LISTED_JTIS = set()


def generate_jwt_tokens(user):
    """
    Generates signed JWT Access Token (60 mins) and Refresh Token (7 days)
    for a CustomUser instance.
    """
    now = datetime.now(timezone.utc)

    access_payload = {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "token_type": "access",
        "exp": now + timedelta(minutes=60),
        "iat": now,
    }
    access_token = jwt.encode(access_payload, SECRET_KEY, algorithm="HS256")

    refresh_jti = str(uuid.uuid4())
    refresh_payload = {
        "user_id": user.id,
        "token_type": "refresh",
        "jti": refresh_jti,
        "exp": now + timedelta(days=7),
        "iat": now,
    }
    refresh_token = jwt.encode(refresh_payload, SECRET_KEY, algorithm="HS256")

    return {
        "access": access_token,
        "refresh": refresh_token,
    }


def decode_token(token):
    """
    Decodes and verifies a JWT token. Returns payload dict or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        return None


def refresh_access_token(refresh_token):
    """
    Verifies a refresh token and generates a new pair of Access & Refresh tokens.
    Blacklists the old refresh token.
    """
    payload = decode_token(refresh_token)
    if not payload or payload.get("token_type") != "refresh":
        return None

    jti = payload.get("jti")
    if jti in BLACK_LISTED_JTIS:
        return None

    user_id = payload.get("user_id")
    try:
        user = CustomUser.objects.get(id=user_id)
        tokens = generate_jwt_tokens(user)
        if jti:
            BLACK_LISTED_JTIS.add(jti)
        return tokens
    except CustomUser.DoesNotExist:
        return None


def blacklist_refresh_token(refresh_token):
    """
    Revokes/blacklists a refresh token by adding its JTI to the blacklist set.
    """
    payload = decode_token(refresh_token)
    if payload and payload.get("jti"):
        BLACK_LISTED_JTIS.add(payload["jti"])
        return True
    return False


def protected_route(allowed_roles=None):
    """
    Decorator for protected routes. Verifies JWT Access Token or session,
    and enforces role-based access control (RBAC).
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user_id = request.session.get("user_id")
            user_role = request.session.get("role")

            # Extract JWT Bearer token from headers
            auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                payload = decode_token(token)

                if not payload or payload.get("token_type") != "access":
                    return Response(
                        {"success": False, "message": "Invalid, expired, or missing JWT access token."},
                        status=401,
                    )
                user_id = payload.get("user_id")
                user_role = payload.get("role")

            if not user_id:
                return Response(
                    {"success": False, "message": "Authentication required. Please log in first."},
                    status=401,
                )

            if allowed_roles and user_role not in allowed_roles:
                return Response(
                    {
                        "success": False,
                        "message": f"Permission denied. Access restricted to roles: {allowed_roles}.",
                    },
                    status=403,
                )

            request.user_id = user_id
            request.user_role = user_role
            return view_func(request, *args, **kwargs)

        return _wrapped_view

    return decorator
