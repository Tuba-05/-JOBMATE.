from django.urls import path
from .views import (
    login_views,
    register_views,
    session_views,
    password_views,
    cv_profile_views,
    jobs_views,
    watchlist_views,
    tests_views,
)

urlpatterns = [
    # Auth & JWT Routes
    path("register/", register_views.register, name="register"),
    path("login/", login_views.login, name="login"),
    path("logout/", session_views.logout, name="logout"),
    path("user-session/", session_views.get_user_session, name="user_session"),
    path("token/refresh/", session_views.refresh_token_view, name="token_refresh"),
    path("forgot-password/", password_views.forgot_password, name="forgot_password"),
    path("reset-password/", password_views.reset_password, name="reset_password"),
    path("send-query/", session_views.send_query, name="send_query"),
    # Candidate Routes
    path("check-resume/", cv_profile_views.check_resume, name="resume_checking"),
    path("upload-resume/", cv_profile_views.upload_resume, name="resume_uploading"),
    path("display-profile-info/", cv_profile_views.display_profile_info, name="profile_info_display"),
    path("applied-to-jobs/", jobs_views.applied_to_jobs, name="jobs_applied_display"),
    path("toggle-jobs/", jobs_views.toggle_jobs, name="add-remove-saved-jobs"),
    # Company Routes
    path("add-job-vacancy/", jobs_views.add_vacancy, name="add_job_vacancies"),
    path("jobs-display/", jobs_views.display_vacancies, name="jobs_display"),
    path("company-posted-vacancies/", jobs_views.company_posted_vacancies, name="company_posted_vacancies"),
    path("candidate-saved-jobs/", jobs_views.candidate_saved_jobs, name="candidate_saved_jobs"),
    path("add-tests/", tests_views.add_tests, name="test_scores_submission"),
    path("get-job-test/<int:job_id>/", tests_views.get_job_test, name="get_job_test"),
    path("save-test-scores/", tests_views.save_test_scores, name="save_test_scores"),
    path("company-scoreboard/", tests_views.company_scoreboard, name="company_scoreboard"),
]