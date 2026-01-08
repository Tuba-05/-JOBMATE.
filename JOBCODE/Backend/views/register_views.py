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
        print("register", e)
        return Response({"success": False, "message": "Internal server error."})

