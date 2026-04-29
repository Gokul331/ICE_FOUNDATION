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
    
def serve_media(request, path=''):
    return serve(request, path, document_root=settings.MEDIA_ROOT)

urlpatterns = [

    path('admin/', admin.site.urls),
    path('api/', include('colleges.urls')),
    # Serve media files
    path('media/<path:path>', serve_media, name='media'),
]