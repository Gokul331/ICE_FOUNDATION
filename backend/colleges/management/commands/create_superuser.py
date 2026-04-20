from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os


class Command(BaseCommand):
    help = 'Create superuser automatically'

    def handle(self, *args, **kwargs):
        print("🔥 Running superuser script...")

        User = get_user_model()

        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not username or not email or not password:
            self.stdout.write(self.style.ERROR("❌ Missing environment variables"))
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write("⚠️ Superuser already exists")
        else:
            User.objects.create_superuser(username, email, password)
            self.stdout.write(self.style.SUCCESS("✅ Superuser created"))