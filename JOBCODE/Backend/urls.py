from django.urls import path
from .views import login_views, register_views, cv_profile_views, jobs_views, watchlist_views, tests_views, password_views  

urlpatterns = [
    # path("path name after port no. 8000/", views.function from views file, name = optional)
    path("register/", register_views.register, name='register'),
    path("login/", login_views.login, name='login'),
    path("forgot-password/",password_views.forgot_password, name='update_password'),
    # candidate routes
    path("check-resume/", cv_profile_views.check_resume, name='resume_checking'),
    path("upload-resume/", cv_profile_views.upload_resume, name='resume_uploading'),
    path("display-profile-info/", cv_profile_views.display_profile_info, name='profile_info_display'), 
    path("applied-to-jobs/", jobs_views.applied_to_jobs, name='jobs_applied_display'),
    path("toggle-jobs/", jobs_views.toggle_jobs, name='add-remove-saved-jobs'), 
    # company routes
    path("add-job-vacancy/", jobs_views.add_vacancy, name='add_job_vacancies'),
    path("jobs-display/", jobs_views.display_vacancies, name='jobs_display'),
    path("add-tests/", tests_views.add_tests, name='test_scores_submission'),

]