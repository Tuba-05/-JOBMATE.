# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser, Company, Candidate
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.hashers import (make_password, check_password, )  # for hash password
from firebase_config import bucket
import uuid  # Universally Unique Identifier, generates a 128-bit unique value(string)


# @csrf_exempt  # disable CSRF just for API testing (remove later if you use tokens)
@api_view(["POST"])
def register(request):
    """ function takes user inputs for sign up and stores to DB depending of role company/ candidate """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)

    try:
        data = request.data
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        hashed_password = make_password(password)  # making password hashed

        if not CustomUser.objects.filter(email=email).exists():

            if data.get("isHiringDeskMode"):  # Company mode
                user = CustomUser.objects.create(
                    username=username,
                    email=email,
                    password=hashed_password,
                    role="company",
                )

                Company.objects.create(
                    user=user,
                    address=data.get("companyAddress"),
                    contact=data.get("contactNumber"),
                    website=data.get("companyWebsite"),
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

            # sending sy=uccessful response
            return Response(
                {
                    "success": True,
                    "message": "Record added successfully.",
                    "user_id": user.id,
                },
                status=201,
            )

        else:
            return Response(
                {"success": False, "message": "Record already exists"}, status=400
            )

    except Exception as e:
        return Response({"success": False, "message": str(e)})


@api_view(["POST"])
def login(request):
    """ function takes user inputs for logged in """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)
    data = request.data
    email = data.get("email")
    password = data.get("password")
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
        


@api_view(["POST"])
def check_resume(request):
    """ function checks whether the user candidate uploaded his resume or not"""
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)

    data = request.data
    if data.get("role") == "candidate":
        user_id = data.get("UserId")
        try:
            candidate = Candidate.objects.get(user_id=user_id)
        except Candidate.DoesNotExist:
            print("Candidate not found")
            return Response({"success": False, "message": "Candidate not found"}, status=404)

        if not candidate.resume_link:
            print("Resume not found")
            return Response({"success": False, "message": "Resume not found"}, status=404)
        else:
            print("Resume already uploaded")
            return Response({"success": True, "message": "Resume already uploaded"}, status=200)



@api_view(["POST"])
def upload_resume(request):
    """ function takes user id & resume to store in DB in URL form """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)

    user_id = request.POST.get("user_id")
    file = request.FILES.get("resume")

    if not file:  # if file not found
        return Response({"error": "No file uploaded"}, status=404)

    # Unique filename
    file_extension = file.name.split(".")[-1]
    file_name = f"user_{user_id}_{uuid.uuid4()}.{file_extension}"

    blob = bucket.blob(file_name)  # Create a blob in Firebase
    blob.upload_from_file(file, content_type=file.content_type)  # Upload the file
    blob.make_public()  # Makes link publicly viewable

    file_url = blob.public_url  # generates the full URL to access the file.
    print(file_url)

    try:
        candidate = Candidate.objects.get(user_id=user_id)
        candidate.resume_link = file_url
        candidate.save()
        print("Resume uploaded successfully")
        return Response({"success": True, "message": "Resume uploaded successfully!", "url": file_url}, status=201)
    except Candidate.DoesNotExist:
        print("Candidate not found")
        return Response({"success": False, "message": "Candidate not found"}, status=404)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def parse_resume_info(request):
    """ function parse user info from resume & send it to frontend """
    if request.method != "POST":  # invalid http method
        return Response({"error": "Invalid request method"}, status=400)