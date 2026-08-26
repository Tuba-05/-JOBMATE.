import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
cred_path = os.path.join(BASE_DIR, "firebase-key.json")

bucket = None
if os.path.exists(cred_path):
    try:
        from firebase_admin import credentials, initialize_app, storage, _apps
        if not _apps:
            cred = credentials.Certificate(cred_path)
            default_app = initialize_app(cred, {
                'storageBucket': 'jobmate-2753f.appspot.com'
            })
        bucket = storage.bucket()
    except Exception as e:
        print("Warning: Firebase initialization error:", e)
