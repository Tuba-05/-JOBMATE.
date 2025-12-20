# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser, Company, Candidate, JobVacancies, CompanyTests, TestScores
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser # for upload files & to parse data from file 
from django.contrib.auth.hashers import (make_password, check_password, )  # for hash password
from supabase_client import supabase
import uuid  # Universally Unique Identifier, generates a 128-bit unique value(string)
from datetime import datetime


# @csrf_exempt  # disable CSRF just for API testing (remove later if you use tokens)
@api_view(["POST"])
def register(request):
    """ function takes user inputs for sign up and stores to DB depending of role company/ candidate """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)

    try:
        registeredUser_data = request.data
        username = registeredUser_data.get("username")
        email = registeredUser_data.get("email")
        password = registeredUser_data.get("password")
        hashed_password = make_password(password)  # making password hashed

        if not CustomUser.objects.filter(email=email).exists():

            if registeredUser_data.get("isHiringDeskMode"):  # Company mode
                user = CustomUser.objects.create(
                    username=username,
                    email=email,
                    password=hashed_password,
                    role="company",
                )

                Company.objects.create(
                    user=user,
                    address=registeredUser_data.get("companyAddress"),
                    contact=registeredUser_data.get("contactNumber"),
                    website=registeredUser_data.get("companyWebsite"),
                )

            else:  # Candidate mode
                user = CustomUser.objects.create(
                    username=username,
                    email=email,
                    password=hashed_password,
                    role="candidate",
                )

                Candidate.objects.create(
                    user=user,
                )

            # sending successful response
            return Response({"success": True, "message": "Record added successfully.", "user_id": user.id,}
                            , status=201)

        else:
            return Response({"success": False, "message": "Record already exists"}, status=400)

    except Exception as e:
        return Response({"success": False, "message": str(e)})


@api_view(["POST"])
def login(request):
    """ function takes user inputs for logged in """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)
    loginedUser_data = request.data
    email = loginedUser_data.get("email")
    password = loginedUser_data.get("password")
    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)    
    if not check_password(password, user.password):  # if password not matches with DB passowrd
        print("invalid password")
        return Response({"success": False, "message": "Invalid password"}, status=401)

    if user.role == "candidate":  # candidate log in
        print("Candidate logged in")
        return Response({"success": True, "message": "Candidate logged in", "role": "candidate",
                    "user_id": user.id,},status=201)
        
    else:  # company logged in
        print("Company logged in")
        return Response({"success": True, "message": "Company logged in", "role": "company",
                    "user_id": user.id,},status=201)
        

# --------------------- CANDIDATE ROUTES ---------------------

@api_view(["POST"])
def check_resume(request):
    """ function checks whether the user candidate uploaded his resume or not"""
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)

    user_data = request.data
    if user_data.get("role") == "candidate":
        candidate_id = user_data.get("UserId")
        try:
            candidate = Candidate.objects.get(user_id=candidate_id)
            if not candidate.resume_link:
                print("Resume not found")
                return Response({"success": False, "message": "Resume not found", "user_id": candidate_id,}, status=404)
            else:
                print("Resume already uploaded")
                return Response({"success": True, "message": "Resume already uploaded", "user_id": candidate_id,}, status=200)
        
        except Candidate.DoesNotExist:
            print("Candidate not found")
            return Response({"success": False, "message": "Candidate not found"}, status=404)
        

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_resume(request):
    """ function takes user id & parse resume to store in DB in URL form """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)

    user_data = request.data
    candidate_id = user_data.get("UserId")
    file = user_data.get("resume")

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
        return Response({"success": False, "message": str(e)}, status=500)

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

        return Response({"success": True, "message": "Profile info fetched", "user_id": candidate_id, "resume_url": signed_url  # Send STRING only
                         }, status=200)
        
    except Candidate.DoesNotExist:
        print("Candidate not found")
        return Response({"success": False, "message": "Candidate not found"}, status=404)


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
        
        if data_to_be_toggled.get("state") == 'saved':
            if candidate.saved_job.filter(id=job_id).exists(): # dont need to saved job again
                print("Job already exists in list")
                return Response({"success": True, "message": "Job already exists in list",
                                "user_id": candidate_id,}, status=200)
            else: # ADD/ SAVE job to applied list/ saved list
                candidate.saved_jobs_by_candidates.add(job_id)  
                print("Job added to saved list")
                return Response({"success": True, "message": "Job added to saved list",
                                "user_id": candidate_id,}, status=200)
            
        if data_to_be_toggled.get("state") == 'homepage':
            if candidate.saved_job.filter(id=job_id).exists(): # REMOVE job from saved list
                candidate.saved_jobs_by_candidates.remove(job_id)  
                print("Job removed from saved list")
                return Response({"success": True, "message": "Job removed from applied list",
                             "user_id": candidate_id,}, status=200)
            else:
                return Response({"sucess": False, "message": 'this job does not exists in your list.'})

    except Candidate.DoesNotExist: 
        return Response({"success": False, "message": "Candidate not found"}, status=404)
    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=500)

@api_view(['POST'])
def applied_to_jobs(request):
    """ function send number of jobs applied by candidate to display on frontend """
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
            job.candidates_applied.remove(candidate.id)  # add candidate to job's applied list
            return Response({"success": True, "message": "Already applied to this job",
                             "user_id": candidate_id,}, status=200)
        else: # candidate has not applied
            job.candidates_applied.add(candidate.id)  # add candidate to job's applied list
            return Response({"success": True, "message": "Sucessfully applied to this job",
                             "user_id": candidate_id,}, status=200)
        
    except Candidate.DoesNotExist or JobVacancies.DoesNotExist: 
        return Response({"success": False, "message": "Candidate -OR- Job not found"}, status=404)
    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=500)    

# --------------------- COMPANY ROUTES ---------------------

@api_view(['POST'])
def add_vacancy(request):
    """ function stores job vacancies in DB from frontend"""
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
            

@api_view(['POST'])
def display_vacancies(request):
    """ function fetches job vacancies from DB to display on frontend"""
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
        print("Error fetching job vacancies:", e)
        return Response({"success": False, "message": f"{str(e)}, no job vacancies list"}, status=500)

@api_view(['POST'])
def add_tests(request):
    """ function stores job vacancies in DB from frontend"""
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)
    test_data = request.data
    JobId = test_data.get("jobId")
    test_title = test_data.get("testTitle")
    is_timed_test = test_data.get("isTimedTest")
    timer = test_data.get("timer") if is_timed_test else 0
    test_questions = test_data.get("questions")  # JSON format

    try:
        job = JobVacancies.objects.get(id = JobId)
        if job:
            company_test = CompanyTests.objects.create(
                job = job,
                test_title = test_title,
                test_is_timed = is_timed_test,
                test_timer = timer,
                test_questions = test_questions,              
            )
            print("Test added successfully")
            return Response({"success": True, "message": "Test added successfully.",
                             "companytest_id": company_test.id}, status=201) 
           
    except JobVacancies.DoesNotExist:
        print("Job vacancy not found")
        return Response({"success": False, "message": "Job vacancy not found"}, status=404)
