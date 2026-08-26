from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from Backend.models import CustomUser, Candidate, Company
from Backend.config.supabase_client import supabase
from Backend.utils.jwt_utils import generate_jwt_tokens


@api_view(["POST"])
def login(request):
    """
    Authenticates user, initializes Django session, and returns JWT Access & Refresh tokens
    along with full profile payload.
    """
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    try:
        login_data = request.data
        email = login_data.get("email", "").strip().lower()
        password = login_data.get("password", "").strip()

        if not email or not password:
            return Response(
                {"success": False, "message": "Email and password are required."},
                status=400,
            )

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {"success": False, "message": "User not found with this email."},
                status=404,
            )

        if not check_password(password, user.password):
            return Response(
                {"success": False, "message": "Invalid password."},
                status=401,
            )

        # Set User Session & Generate JWT Tokens
        request.session["user_id"] = user.id
        request.session["username"] = user.username
        request.session["email"] = user.email
        request.session["role"] = user.role
        request.session.modified = True

        tokens = generate_jwt_tokens(user)

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
                "success": True,
                "message": f"Successfully logged in as {user.role}.",
                "user_id": user.id,
                "role": user.role,
                "tokens": tokens,
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

    except Exception as e:
        print("Login Error:", e)
        return Response(
            {"success": False, "message": "Internal server error."},
            status=500,
        )
