#!/usr/bin/env python
import os
import django
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

print("Testing password reset email...\n")

# Get an existing user or create one
user, created = User.objects.get_or_create(
    username='resettest',
    defaults={
        'email': 'resettest@icefoundation.com',
        'first_name': 'Reset',
        'last_name': 'Test'
    }
)

print(f"User: {user.username}")
print(f"Email: {user.email}\n")

# Generate token
token = default_token_generator.make_token(user)
uid = urlsafe_base64_encode(force_bytes(user.pk))
reset_link = f"https://icefoundation.vercel.app/reset-password/{uid}/{token}/"

print("Sending password reset email...\n")

try:
    subject = 'Password Reset Request - ICE Foundation'
    message = render_to_string('emails/password_reset_email.html', {
        'user': user,
        'reset_link': reset_link,
    })
    send_mail(
        subject,
        f'Password reset requested for {user.email}',
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=message,
        fail_silently=False
    )
    print("✓ Password reset email sent successfully!")
except Exception as e:
    print(f"✗ Error sending email: {str(e)}")
    import traceback
    traceback.print_exc()
