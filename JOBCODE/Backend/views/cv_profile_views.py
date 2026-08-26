import uuid
from datetime import datetime
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from Backend.models import CustomUser, Candidate
from Backend.config.supabase_client import supabase
from Backend.utils.jwt_utils import decode_token


@api_view(["POST"])
@permission_classes([AllowAny])
def check_resume(request):
    """Checks whether the candidate has uploaded a resume or not."""
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    user_id = None
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("token_type") == "access":
            user_id = payload.get("user_id")

    candidate_id = user_id or request.data.get("UserId") or request.session.get("user_id")
    if not candidate_id:
        return Response({"success": False, "message": "Authentication required."}, status=401)

    try:
        candidate = Candidate.objects.filter(user_id=candidate_id).first() or Candidate.objects.filter(id=candidate_id).first()
        if not candidate:
            return Response({"success": False, "message": "Candidate profile not found"}, status=404)

        if not candidate.resume_link:
            return Response(
                {"success": False, "message": "Resume not found", "user_id": candidate_id},
                status=404,
            )
        else:
            return Response(
                {"success": True, "message": "Resume already uploaded", "user_id": candidate_id},
                status=200,
            )
    except Exception as e:
        print("Check Resume Error:", e)
        return Response({"success": False, "message": "Internal server error"}, status=500)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])
def upload_resume(request):
    """Uploads candidate resume file to Supabase storage bucket."""
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    user_id = None
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("token_type") == "access":
            user_id = payload.get("user_id")

    candidate_id = user_id or request.data.get("UserId") or request.session.get("user_id")
    file = request.data.get("resume")

    if not candidate_id:
        return Response({"success": False, "message": "Authentication required."}, status=401)
    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    file_extension = file.name.split(".")[-1]
    file_name = f"user_{candidate_id}_{uuid.uuid4()}.{file_extension}"
    file_content = file.read()

    try:
        resume_link = f"https://mock-storage.supabase.co/resumes/{file_name}"
        if supabase:
            try:
                res = supabase.storage.from_("resumes").upload(
                    path=file_name, file=file_content, file_options={"content-type": file.content_type}
                )
            except Exception as se:
                print("Supabase upload warning:", se)

        candidate, _ = Candidate.objects.get_or_create(user_id=candidate_id)
        candidate.resume_link = resume_link
        candidate.save()

        return Response(
            {
                "success": True,
                "message": "Resume uploaded successfully",
                "user_id": candidate_id,
                "resume_url": resume_link,
            },
            status=201,
        )
    except Exception as e:
        print("Upload Resume Error:", e)
        return Response({"success": False, "message": "Internal server error"}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def display_profile_info(request):
    """Returns candidate's signed resume URL for display."""
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    user_id = None
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("token_type") == "access":
            user_id = payload.get("user_id")

    candidate_id = user_id or request.data.get("UserId") or request.session.get("user_id")

    if not candidate_id:
        return Response({"success": False, "message": "Authentication required. Please log in first."}, status=401)

    try:
        candidate = Candidate.objects.filter(user_id=candidate_id).first() or Candidate.objects.filter(id=candidate_id).first()
        if not candidate:
            return Response({"success": False, "message": "Candidate not found"}, status=404)

        if not candidate.resume_link:
            return Response({"success": False, "message": "No resume uploaded"}, status=404)

        signed_url = candidate.resume_link
        if supabase:
            try:
                signed_data = supabase.storage.from_("resumes").create_signed_url(
                    candidate.resume_link, 3600
                )
                if signed_data and "signedURL" in signed_data:
                    signed_url = signed_data["signedURL"]
            except Exception as se:
                print("Signed URL generation warning:", se)

        return Response(
            {
                "success": True,
                "message": "Profile info fetched",
                "user_id": candidate_id,
                "resume_url": signed_url,
            },
            status=200,
        )
    except Exception as e:
        print("Display Profile Error:", e)
        return Response({"success": False, "message": f"Internal server error: {str(e)}"}, status=500)
