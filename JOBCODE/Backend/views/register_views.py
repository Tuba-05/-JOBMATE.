from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from Backend.models import CustomUser, Company, Candidate
from Backend.config.supabase_client import supabase
from Backend.utils.jwt_utils import generate_jwt_tokens


@api_view(["POST"])
def register(request):
    """
    Registers a new candidate/company user and returns JWT Access & Refresh tokens.
    """
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    try:
        registered_data = request.data
        username = registered_data.get("username", "").strip()
        email = registered_data.get("email", "").strip().lower()
        password = registered_data.get("password", "").strip()

        # Input Validation
        if not username or not email or not password:
            return Response(
                {"success": False, "message": "Username, email, and password are required."},
                status=400,
            )

        if "@" not in email or "." not in email:
            return Response(
                {"success": False, "message": "Please enter a valid email address."},
                status=400,
            )

        if len(password) < 6:
            return Response(
                {"success": False, "message": "Password must be at least 6 characters long."},
                status=400,
            )

        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {"success": False, "message": "An account with this email already exists."},
                status=400,
            )

        hashed_password = make_password(password)
        is_company = registered_data.get("isHiringDeskMode") or registered_data.get("role") == "company"

        if is_company:
            user = CustomUser.objects.create(
                username=username,
                email=email,
                password=hashed_password,
                role="company",
            )
            Company.objects.create(
                user=user,
                address=registered_data.get("companyAddress", "").strip(),
                contact=registered_data.get("contactNumber", "").strip(),
                website=registered_data.get("companyWebsite", "").strip(),
            )
            role = "company"
        else:
            user = CustomUser.objects.create(
                username=username,
                email=email,
                password=hashed_password,
                role="candidate",
            )
            Candidate.objects.create(user=user)
            role = "candidate"

        # Initialize Session & Generate JWT Tokens
        request.session["user_id"] = user.id
        request.session["role"] = role
        request.session.modified = True

        tokens = generate_jwt_tokens(user)

        return Response(
            {
                "success": True,
                "message": "User registered successfully.",
                "tokens": tokens,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": role,
                },
            },
            status=201,
        )

    except Exception as e:
        print("Register Error:", e)
        return Response({"success": False, "message": "Internal server error."}, status=500)
