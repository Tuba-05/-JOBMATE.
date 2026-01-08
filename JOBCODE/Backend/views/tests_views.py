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

# --------------------- COMPANY ROUTES ---------------------

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
    except Exception as e:
        print("add tests", e)
        return Response({"success": False, "message": f"Internal server error."}, status=500)
    

@api_view(['POST'])    
def save_test_scores(request):
    """ function saves test scores in DB send from frontend """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)
    scores_data =request.data
    candidate_id = scores_data.get("UserId")
    company_test_id =  scores_data.get("CompanyTestID")
    test_marks = scores_data.get("TotalMarks")  
    score = scores_data.get("ObtainedMarks")
    try:
        candidate = Candidate.objects.get(user_id = candidate_id)
        company_test = CompanyTests.objects.get(id = company_test_id)
        if company_test and candidate:
            Test_scores = TestScores.objects.create(
                candidate = candidate,
                test_template = company_test,
                test_marks = test_marks,
                Test_scores = score           
            )
            print("Test Scores added successfully")
            return Response({"success": True, "message": "Test Scores added successfully.", "Candidate Id" : candidate_id,
                             "Company Test Id": company_test.id, "Test Scores Id" : Test_scores.id}, status=201) 
           
    except JobVacancies.DoesNotExist:
        print("Job vacancy not found")
        return Response({"success": False, "message": "Job vacancy not found"}, status=404)
    except Exception as e:
        print("add tests", e)
        return Response({"success": False, "message": f"Internal server error."}, status=500)