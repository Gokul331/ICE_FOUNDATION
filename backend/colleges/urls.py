from django.urls import path
from .views import (
    get_college_fees, get_colleges, get_college_detail, get_course_fees,
    get_courses, get_course_detail, get_fee_detail, get_fee_statistics, suggest_colleges,
    user_profiles, user_profile_detail,
    timeline_events, timeline_event_detail,
    get_college_courses
)
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Colleges
    path('colleges/', get_colleges, name='get_colleges'),
    path('colleges/<int:college_id>/', get_college_detail, name='get_college_detail'),
    path('colleges/<int:college_id>/courses/', get_college_courses, name='get_college_courses'),
    
    # College Fees - Fixed to match pattern (no /api/ prefix)
    path('colleges/<int:college_id>/fees/', get_college_fees, name='college-fees'),

    # Courses
    path('courses/', get_courses, name='get_courses'),
    path('courses/<int:course_id>/', get_course_detail, name='get_course_detail'),
    
    # Course Fees
    path('courses/<int:course_id>/fees/', get_course_fees, name='course-fees'),
    
    # Fee Details
    path('fees/<int:fee_id>/', get_fee_detail, name='fee-detail'),
    path('fees/statistics/', get_fee_statistics, name='fee-statistics'),
    
    # College Suggestions
    path('colleges/suggest/', suggest_colleges, name='suggest_colleges'),

    # Auth endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('check-auth/', views.CheckAuthView.as_view(), name='check-auth'),

    # User Profiles
    path('user-profiles/', user_profiles, name='user_profiles'),
    path('user-profiles/<int:profile_id>/', user_profile_detail, name='user_profile_detail'),

    # Timeline Events
    path('timeline/', timeline_events, name='timeline_events'),
    path('timeline/<int:event_id>/', timeline_event_detail, name='timeline_event_detail'),
]

# Add media URL configuration for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)