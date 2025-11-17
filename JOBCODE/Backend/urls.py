from django.urls import path
from . import views

urlpatterns = [
    # path("path name after port no. 8000/", views.function from views file, name = optional)
    path("register/", views.register, name='register'),
    path("login/", views.login, name='login'),
    path("upload-resume/", views.upload_resume, name='resume_uploading'), 
    path("check-resume/", views.check_resume, name='resume_checking'),
    path("display-profile-info/", views.parse_resume_info, name='parsing_resume_info') 
]