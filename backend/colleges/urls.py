from django.urls import path
from .views import (
    get_colleges, get_college_detail,
    get_courses, get_course_detail, suggest_colleges,
    user_profiles, user_profile_detail,
    companies, company_detail,
    timeline_events, timeline_event_detail
)
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Colleges
    path('colleges/', get_colleges, name='get_colleges'),
    path('colleges/<int:college_id>/', get_college_detail, name='get_college_detail'),

    # Courses
    path('courses/', get_courses, name='get_courses'),
    path('courses/<int:course_id>/', get_course_detail, name='get_course_detail'),
    path('colleges/suggest/', suggest_colleges, name='suggest_colleges'),

# Auth endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('check-auth/', views.CheckAuthView.as_view(), name='check-auth'),
  
    # Companies
    path('companies/', companies, name='companies'),
    path('companies/<int:company_id>/', company_detail, name='company_detail'),

    # Timeline Events
    path('timeline/', timeline_events, name='timeline_events'),
    path('timeline/<int:event_id>/', timeline_event_detail, name='timeline_event_detail'),
]
# Add media URL configuration for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
