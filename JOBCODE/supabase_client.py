import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()  # Must be called BEFORE reading environment variables

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(SUPABASE_URL, SUPABASE_KEY)  # <-- check if it prints your values

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
