# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import serve
import re

from dj_rest_auth.views import LogoutView
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter

def api_root(request):
    return JsonResponse({
        'message': 'ICE Foundation API',
        'endpoints': {
            'register': '/api/register/',
            'login': '/api/login/',
            'profile': '/api/profile/',
            'auth': {
                'login': '/api/auth/login/',
                'logout': '/api/auth/logout/',
                'google': '/api/auth/google/',
                'registration': '/api/auth/registration/',
            }
        }
    })

# Define Google Login View
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

def serve_media(request, path=''):
    return serve(request, path, document_root=settings.MEDIA_ROOT)

# Main URL patterns
urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/', include('colleges.urls')),
    path('media/<path:path>', serve_media, name='media'),
    
    # Auth URLs
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
]