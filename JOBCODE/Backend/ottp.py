import random
import string
import smtplib

def generate_random_password(length=6):
    """
    Generates a random password of a specified length.
    By default, it generates a 6-character password.
    """
     # Only allow these punctuation marks instead of all
    allowed_punctuations = "!@#*%$"
    # Combine lowercase, uppercase letters, digits, and punctuation for a strong password
    characters = string.ascii_letters + string.digits + allowed_punctuations
    
    # Use random.SystemRandom() for cryptographically secure randomness
    # This is preferred over random.choice for security-sensitive applications
    secure_random = random.SystemRandom()
    
    password = ''.join(secure_random.choice(characters) for _ in range(length)) # list ko string me convert k liye join use kiya 
    return password


def send_mail(password, receiver):
    sender = "tubabintenaushad@gmail.com"
    app_password = "jlgo kkjo jsii wudg"
    email_receiver = receiver

    message = f"Subject:Forgot password Verification Code\n\nThis is your verification code for Investify App login {password}" \
    "\n NOTE: this code will be active for 2 minutes."

    try:
        # connect to Gmail's SMTP server
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()  # secure the connection
        server.login(sender, app_password)
        server.sendmail(sender, email_receiver, message)
        print("✅ Email sent successfully!")
        return True
    except Exception as e:
        print("⚠️ Error:", e)
        return False
    finally:
        server.quit()


