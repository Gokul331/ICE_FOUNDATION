"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import serve
import re

def api_root(request):
    return JsonResponse({
        'message': 'ICE Foundation API',
        'endpoints': {
            'register': '/api/register/',
            'login': '/api/login/',
            'profile': '/api/profile/',
        }
    })

# Serve media files in development
def serve_media(request, path=''):
    return serve(request, path, document_root=settings.MEDIA_ROOT)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('colleges.urls')),
    # Serve media files
    path('media/<path:path>', serve_media, name='media'),
]
