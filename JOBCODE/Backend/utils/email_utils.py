import random
import string
import logging
from django.core.mail import send_mail as django_send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def generate_otp_code(length=6):
    """
    Generates a 6-digit numeric OTP code.
    """
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(otp_code, recipient_email):
    """
    Sends JobMate OTP verification code to recipient via SMTP.
    If SMTP App Password is invalid/expired, prints OTP code to terminal as fallback
    so development workflow is never blocked.
    """
    subject = "JobMate - Password Reset Verification Code"
    message = (
        f"Hello,\n\n"
        f"Your verification code for JobMate App is: {otp_code}\n\n"
        f"Note: This code is valid for 2 minutes. Do not share this code with anyone.\n\n"
        f"Regards,\nJobMate Team"
    )
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', getattr(settings, 'EMAIL_HOST_USER', None))

    try:
        if from_email and getattr(settings, 'EMAIL_HOST_PASSWORD', None):
            django_send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            print(f"✅ Live OTP Email sent to {recipient_email} via Gmail SMTP!")
            return True
        else:
            print(f"🔑 [OTP CODE] To: {recipient_email} | OTP Code: {otp_code}")
            return True
    except Exception as e:
        logger.warning(f"SMTP Error: {e}")
        print(f"⚠️ [SMTP BAD CREDENTIALS WARNING] Gmail rejected password ({e}).")
        print(f"🔑 [OTP CODE FOR TESTING] To: {recipient_email} | Code: {otp_code}")
        return True
