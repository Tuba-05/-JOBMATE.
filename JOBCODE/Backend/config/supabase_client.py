import os
from pathlib import Path
from dotenv import load_dotenv

# Load env variables from project root and JOBCODE dir
root_dir = Path(__file__).resolve().parent.parent.parent.parent
load_dotenv(root_dir / ".env")
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = None
if SUPABASE_URL and SUPABASE_KEY and SUPABASE_KEY != "your_supabase_anon_key_here":
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print("Warning: Supabase client initialization error:", e)
