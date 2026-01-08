# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
from ..models import CustomUser, Company, Candidate, JobVacancies, CompanyTests, TestScores
from ..ottp import generate_random_password, send_mail
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser # for upload files & to parse data from file 
from django.contrib.auth.hashers import (make_password, check_password, )  # for hash password
from supabase_client import supabase
import uuid  # Universally Unique Identifier, generates a 128-bit unique value(string)
from datetime import datetime

# --------------------- CANDIDATE ROUTES ---------------------

@api_view(["POST"])
def check_resume(request):
    """ function checks whether the user candidate uploaded his resume or not"""
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)

    candidate_data = request.data
    if candidate_data.get("role") == "candidate":
        candidate_id = candidate_data.get("UserId")
        try:
            candidate = Candidate.objects.get(user_id=candidate_id)
            if not candidate.resume_link:
                print("Resume not found")
                return Response({"success": False, "message": "Resume not found", "user_id": candidate_id,}, 
                                status=404)
            else:
                print("Resume already uploaded")
                return Response({"success": True, "message": "Resume already uploaded", "user_id": candidate_id,}, 
                                status=200)
        
        except Candidate.DoesNotExist:
            print("Candidate not found")
            return Response({"success": False, "message": "Candidate not found"}, status=404)
        except Exception as e:
            print("check resume", e)
            return Response({"success": False, "message": f"Internal server error"}, status=500)
        

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_resume(request):
    """ function takes user id & parse resume to store in DB in URL form """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)

    candidate_data = request.data
    candidate_id = candidate_data.get("UserId")
    file = candidate_data.get("resume")

    if not file:  # if file not found
        return Response({"error": "No file uploaded"}, status=404)
    # Unique filename
    file_extension = file.name.split(".")[-1]
    file_name = f"user_{candidate_id}_{uuid.uuid4()}.{file_extension}"
    file_content = file.read()          # convert to bytes

    try:  # Upload file to Supabase Storage (bucket 'resumes' must exist)
        # Upload file to Supabase bucket
        file_saved_in_bucket = supabase.storage.from_("resumes").upload(
            file_name,
            file_content,
            file_options={"content-type": file.content_type}
        )
        # Make file URL public
        # file_url = supabase.storage.from_("resumes").get_public_url(file_name)['public_url']
    
    except Exception as e:
        print("Supabase upload error:", e)
        return Response({"success": False, "message": 'Internal server error.'}, status=500)

    try:  # saving resume url in Candidate DB
        candidate = Candidate.objects.get(user_id=candidate_id)
        candidate.resume_link = file_name
        candidate.save()
        print("Resume uploaded successfully")
        return Response({"success": True, "message": "Resume uploaded successfully!", "user_id": candidate_id,
                        }, status=201)

    except Candidate.DoesNotExist:
        print("Candidate not found")
        return Response({"success": False, "message": "Candidate not found"}, status=404)
    except Exception as e:
        print("upload resume", e)
        return Response({"success": False, "message": f"Internal server error"}, status=500)


@api_view(['POST'])
def display_profile_info(request): # resume display
    """ function send user's public resume link for frontend display"""
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)
    
    candidate_id = request.data.get('UserId')
    try: # if candidate exists
        candidate = Candidate.objects.get(user_id= candidate_id)
        if not candidate.resume_link:
            return Response({"success": False, "message": "No resume uploaded"}, status=404)

        # Generate signed URL valid for 1 hour
        signed_data = supabase.storage.from_("resumes").create_signed_url(candidate.resume_link, 3600)

        if not signed_data or "signedURL" not in signed_data:
            return Response({"success": False, "message": "Failed to generate signed URL"}, status=500)

        signed_url = signed_data["signedURL"]
        print("Signed URL:", signed_url)

        return Response({"success": True, "message": "Profile info fetched", "user_id": candidate_id, 
                         "resume_url": signed_url  # Send STRING only
                         }, status=200)
        
    except Candidate.DoesNotExist:
        print("Candidate not found")
        return Response({"success": False, "message": "Candidate not found"}, status=404)
    except Exception as e:
        print("display profile info", e)
        return Response({"success": False, "message": f"Internal server error"}, status=500)
