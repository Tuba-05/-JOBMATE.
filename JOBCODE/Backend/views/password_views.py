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


@api_view(['POST'])
def forgot_password(request):
    """ function takes email of user, verify it by generating code then change existing password to new one."""
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)
    user_data = request.data
    email = user_data.get("email")
    try:
        if email:
            user = CustomUser.objects.get(email= email)
            ottp_code = generate_random_password()
            email_sent= send_mail(ottp_code, user.email)
            if email_sent:
                return Response({"success": True,"message": "Ottp has been sent to email", 
                                 "OttpCode": ottp_code}, status=201)
            else:
                print("Failed to send email")  
                return Response({"success": False,"message": "failed to sent code ", }, status=201)  
    except CustomUser.DoesNotExist:
        return Response({"success": False, "message": "User not found"}, status=404)
    except Exception as e:
        print("forgot password", e)
        return Response({"success": False, "message": f"Internal server error"}, status=500)   
