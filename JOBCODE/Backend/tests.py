import os
import sys
import django
from pathlib import Path

# 1. Add the project root to sys.path (moves up one level from Backend)
# This allows Python to find 'JOBCODE'
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# 2. Set the settings module (ensure 'JOBCODE.settings' is correct)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'JOBCODE.settings')

# 3. Initialize Django
django.setup()

# 4. Use an absolute import for your model
from Backend.models import JobVacancies

# logic
job_listing = JobVacancies.objects.filter(id=1).first()
job_data = {} # initialize an empty dictionary to hold job data
job_data[job_listing.id] = [
    job_listing.job_title, job_listing.company, job_listing.location, job_listing.skills_required, 
    job_listing.level_of_experience, job_listing.timings, job_listing.additional_requirements, 
    job_listing.updated_at]

# ** key  , values in dict ** 
for job_id, details in job_data.items():
    print(f"--- Data for Job ID {job_id} ---")
    for item in details:
        print(item)