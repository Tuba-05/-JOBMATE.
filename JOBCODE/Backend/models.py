from django.db import models

# Create your models here.
class CustomUser(models.Model):
    username = models.CharField(max_length=50, null=False)
    email = models.EmailField(null=False)
    password = models.CharField(max_length=200, null=False)
    ROLE_CHOICES = [
        ("candidate", "Candidate"),
        ("company", "Company"),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, null=False)
    
    class Meta: # making email & role pair unique
        constraints = [
            models.UniqueConstraint(fields=['email', 'role'], name='unique_email_role')
        ]


class Candidate(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    profession = models.CharField(max_length=50, null=True, blank=True)
    experience = models.CharField(max_length=10, null=True, blank=True)
    skills = models.TextField(max_length=100, null=True, blank=True)
    resume_link = models.URLField(null=True, blank=True)

class Company(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    address = models.TextField(max_length=300, null=True, blank=True)
    contact = models.CharField(max_length=20, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
