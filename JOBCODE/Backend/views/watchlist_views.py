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

@api_view(['POST'])
def wachlist(request):
    """ function send user saved jobs and applied jobs to frontend """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)
    candidate_id = request.data.get('UserId')
    try:
        candidate = Candidate.objects.get(user_id= candidate_id)
        # Get a QuerySet of objects, Intermediary Tables (also called Junction or Link tables).
        applied_job_ids = candidate.applied_jobs.values_list("id", flat=True)
        saved_job_ids = candidate.save_jobs.values_list("id", flat=True) 

        # job_ids = list(job_ids)
        SaveJobs = {}
        AppliedJobs = {}
        for id in saved_job_ids:
            saved_job_details = JobVacancies.objects.get(id= id)
            SaveJobs[saved_job_details['id']] = {
                "company name" : saved_job_details.company.user.username,
                "Job title" : saved_job_details.job_title,
                "skillsRequired": saved_job_details.skills_required, # skills required
                "levelOfExperience": saved_job_details.level_of_experience, # level of experience
                "additionalRequirements": saved_job_details.additional_requirements, # additional requirements
                "location": saved_job_details.location, # job location
                "timings": saved_job_details.timings, # job timings
                "posted at": saved_job_details.created_at.strftime("%b %d, %Y - %I:%M %p"), # Format: Dec 16, 2025 - 04:38 PM
            }
        for id in applied_job_ids:
            applied_job_details = JobVacancies.objects.get(id = id)
            AppliedJobs[applied_job_details['id']] = {
                "company name" : saved_job_details.company.user.username,
                "Job title" : saved_job_details.job_title,
                "skillsRequired": saved_job_details.skills_required, # skills required
                "levelOfExperience": saved_job_details.level_of_experience, # level of experience
                "additionalRequirements": saved_job_details.additional_requirements, # additional requirements
                "location": saved_job_details.location, # job location
                "timings": saved_job_details.timings, # job timings
                "posted at": saved_job_details.created_at.strftime("%b %d, %Y - %I:%M %p"), # Format: Dec 16, 2025 - 04:38 PM
            }
        return Response({"success": True, "message": f" Candiadte's watchlist delievered" ,
                        "candidate_watchlist": {
                            "saved_jobs": SaveJobs,    # This would be list of dictionaries
                            "applied_jobs": AppliedJobs # This would be list of dictionaries
                        }}, status=200)    
    
    except Candidate.DoesNotExist:
        print("Candidate not found")
        return Response({"success": False, "message": "Candidate not found"}, status=404)
    except Exception as e:
        print("watchlist", e)
        return Response({"success": False, "message": f"Internal server error"}, status=500)
