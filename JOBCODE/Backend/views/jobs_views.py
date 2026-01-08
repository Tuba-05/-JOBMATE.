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
def toggle_jobs(request):
    """ function ta saved/remove jobs from saved jobs list """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)
    data_to_be_toggled = request.data
    candidate_id = data_to_be_toggled.get("candidateId")
    job_id = data_to_be_toggled.get("jobId")
    try:
        # Get the candidate instance
        candidate =  Candidate.objects.get(user_id= candidate_id) # get candidate object
        
        # Use the field name 'save_jobs' defined in your Candidate model, then
        # use id=job_id in filter to check if this specific job is already linked
            
        if data_to_be_toggled.get("state") == 'homepage':
            if candidate.saved_job.filter(id=job_id).exists(): # REMOVE job from saved list
                candidate.saved_jobs_by_candidates.remove(job_id)  
                print("Job removed from saved list")
                return Response({"success": True, "message": "Job removed from applied list",
                             "user_id": candidate_id,}, status=200)
            else:
                return Response({"sucess": False, "message": 'this job does not exists in your list.'})
            
        else:
            if candidate.saved_job.filter(id=job_id).exists(): # dont need to saved job again
                print("Job already exists in list")
                return Response({"success": True, "message": "Job already exists in list",
                                "user_id": candidate_id,}, status=200)
            else: # ADD/ SAVE job to saved list
                candidate.saved_jobs_by_candidates.add(job_id)  
                print("Job added to saved list")
                return Response({"success": True, "message": "Job added to saved list",
                                "user_id": candidate_id,}, status=200)   

    except Candidate.DoesNotExist: 
        return Response({"success": False, "message": "Candidate not found"}, status=404)
    except Exception as e:
        print("toggle jobs", e)
        return Response({"success": False, "message": "Internal server error."}, status=500)


@api_view(['POST'])
def applied_to_jobs(request):
    """ function save jobs applied by candidate in DB send from frontend """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)
    
    candidate_appliedJobs = request.data
    candidate_id = candidate_appliedJobs.get("candidateId")
    job_id = candidate_appliedJobs.get("jobId")
    try:
        # candidate & job instances
        candidate =  Candidate.objects.get(user_id= candidate_id) # get candidate object
        job = JobVacancies.objects.get(id= job_id) # get job object
        # check if candidate has applied to the job
        if job.candidates_applied.filter(id=candidate.id).exists(): # candidate has applied
            return Response({"success": True, "message": "Already applied to this job",
                             "user_id": candidate_id,}, status=200)
        else: # candidate has not applied
            job.candidates_applied.add(candidate.id)  # add candidate to job's applied list
            return Response({"success": True, "message": "Sucessfully applied to this job",
                             "user_id": candidate_id,}, status=200)
         
    except (Candidate.DoesNotExist , JobVacancies.DoesNotExist): 
        return Response({"success": False, "message": "Candidate -OR- Job not found"}, status=404)
    except Exception as e:
        print("applied to jobs", e)
        return Response({"success": False, "message": "Internal server error."}, status=500)    


# --------------------- COMPANY ROUTES ---------------------

@api_view(['POST'])
def add_vacancy(request):
    """ function stores job vacancies in DB send from frontend """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)

    jobVacancy_data = request.data
    CompanyId = jobVacancy_data.get("companyId")
    job_title = jobVacancy_data.get("title")
    job_skillsRequired = jobVacancy_data.get("requiredSkills")
    job_levelOfExperience = jobVacancy_data.get("levelOfExperience")
    job_additionalRequirements = jobVacancy_data.get("additionalRequirements")
    job_location = jobVacancy_data.get("location")
    job_timing = jobVacancy_data.get("timing")

    try:
        company = Company.objects.get(user_id=CompanyId)
        if company:
            job = JobVacancies.objects.create(
                company = company,
                job_title=job_title,
                skills_required=job_skillsRequired,
                level_of_experience=job_levelOfExperience,
                additional_requirements=job_additionalRequirements,
                location=job_location,
                timings=job_timing,
            )

            print("Job vacancy added successfully")
            return Response({"success": True, "message": "Job vacancy added successfully.",
                            "job_id": job.id}, status=201)

    except Company.DoesNotExist:
        print("Company not found")
        return Response({"success": False, "message": "Company not found"}, status=404)  

    except Exception as e:
        print("add vacancay", e)
        return Response({"success": False, "message": f"{str(e)}, no job vacancies list"}, status=500)      
            

@api_view(['POST'])
def display_vacancies(request):
    """ function fetches job vacancies from DB for frontend display """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)
    try:
        job_vacancies_list = JobVacancies.objects.all().values()# fetch all job vacancies
        # job_vacancies_list = list(job_vacancies)  # convert QuerySet to list
        job_data = {}
        for jobs in job_vacancies_list:                                   
            c_name = Company.objects.get(id= jobs["company_id"]).user.username # Company var user, user var username
            job_data[jobs['id']] = {
                "companyId": jobs['company_id'], # FK to Company table
                "CompanyName": c_name, # Company name
                "jobTitle": jobs['job_title'], # job title
                "skillsRequired": jobs['skills_required'], # skills required
                "levelOfExperience": jobs['level_of_experience'], # level of experience
                "additionalRequirements": jobs['additional_requirements'], # additional requirements
                "location": jobs['location'], # job location
                "timings": jobs['timings'], # job timings
                "posted at": jobs['created_at'].strftime("%b %d, %Y - %I:%M %p"), # Format: Dec 16, 2025 - 04:38 PM
            }
        # print(job_data)
        return Response({"success": True, "message": 'vacancies data delievered' ,
                     "jobs": job_data }, status=200)

    except Exception as e:
        print("diaplay vacancies", e)
        return Response({"success": False, "message": f"Internal server error."}, status=500)
