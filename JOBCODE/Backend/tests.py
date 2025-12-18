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

# ***** logic *****
# -------------------------------------------------------------------------
# 1. Retrieve all records (returns a QuerySet), often acts like a standard Python list 
job_listings = JobVacancies.objects.all()

# 2. Initialize the dictionary
job_data = {} 

# 3. Loop through each individual job object in the QuerySet
for job in job_listings:
    # Use the job's id as the key and a list of its details as the value
    job_data[job.id] = [
        job.job_title, 
        job.company, 
        job.location, 
        job.skills_required, 
        job.level_of_experience, 
        job.timings, 
        job.additional_requirements, 
        job.updated_at
    ]
# 4. Iterate over the (key, value)dictionary to print results
for job_id, details in job_data.items(): # key = job id, value = list of details
    print(f"--- Data for Job ID {job_id} ---")
    for item in details:
        pass
        # print(item)

# -------------------------------------------------------------------------

job_vacancies_list = JobVacancies.objects.all().values()  # fetch all job vacancies
    # job_vacancies_list = list(job_vacancies)  # convert QuerySet to list
job_data = {}
for jobs in job_vacancies_list:
    job_data[jobs['id']] = {
            "companyId": jobs['company_id'],
            "jobTitle": jobs['job_title'],
            "skillsRequired": jobs['skills_required'],
            "levelOfExperience": jobs['level_of_experience'],
            "additionalRequirements": jobs['additional_requirements'],
            "location": jobs['location'],
            "timings": jobs['timings'],
            # "createdAt": jobs['created_at'],
            # "updatedAt": jobs['updated_at'],
    }
print(job_data)