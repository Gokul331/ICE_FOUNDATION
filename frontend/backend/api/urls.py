"""
URL configuration for ICE Foundation API.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.accounts.urls')),
]