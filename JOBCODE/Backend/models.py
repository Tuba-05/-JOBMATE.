from django.db import models
from django.db.models import Q
from django.utils import timezone

# Custom User → Candidate/ Company → JobVacancies → CompanyTests → TestScores
# TestScores → Candidate & TestScores → CompanyTests → JobVacancies → Company.


class CustomUser(models.Model):
    username = models.CharField(max_length=150, null=False, blank=False)
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
                                                        # Intermediary Table
    save_jobs = models.ManyToManyField("JobVacancies", related_name="saved_jobs",) # list of saved job ids
    # full_name = models.CharField(max_length=150, null=False, blank=False) # must
    profession = models.CharField(max_length=50, null=True, blank=True) # optional
    experience = models.CharField(max_length=10, null=True, blank=True) # optional
    skills = models.TextField(max_length=1000, null=True, blank=True) # optional
    resume_link = models.URLField(null=True, blank=True) # optional
    created_at = models.DateTimeField(auto_now_add=True,)
    updated_at = models.DateTimeField(auto_now=True,)


class Company(models.Model):
    # PK is assigned default by Django as 'id'
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE) # ← UNIQUE / acts as  user_id
    address = models.TextField(max_length=300, null=False, blank=False, default="") # must 
    contact = models.CharField(max_length=20, null=False, blank=False, default="") # must 
    website = models.URLField(null=False, blank=False, default="") # must
    created_at = models.DateTimeField(auto_now_add=True, )
    updated_at = models.DateTimeField(auto_now=True, )


class JobVacancies(models.Model):
    id = models.AutoField(primary_key=True) # job id             # Intermediary Table
    candidates_applied = models.ManyToManyField(Candidate, related_name="applied_jobs",) # list of candidate ids
    company = models.ForeignKey(Company, on_delete=models.CASCADE) # company id
    job_title = models.TextField(null=False, blank=False) # must
    skills_required = models.TextField(null=False, blank=False) # must
    level_of_experience = models.TextField(null=False, blank=False) # must
    additional_requirements = models.TextField(null=True, blank=True) # optional
    location = models.TextField(null=False, blank=False) # must 
    timings = models.TextField(null=False, blank=False) # must
    created_at = models.DateTimeField(auto_now_add=True, )
    updated_at = models.DateTimeField(auto_now=True, )


class CompanyTests(models.Model):
    id = models.AutoField(primary_key=True) # test id
    job = models.ForeignKey(JobVacancies, on_delete=models.CASCADE) # job id
    test_title = models.CharField(null=False, blank=False, max_length=255) # test title , must
    test_is_timed = models.BooleanField(default=False) # test is timed or not , optional
    test_timer = models.IntegerField(default=0) # timer value if test is timed , optional
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
                    (Q(test_is_timed=False) & Q(test_timer__lte=0))
                ),
                name="check_timer_logic"
            )
        ]


class TestScores(models.Model):
    id = models.AutoField(primary_key=True) # score id
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE) # user id
    test_template = models.ForeignKey(CompanyTests, on_delete=models.CASCADE) # test id
    test_marks = models.IntegerField(default=0,) # total marks 
    test_scores = models.IntegerField(default=0,) # marks obtained 
    created_at = models.DateTimeField(auto_now_add=True, )
    updated_at = models.DateTimeField(auto_now=True,)


