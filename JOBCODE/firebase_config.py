import os
from firebase_admin import credentials, initialize_app, storage

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(BASE_DIR, "firebase-key.json")

cred = credentials.Certificate(cred_path)
default_app = initialize_app(cred, {
    'storageBucket': 'jobmate-2753f.appspot.com'
})

bucket = storage.bucket()
