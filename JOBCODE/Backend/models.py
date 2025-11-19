from django.db import models
from django.db.models import Q
from django.utils import timezone

class CustomUser(models.Model):
    username = models.CharField(max_length=50, null=False)
    email = models.EmailField(unique=True)       # ← UNIQUE
    password = models.CharField(max_length=200, null=False)
    ROLE_CHOICES = [
        ("candidate", "Candidate"),
        ("company", "Company"),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Candidate(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE) # ← UNIQUE / acts as an id
    profession = models.CharField(max_length=50, null=True, blank=True)
    experience = models.CharField(max_length=10, null=True, blank=True)
    skills = models.TextField(max_length=100, null=True, blank=True)
    resume_link = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Company(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE) # ← UNIQUE / acts as an id
    address = models.TextField(max_length=300, null=True, blank=True)
    contact = models.CharField(max_length=20, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class JobVacancies(models.Model):
    job_id = models.AutoField(primary_key=True)
    candidates_applied = models.ManyToManyField(Candidate, related_name="applied_jobs")
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    job_title = models.TextField(null=True, blank=True)
    skills_required = models.TextField(null=True, blank=True)
    level_of_experience = models.TextField(null=True, blank=True)
    additional_requirements = models.TextField(null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    timings = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    test_id = models.AutoField(primary_key=True)
    job = models.ForeignKey(JobVacancies, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    test_title = models.TextField(null=True, blank=True)
    test_is_timed = models.BooleanField(null=True, blank=True)
    test_timer = models.TextField(null=True, blank=True)
    test_questions = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    (Q(test_is_timed=True) & Q(test_timer__isnull=False)) |
                    (Q(test_is_timed=False) & Q(test_timer__isnull=True))
                ),
                name="check_timer_requirement"
            )
        ]


class TestScores(models.Model):
    score_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    job = models.ForeignKey(JobVacancies, on_delete=models.CASCADE)
    test = models.ForeignKey(CompanyTests, on_delete=models.CASCADE)
    total_marks = models.IntegerField(null=True, blank=True)
    obtained_marks = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

