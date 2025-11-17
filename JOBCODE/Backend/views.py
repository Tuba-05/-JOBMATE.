from django.http import JsonResponse 
import json
from .models import CustomUser, Company, Candidate
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password # for hash password
# from rest_framework.response import Response
from firebase_config import bucket

@csrf_exempt  # disable CSRF just for API testing (remove later if you use tokens)
@api_view(['POST'])
def register(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request method"}, status=400)

    try:
        data = json.loads(request.body.decode('utf-8'))

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        hashed_password = make_password(password) # making password hashed

        if not CustomUser.objects.filter(email=email).exists():

            if data.get("isHiringDeskMode"):  # Company mode
                user = CustomUser.objects.create(
                    username=username,
                    email=email,
                    password=hashed_password,  
                    role='company'
                )

                Company.objects.create(
                    user=user,
                    address=data.get('companyAddress'),
                    contact=data.get('contactNumber'),
                    website=data.get('companyWebsite'),
                )

            else:  # Candidate mode
                user = CustomUser.objects.create(
                    username=username,
                    email=email,
                    password=hashed_password,  
                    role='candidate'
                )

                Candidate.objects.create(
                    user=user,
                )

            # sending sy=uccessful response   
            return JsonResponse({ 'success': True, 'message': 'Record added successfully.',
                                 'user_id': user.id }, status=201)

        else:
            return JsonResponse({'success': False, 'message': 'Record already exists'}, status=400)

    except Exception as e:
        return JsonResponse({"success": False, 'message': str(e)})        

@api_view(['POST'])
def login(requests):
    pass

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_resume(request):
    user_id = request.POST.get("user_id")
    file = request.FILES.get("resume")

    if not file: # if file not found
        return JsonResponse({"error": "No file uploaded"}, status=400)

    # Unique filename
    file_extension = file.name.split(".")[-1]
    file_name = f"user_{user_id}_{uuid.uuid4()}.{file_extension}"

    blob = bucket.blob(file_name) # Create a blob in Firebase
    blob.upload_from_file(file, content_type=file.content_type) # Upload the file
    blob.make_public()  # Makes link publicly viewable 
    
    file_url = blob.public_url # generates the full URL to access the file.
    print(file_url)
    if Candidate.objects.filter(user_id =user_id).exists():
        Candidate.objects.create(
            resume_link = file_url
        )

    return JsonResponse({"message": "Resume uploaded successfully!", "url": file_url }, status=201)
    
    
