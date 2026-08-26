import os
import sys
import json
import django

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "JOBCODE.settings")
django.setup()

from django.contrib.auth.hashers import make_password
from Backend.models import CustomUser, Candidate, Company, JobVacancies

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def seed_database():
    print("=" * 60)
    print("SEEDING SAMPLE COMPANIES & CANDIDATES TO SUPABASE POSTGRESQL")
    print("=" * 60)

    # Load Companies JSON
    comp_file = os.path.join(BASE_DIR, "companies_sample.json")
    if os.path.exists(comp_file):
        with open(comp_file, "r") as f:
            companies = json.load(f)

        for comp_data in companies:
            email = comp_data["email"].strip().lower()
            if not CustomUser.objects.filter(email=email).exists():
                user = CustomUser.objects.create(
                    username=comp_data["username"],
                    email=email,
                    password=make_password(comp_data["password"]),
                    role="company",
                )
                company = Company.objects.create(
                    user=user,
                    address=comp_data.get("companyAddress", ""),
                    contact=comp_data.get("contactNumber", ""),
                    website=comp_data.get("companyWebsite", ""),
                )
                print(f"[CREATED COMPANY] {user.username} ({user.email})")

                # Create sample vacancies
                for job_data in comp_data.get("sampleJobVacancies", []):
                    JobVacancies.objects.create(
                        company=company,
                        job_title=job_data["title"],
                        skills_required=job_data["requiredSkills"],
                        level_of_experience=job_data["levelOfExperience"],
                        additional_requirements=job_data["additionalRequirements"],
                        location=job_data["location"],
                        timings=job_data["timing"],
                    )
                print(f"   -> Added {len(comp_data.get('sampleJobVacancies', []))} Job Vacancies")
            else:
                print(f"[EXISTS] Company already exists: {email}")

    # Load Candidates JSON
    cand_file = os.path.join(BASE_DIR, "candidates_sample.json")
    if os.path.exists(cand_file):
        with open(cand_file, "r") as f:
            candidates = json.load(f)

        for cand_data in candidates:
            email = cand_data["email"].strip().lower()
            if not CustomUser.objects.filter(email=email).exists():
                user = CustomUser.objects.create(
                    username=cand_data["username"],
                    email=email,
                    password=make_password(cand_data["password"]),
                    role="candidate",
                )
                Candidate.objects.create(
                    user=user,
                    profession=cand_data.get("profession", ""),
                    experience=cand_data.get("experience", ""),
                    skills=cand_data.get("skills", ""),
                )
                print(f"[CREATED CANDIDATE] {user.username} ({user.email})")
            else:
                print(f"[EXISTS] Candidate already exists: {email}")

    print("\n=" * 60)
    print("DATABASE SEEDING COMPLETED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    seed_database()
