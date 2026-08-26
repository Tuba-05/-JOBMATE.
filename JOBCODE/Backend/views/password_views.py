from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from Backend.models import CustomUser, OTPVerification
from Backend.utils.email_utils import generate_otp_code, send_otp_email


@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Generates OTP verification code, saves OTP record with timestamp, and sends email.
    """
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    user_data = request.data
    email = user_data.get("email", "").strip().lower()

    if not email:
        return Response(
            {"success": False, "message": "Email address is required."},
            status=400,
        )

    try:
        user = CustomUser.objects.get(email=email)
        otp_code = generate_otp_code()

        # Invalidate old unused OTPs for this email
        OTPVerification.objects.filter(email=email, is_used=False).update(is_used=True)

        # Create new timed OTP record
        OTPVerification.objects.create(
            email=email,
            otp_code=otp_code,
            is_used=False,
        )

        # Store in session as backup
        request.session["reset_email"] = user.email
        request.session["otp_code"] = otp_code
        request.session.modified = True

        email_sent = send_otp_email(otp_code, user.email)
        if email_sent:
            return Response(
                {
                    "success": True,
                    "message": f"OTP verification code sent to {user.email}! Valid for 2 minutes.",
                    "expiry_minutes": 2,
                },
                status=200,
            )
        else:
            return Response(
                {"success": False, "message": "Failed to send OTP email."},
                status=500,
            )

    except CustomUser.DoesNotExist:
        return Response(
            {"success": False, "message": "No account found with this email."},
            status=404,
        )
    except Exception as e:
        print("Forgot Password Error:", e)
        return Response(
            {"success": False, "message": "Internal server error."},
            status=500,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Verifies 5-minute timed OTP code and updates user's password in database.
    """
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    data = request.data
    email = data.get("email", "").strip().lower()
    otp_code = data.get("otp_code", "").strip()
    new_password = data.get("new_password", "").strip()

    if not email or not otp_code or not new_password:
        return Response(
            {"success": False, "message": "Email, OTP code, and new password are required."},
            status=400,
        )

    if len(new_password) < 6:
        return Response(
            {"success": False, "message": "New password must be at least 6 characters long."},
            status=400,
        )

    # Fetch latest OTP record for this email
    otp_record = (
        OTPVerification.objects.filter(email=email, otp_code=otp_code, is_used=False)
        .order_by("-created_at")
        .first()
    )

    if not otp_record:
        # Fallback to session check if OTP DB record isn't found
        session_otp = request.session.get("otp_code")
        session_email = request.session.get("reset_email")
        if not (session_otp and session_otp == otp_code and session_email == email):
            return Response(
                {"success": False, "message": "Invalid OTP code."},
                status=400,
            )
    else:
        # Check strict 2-minute expiration timer
        if not otp_record.is_valid(expiry_minutes=2):
            return Response(
                {
                    "success": False,
                    "message": "OTP verification code has expired (2-minute timer exceeded). Please request a new code.",
                },
                status=400,
            )
        # Mark OTP as used
        otp_record.is_used = True
        otp_record.save()

    try:
        user = CustomUser.objects.get(email=email)
        user.password = make_password(new_password)
        user.save()

        # Clear reset session variables
        request.session.pop("reset_email", None)
        request.session.pop("otp_code", None)
        request.session.modified = True

        return Response(
            {"success": True, "message": "Password updated successfully! You can now log in."},
            status=200,
        )
    except CustomUser.DoesNotExist:
        return Response(
            {"success": False, "message": "User not found."},
            status=404,
        )
    except Exception as e:
        print("Reset Password Error:", e)
        return Response(
            {"success": False, "message": "Internal server error."},
            status=500,
        )
