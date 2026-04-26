#!/usr/bin/env python
import os
import django
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from colleges.serializers import RegisterSerializer
from django.contrib.auth.models import User

print("Testing email sending during registration...\n")

# Test data
test_data = {
    'username': 'emailtest456',
    'email': 'emailtest@icefoundation.com',
    'password': 'TestPass123!',
    'password2': 'TestPass123!',
    'first_name': 'Email',
    'last_name': 'Test',
    'phone_number': '9876543210'
}

# Remove user if exists
User.objects.filter(username=test_data['username']).delete()

print(f"Registering user: {test_data['username']}")
print(f"Email: {test_data['email']}\n")

try:
    serializer = RegisterSerializer(data=test_data)
    if serializer.is_valid():
        user = serializer.save()
        print(f"\n✓ User created successfully!")
        print(f"  Username: {user.username}")
        print(f"  Email: {user.email}")
    else:
        print(f"✗ Validation errors: {serializer.errors}")
except Exception as e:
    print(f"✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
