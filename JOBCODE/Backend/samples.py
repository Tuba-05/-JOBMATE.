import os, sys
import django
from django.contrib.auth.hashers import (make_password, check_password, )

# Add project root to sys.path (optional, but helps)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "JOBCODE.settings")
django.setup()

from Backend.models import CustomUser

# test code
password = 'taiba09'
hashed_password = make_password(password) 
user = CustomUser.objects.get(email='taibanaushad2009@gmail.com')
user.password = hashed_password
user.save()
print('done!')
