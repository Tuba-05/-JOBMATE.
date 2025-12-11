from django.db import models
from django.db.models import Q
from django.utils import timezone

# Custom User → Candidate/ Company → JobVacancies → CompanyTests → TestScores
# TestScores → Candidate & TestScores → CompanyTests → JobVacancies → Company.


class CustomUser(models.Model):
    username = models.CharField(max_length=50, null=False, blank=False)
    email = models.EmailField(unique=True,)       # ← UNIQUE
    password = models.CharField(max_length=200, null=False, blank=False)
    ROLE_CHOICES = [
        ("candidate", "Candidate"),
        ("company", "Company"),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True,)
    updated_at = models.DateTimeField(auto_now=True, )

class Candidate(models.Model):
    # PK is assigned default by Django as 'id'
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE) # ← UNIQUE / acts as user_id
    profession = models.CharField(max_length=50, null=True, blank=True) # optional
    experience = models.CharField(max_length=10, null=True, blank=True) # optional
    skills = models.TextField(max_length=100, null=True, blank=True) # optional
    resume_link = models.URLField(null=True, blank=True) # optional
    created_at = models.DateTimeField(auto_now_add=True,)
    updated_at = models.DateTimeField(auto_now=True,)


class Company(models.Model):
    # PK is assigned default by Django as 'id'
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE) # ← UNIQUE / acts as  user_id
    address = models.TextField(max_length=300, null=False, blank=False) # must 
    contact = models.CharField(max_length=20, null=False, blank=False) # must 
    website = models.URLField(null=False, blank=False) # must
    created_at = models.DateTimeField(auto_now_add=True, )
    updated_at = models.DateTimeField(auto_now=True, )


class JobVacancies(models.Model):
    id = models.AutoField(primary_key=True) # job id
    candidates_applied = models.ManyToManyField(Candidate, related_name="applied_jobs",) # list of candidate ids
    company = models.ForeignKey(Company, on_delete=models.CASCADE) # company id
    job_title = models.TextField(null=False, blank=False) # must
    skills_required = models.TextField(null=False, blank=True) # must
    level_of_experience = models.TextField(null=False, blank=False) # must
    additional_requirements = models.TextField(null=True, blank=True) # optional
    location = models.TextField(null=False, blank=False) # must
    timings = models.TextField(null=False, blank=False) # must
    created_at = models.DateTimeField(auto_now_add=True, )
    updated_at = models.DateTimeField(auto_now=True, )

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    (
                        Q(job_title__isnull=True) &
                        Q(skills_required__isnull=True) &
                        Q(level_of_experience__isnull=True) &
                        Q(additional_requirements__isnull=True) &
                        Q(location__isnull=True) &
                        Q(timings__isnull=True)
                    )
                    |
                    (
                        Q(job_title__isnull=False) &
                        Q(skills_required__isnull=False) &
                        Q(level_of_experience__isnull=False) &
                        Q(additional_requirements__isnull=False) &
                        Q(location__isnull=False) &
                        Q(timings__isnull=False)
                    )
                ),
                name="job_fields_all_or_none"
            )
        ]


class CompanyTests(models.Model):
    id = models.AutoField(primary_key=True) # test id
    job = models.ForeignKey(JobVacancies, on_delete=models.CASCADE) # job id
    test_title = models.CharField(null=False, blank=False, max_length=255) # test title , must
    test_is_timed = models.BooleanField(null=True, blank=True) # test is timed or not , optional
    test_timer = models.IntegerField(null=True, blank=True) # timer value if test is timed , optional
    test_questions = models.JSONField(null=False, blank=False) # list of questions in JSON format , must
    created_at = models.DateTimeField(auto_now_add=True,)
    updated_at = models.DateTimeField(auto_now=True, )

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    # If timed, timer must be greater than 0
                    (Q(test_is_timed=True) & Q(test_timer__gt=0)) |
                    # If not timed, timer must be null
                    (Q(test_is_timed=False) & Q(test_timer__isnull=True))
                ),
                name="check_timer_logic"
            )
        ]


class TestScores(models.Model):
    id = models.AutoField(primary_key=True) # score id
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE) # user id
    test_template = models.ForeignKey(CompanyTests, on_delete=models.CASCADE) # test id
    test_marks = models.IntegerField(null=True, blank=True) # total marks , optional
    test_scores = models.IntegerField(null=True, blank=True) # marks obtained , optional
    created_at = models.DateTimeField(auto_now_add=True, )
    updated_at = models.DateTimeField(auto_now=True,)


