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
        
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)    
    
    except Exception as e:
        print("login", e)
        return Response({"success": False, "message": f"Internal server error"}, status=500)
