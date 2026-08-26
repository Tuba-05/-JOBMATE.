from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from Backend.models import CustomUser, Company, Candidate, JobVacancies, CompanyTests, TestScores
from Backend.config.supabase_client import supabase
from Backend.utils.jwt_utils import decode_token, protected_route

# --------------------- CANDIDATE ROUTES (PROTECTED) ---------------------

@api_view(["POST"])
@permission_classes([AllowAny])
def toggle_jobs(request):
    """Function to save/remove jobs from candidate saved jobs list."""
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    user_id = None
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("token_type") == "access":
            user_id = payload.get("user_id")

    candidate_id = user_id or request.data.get("candidateId") or request.data.get("UserId") or request.session.get("user_id")
    job_id = request.data.get("jobId")

    if not candidate_id:
        return Response({"success": False, "message": "Authentication required. Please log in as a job seeker."}, status=401)
    if not job_id:
        return Response({"success": False, "message": "Job ID is required."}, status=400)

    try:
        candidate = Candidate.objects.filter(user_id=candidate_id).first() or Candidate.objects.filter(id=candidate_id).first()
        if not candidate:
            return Response({"success": False, "message": "Candidate profile not found"}, status=404)

        if candidate.save_jobs.filter(id=job_id).exists():
            candidate.save_jobs.remove(job_id)
            return Response({"success": True, "message": "Job removed from your saved list", "isSaved": False}, status=200)
        else:
            candidate.save_jobs.add(job_id)
            return Response({"success": True, "message": "Job saved to your collection successfully", "isSaved": True}, status=200)
    except Exception as e:
        print("Toggle Jobs Error:", e)
        return Response({"success": False, "message": f"Error saving job: {str(e)}"}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def applied_to_jobs(request):
    """Function to record candidate job application and fetch applied jobs."""
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    user_id = None
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("token_type") == "access":
            user_id = payload.get("user_id")

    candidate_id = user_id or request.data.get("candidateId") or request.data.get("UserId") or request.session.get("user_id")
    job_id = request.data.get("jobId")

    if not candidate_id:
        return Response({"success": False, "message": "Candidate authentication required."}, status=401)

    try:
        candidate = Candidate.objects.filter(user_id=candidate_id).first() or Candidate.objects.filter(id=candidate_id).first()
        if not candidate:
            return Response({"success": False, "message": "Candidate profile not found"}, status=404)

        if job_id:
            candidate.applied_jobs.add(job_id)

        applied_jobs = list(candidate.applied_jobs.all().values())
        return Response({"success": True, "message": "Application submitted successfully.", "applied_jobs": applied_jobs}, status=200)
    except Exception as e:
        print("Applied Jobs Error:", e)
        return Response({"success": False, "message": f"Error processing application: {str(e)}"}, status=500)


# --------------------- COMPANY ROUTES (PROTECTED) ---------------------

@api_view(["POST"])
@permission_classes([AllowAny])
def add_vacancy(request):
    """Function stores job vacancies in DB for companies."""
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    user_id = None
    user_role = None

    # Check JWT token from Authorization header if present
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("token_type") == "access":
            user_id = payload.get("user_id")
            user_role = payload.get("role")

    job_data = request.data
    company_id = user_id or job_data.get("companyId") or request.session.get("user_id")

    if not company_id:
        return Response(
            {"success": False, "message": "Authentication required. Please log in as an employer."},
            status=401,
        )

    try:
        # Lookup company by user_id or primary key id
        company = Company.objects.filter(user_id=company_id).first() or Company.objects.filter(id=company_id).first()
        if not company:
            return Response({"success": False, "message": "Company profile not found for this account."}, status=404)

        job = JobVacancies.objects.create(
            company=company,
            job_title=job_data.get("title"),
            skills_required=job_data.get("requiredSkills"),
            level_of_experience=job_data.get("levelOfExperience"),
            additional_requirements=job_data.get("additionalRequirements"),
            location=job_data.get("location"),
            timings=job_data.get("timing"),
        )
        return Response(
            {"success": True, "message": "Job vacancy added successfully.", "job_id": job.id},
            status=201,
        )
    except Exception as e:
        print("Add Vacancy Error:", e)
        return Response({"success": False, "message": f"Error publishing vacancy: {str(e)}"}, status=500)


# --------------------- PUBLIC / UNPROTECTED ROUTES ---------------------

@api_view(["POST", "GET"])
@permission_classes([AllowAny])
def display_vacancies(request):
    """Public Unprotected route: Fetches job vacancies for visitors/candidates (Optimized query)."""
    try:
        job_vacancies_list = JobVacancies.objects.select_related("company__user").prefetch_related("companytests_set").all().order_by("-created_at")
        job_data = {}
        for job in job_vacancies_list:
            company_name = "Featured Employer"
            try:
                if job.company and hasattr(job.company, "user") and job.company.user:
                    company_name = job.company.user.username
            except Exception:
                pass

            tests = list(job.companytests_set.all())
            test_obj = tests[0] if tests else None

            job_data[str(job.id)] = {
                "companyId": job.company_id,
                "CompanyName": company_name,
                "jobTitle": job.job_title,
                "skillsRequired": job.skills_required,
                "levelOfExperience": job.level_of_experience,
                "additionalRequirements": job.additional_requirements or "",
                "location": job.location,
                "timings": job.timings,
                "hasTest": bool(test_obj),
                "testId": test_obj.id if test_obj else None,
                "testTitle": test_obj.test_title if test_obj else None,
                "testTimer": test_obj.test_timer if test_obj else 0,
                "questionCount": len(test_obj.test_questions) if (test_obj and test_obj.test_questions) else 0,
                "posted at": job.created_at.strftime("%b %d, %Y - %I:%M %p") if job.created_at else "",
            }
        return Response({"success": True, "message": "Vacancies data delivered", "jobs": job_data}, status=200)
    except Exception as e:
        print("Display Vacancies Error:", e)
        return Response({"success": False, "message": f"Error fetching vacancies: {str(e)}"}, status=500)


@api_view(["POST", "GET"])
@permission_classes([AllowAny])
def company_posted_vacancies(request):
    """Returns all vacancies published by a specific company/employer (Optimized query)."""
    user_id = None
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("token_type") == "access":
            user_id = payload.get("user_id")

    company_id = user_id or request.data.get("companyId") or request.data.get("UserId") or request.session.get("user_id")
    try:
        from django.db.models import Count
        company = Company.objects.filter(user_id=company_id).first() or Company.objects.filter(id=company_id).first()
        if not company:
            return Response({"success": True, "vacancies": []}, status=200)

        vacancies_qs = JobVacancies.objects.filter(company=company).annotate(
            applied_count_ann=Count("candidates_applied")
        ).prefetch_related("companytests_set").order_by("-created_at")

        results = []
        for v in vacancies_qs:
            tests = list(v.companytests_set.all())
            test_obj = tests[0] if tests else None
            results.append({
                "id": v.id,
                "jobTitle": v.job_title,
                "location": v.location,
                "timings": v.timings,
                "experience": v.level_of_experience,
                "skills": v.skills_required,
                "hasTest": bool(test_obj),
                "testTitle": test_obj.test_title if test_obj else None,
                "testTimer": test_obj.test_timer if test_obj else 0,
                "appliedCount": v.applied_count_ann,
                "createdAt": v.created_at.strftime("%b %d, %Y - %I:%M %p") if v.created_at else "",
            })
        return Response({"success": True, "vacancies": results}, status=200)
    except Exception as e:
        print("Company Vacancies Error:", e)
        return Response({"success": True, "vacancies": []}, status=200)


@api_view(["POST", "GET"])
@permission_classes([AllowAny])
def candidate_saved_jobs(request):
    """Returns all saved jobs for a candidate."""
    candidate_id = getattr(request, "user_id", None) or request.data.get("candidateId") or request.data.get("UserId")
    try:
        candidate = Candidate.objects.filter(user_id=candidate_id).first() or Candidate.objects.filter(id=candidate_id).first()
        if not candidate:
            return Response({"success": True, "savedJobs": []}, status=200)

        saved_qs = candidate.save_jobs.all().order_by("-created_at")
        results = []
        for job in saved_qs:
            test_obj = CompanyTests.objects.filter(job=job).first()
            company_name = job.company.user.username if (job.company and job.company.user) else "Enterprise Partner"
            results.append({
                "id": job.id,
                "CompanyName": company_name,
                "jobTitle": job.job_title,
                "skillsRequired": job.skills_required,
                "levelOfExperience": job.level_of_experience,
                "location": job.location,
                "timings": job.timings,
                "hasTest": bool(test_obj),
                "testId": test_obj.id if test_obj else None,
                "testTitle": test_obj.test_title if test_obj else None,
                "testTimer": test_obj.test_timer if test_obj else 0,
                "questionCount": len(test_obj.test_questions) if (test_obj and test_obj.test_questions) else 0,
            })
        return Response({"success": True, "savedJobs": results}, status=200)
    except Exception as e:
        print("Candidate Saved Jobs Error:", e)
        return Response({"success": False, "message": str(e)}, status=500)
