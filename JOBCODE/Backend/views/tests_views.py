from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from Backend.models import Candidate, JobVacancies, CompanyTests, TestScores
from Backend.utils.jwt_utils import decode_token, protected_route


@api_view(["POST"])
@permission_classes([AllowAny])
def add_tests(request):
    """Function stores job screening tests in DB for companies."""
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    test_data = request.data
    job_id = test_data.get("jobId")
    test_title = test_data.get("testTitle")
    is_timed_test = bool(test_data.get("isTimedTest"))
    timer_raw = test_data.get("timer")

    timer = 0
    if is_timed_test and timer_raw is not None:
        try:
            val = float(timer_raw)
            if val > 0:
                timer = max(1, int(round(val)))
        except (ValueError, TypeError):
            timer = 0

    test_questions = test_data.get("questions")

    if not job_id:
        return Response({"success": False, "message": "Job ID is missing. Please create a vacancy first."}, status=400)

    try:
        job = JobVacancies.objects.filter(id=job_id).first()
        if not job:
            return Response({"success": False, "message": f"Job vacancy (ID #{job_id}) not found."}, status=404)

        company_test = CompanyTests.objects.create(
            job=job,
            test_title=test_title,
            test_is_timed=is_timed_test,
            test_timer=timer,
            test_questions=test_questions,
        )
        return Response(
            {
                "success": True,
                "message": "Screening test created and attached to job vacancy successfully.",
                "companytest_id": company_test.id,
            },
            status=201,
        )
    except Exception as e:
        print("Add Tests Error:", e)
        return Response({"success": False, "message": f"Error saving test: {str(e)}"}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def save_test_scores(request):
    """Function saves candidate test scores in DB."""
    if request.method != "POST":
        return Response({"error": "Invalid request method"}, status=405)

    user_id = None
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("token_type") == "access":
            user_id = payload.get("user_id")

    scores_data = request.data
    candidate_id = user_id or scores_data.get("UserId") or scores_data.get("candidateId") or request.session.get("user_id")
    company_test_id = scores_data.get("CompanyTestID")
    test_marks = scores_data.get("TotalMarks")
    score = scores_data.get("ObtainedMarks")

    if not candidate_id:
        return Response({"success": False, "message": "Candidate authentication required."}, status=401)
    if not company_test_id:
        return Response({"success": False, "message": "Test ID is missing."}, status=400)

    try:
        candidate = Candidate.objects.filter(user_id=candidate_id).first() or Candidate.objects.filter(id=candidate_id).first()
        company_test = CompanyTests.objects.filter(id=company_test_id).first()

        if not candidate or not company_test:
            return Response({"success": False, "message": "Candidate or test template not found."}, status=404)

        test_score = TestScores.objects.create(
            candidate=candidate,
            test_template=company_test,
            test_marks=test_marks,
            test_scores=score,
        )
        return Response(
            {
                "success": True,
                "message": "Test scores saved successfully.",
                "user_id": candidate_id,
                "company_test_id": company_test.id,
                "test_scores_id": test_score.id,
            },
            status=201,
        )
    except Exception as e:
        print("Save Test Scores Error:", e)
        return Response({"success": False, "message": f"Error saving test scores: {str(e)}"}, status=500)


@api_view(["POST", "GET"])
@permission_classes([AllowAny])
def company_scoreboard(request):
    """Returns candidate test scores and assessments for company posted vacancies."""
    user_id = None
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("token_type") == "access":
            user_id = payload.get("user_id")

    company_id = user_id or request.data.get("companyId") or request.data.get("UserId") or request.session.get("user_id")

    try:
        from Backend.models import Company
        company = None
        if company_id:
            company = Company.objects.filter(user_id=company_id).first() or Company.objects.filter(id=company_id).first()

        if company:
            test_scores_qs = TestScores.objects.filter(
                test_template__job__company=company
            ).select_related("candidate__user", "test_template__job")
        else:
            test_scores_qs = TestScores.objects.all().select_related("candidate__user", "test_template__job")

        scores_list = []
        for score_obj in test_scores_qs:
            percentage = round((score_obj.test_scores / score_obj.test_marks * 100), 1) if score_obj.test_marks > 0 else 0
            scores_list.append({
                "id": score_obj.id,
                "candidateName": score_obj.candidate.user.username if score_obj.candidate and score_obj.candidate.user else "Candidate",
                "candidateEmail": score_obj.candidate.user.email if score_obj.candidate and score_obj.candidate.user else "N/A",
                "jobTitle": score_obj.test_template.job.job_title if score_obj.test_template and score_obj.test_template.job else "N/A",
                "testTitle": score_obj.test_template.test_title if score_obj.test_template else "Assessment Test",
                "obtainedMarks": score_obj.test_scores,
                "totalMarks": score_obj.test_marks,
                "percentage": percentage,
                "status": "PASSED" if percentage >= 50 else "FAILED",
                "submittedAt": score_obj.created_at.strftime("%b %d, %Y - %I:%M %p"),
            })

        return Response({"success": True, "scores": scores_list}, status=200)
    except Exception as e:
        print("Company Scoreboard Error:", e)
        return Response({"success": False, "message": str(e)}, status=500)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def get_job_test(request, job_id):
    """Fetches screening test details and questions for a specific job."""
    try:
        test_obj = CompanyTests.objects.filter(job_id=job_id).first()
        if not test_obj:
            return Response({"success": False, "message": "No test attached to this job vacancy."}, status=404)

        return Response(
            {
                "success": True,
                "test": {
                    "id": test_obj.id,
                    "jobId": test_obj.job.id,
                    "companyName": test_obj.job.company.company_name if test_obj.job and test_obj.job.company else "TechVerse Solutions",
                    "testTitle": test_obj.test_title,
                    "isTimed": test_obj.test_is_timed,
                    "timer": test_obj.test_timer,
                    "questions": test_obj.test_questions or [],
                },
            },
            status=200,
        )
    except Exception as e:
        print("Get Job Test Error:", e)
        return Response({"success": False, "message": "Internal server error."}, status=500)