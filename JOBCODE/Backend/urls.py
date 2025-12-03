from django.urls import path
from . import views

urlpatterns = [
    # path("path name after port no. 8000/", views.function from views file, name = optional)
    path("register/", views.register, name='register'),
    path("login/", views.login, name='login'),
    path("check-resume/", views.check_resume, name='resume_checking'),
    path("upload-resume/", views.upload_resume, name='resume_uploading'),
    path("display-profile-info/", views.display_profile_info, name='profile_info_display'), 
    path("add-job-vacancy/", views.add_job, name='add_job_vacancies'),

]