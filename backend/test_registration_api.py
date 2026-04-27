#!/usr/bin/env python
import os
import django
import sys
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User

print("Testing Registration API Endpoint...\n")

# Clean up any existing test user
User.objects.filter(username='apitest123').delete()

# Create test client
client = Client()

# Test registration data
registration_data = {
    'username': 'apitest123',
    'email': 'apitest@icefoundation.com',
    'password': 'TestPass123!',
    'password2': 'TestPass123!',
    'first_name': 'API',
    'last_name': 'Test'
}

print("Sending registration request...")
print(f"Data: {json.dumps(registration_data, indent=2)}\n")

try:
    response = client.post(
        '/api/register/',
        data=json.dumps(registration_data),
        content_type='application/json'
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}\n")
    
    if response.status_code == 201:
        print("✓ Registration successful!")
    else:
        print("✗ Registration failed!")
        
except Exception as e:
    print(f"✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
