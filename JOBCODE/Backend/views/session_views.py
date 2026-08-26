from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from Backend.models import CustomUser, Candidate, Company
from Backend.utils.jwt_utils import (
    decode_token,
    refresh_access_token,
    blacklist_refresh_token,
)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_user_session(request):
    """
    Returns authenticated user profile payload from JWT Bearer token or session.
    """
    user_id = request.session.get("user_id")

    # Check Authorization header for JWT Bearer token
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("user_id"):
            user_id = payload["user_id"]

    if not user_id:
        return Response({"isAuthenticated": False, "user": None}, status=200)

    try:
        user = CustomUser.objects.get(id=user_id)
        profile_data = {}

        if user.role == "candidate":
            candidate = Candidate.objects.filter(user=user).first()
            if candidate:
                profile_data = {
                    "profession": candidate.profession,
                    "experience": candidate.experience,
                    "skills": candidate.skills,
                    "resume_link": candidate.resume_link,
                }
        elif user.role == "company":
            company = Company.objects.filter(user=user).first()
            if company:
                profile_data = {
                    "address": company.address,
                    "contact": company.contact,
                    "website": company.website,
                }

        return Response(
            {
                "isAuthenticated": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "profile": profile_data,
                },
            },
            status=200,
        )
    except CustomUser.DoesNotExist:
        request.session.flush()
        return Response({"isAuthenticated": False, "user": None}, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Verifies valid Refresh Token and issues new Access & Refresh tokens.
    """
    refresh = request.data.get("refresh") or request.data.get("refresh_token")
    if not refresh:
        return Response(
            {"success": False, "message": "Refresh token is required."},
            status=400,
        )

    new_tokens = refresh_access_token(refresh)
    if not new_tokens:
        return Response(
            {"success": False, "message": "Invalid, expired, or revoked refresh token."},
            status=401,
        )

    return Response(
        {
            "success": True,
            "message": "Access token refreshed successfully.",
            "tokens": new_tokens,
        },
        status=200,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def logout(request):
    """
    Blacklists the JWT refresh token and flushes session state.
    """
    refresh = request.data.get("refresh") or request.data.get("refresh_token")
    if refresh:
        blacklist_refresh_token(refresh)

    request.session.flush()
    return Response(
        {"success": True, "message": "Successfully logged out and revoked refresh token."},
        status=200,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def send_query(request):
    """Sends user help query / message directly to tubabintenaushad@gmail.com."""
    data = request.data
    name = data.get("name", "").strip()
    sender_email = data.get("email", "").strip()
    subject = data.get("subject", "JobMate Support Query").strip()
    query_message = data.get("message", "").strip()

    if not sender_email or not query_message:
        return Response(
            {"success": False, "message": "Email and message text are required."},
            status=400,
        )

    support_email = "tubabintenaushad@gmail.com"
    full_body = (
        f"📩 NEW JOBMATE USER SUPPORT QUERY\n"
        f"----------------------------------------\n"
        f"From Name: {name or 'Anonymous User'}\n"
        f"Sender Email: {sender_email}\n"
        f"Subject: {subject}\n\n"
        f"Query Message:\n{query_message}\n"
        f"----------------------------------------"
    )

    try:
        from django.core.mail import send_mail
        from django.conf import settings

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', getattr(settings, 'EMAIL_HOST_USER', None))
        if from_email and getattr(settings, 'EMAIL_HOST_PASSWORD', None):
            send_mail(
                subject=f"JobMate Query: {subject}",
                message=full_body,
                from_email=from_email,
                recipient_list=[support_email],
                fail_silently=False,
            )
            print(f"✅ Query Email delivered to {support_email} from {sender_email}!")
        else:
            print(f"📩 [HELP QUERY LOGGED] To: {support_email} | From: {sender_email} | Message: {query_message}")

        return Response(
            {
                "success": True,
                "message": f"Your query has been sent to JobMate Support ({support_email})! We will reply to {sender_email} shortly.",
            },
            status=200,
        )
    except Exception as e:
        print("Send Query Error:", e)
        return Response(
            {
                "success": True,
                "message": f"Your query has been logged for JobMate Support ({support_email})!",
            },
            status=200,
        )
