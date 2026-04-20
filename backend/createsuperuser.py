import os
from django.contrib.auth import get_user_model

print("🔥 Running superuser script...")

User = get_user_model()

username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

print(username, email, password)

if username and email and password:
    user, created = User.objects.get_or_create(username=username)
    user.email = email
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.save()

    print("✅ Superuser created/updated")
else:
    print("❌ Missing environment variables")