from django.urls import path
from . import views

urlpatterns = [
    # path("path name after port no. 8000/", views.function from views file, name = optional)
    path("register/", views.register, name='register'),
    path("login/", views.login, name='login'),
    # candidate routes
    path("check-resume/", views.check_resume, name='resume_checking'),
    path("upload-resume/", views.upload_resume, name='resume_uploading'),
    path("display-profile-info/", views.display_profile_info, name='profile_info_display'), 
    path("candidate-count/", views.jobs_applied, name='jobs_applied_display'),
    path("toggle-jobs/", views.toggle_jobs, name='add-remove-saved-jobs'), 
    # company routes
    path("add-job-vacancy/", views.add_vacancy, name='add_job_vacancies'),
    path("jobs-display/", views.display_vacancies, name='jobs_display'),
    path("add-tests/", views.add_tests, name='test_scores_submission'),

]