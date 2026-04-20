import os
from django.contrib.auth import get_user_model

print("🔥 Running superuser script...")
User = get_user_model()

username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@gmail.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin123")

user, created = User.objects.get_or_create(username=username)

user.email = email
user.set_password(password)
user.is_staff = True
user.is_superuser = True
user.save()

print("Superuser ready")