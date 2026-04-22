from django.urls import path
from .views import (
    get_colleges, get_college_detail, get_college_courses, get_college_fees,
    get_courses, get_course_detail, get_course_fees, get_fee_detail, 
    get_fee_statistics, suggest_colleges, get_hostel_options, get_filtered_fees,
    user_profiles, user_profile_detail, timeline_events, timeline_event_detail
)
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ==================== COLLEGES ====================
    path('colleges/', get_colleges, name='get_colleges'),
    path('colleges/<int:college_id>/', get_college_detail, name='get_college_detail'),
    path('colleges/<int:college_id>/courses/', get_college_courses, name='get_college_courses'),
    path('colleges/<int:college_id>/fees/', get_college_fees, name='get_college_fees'),
    path('colleges/<int:college_id>/hostel-options/', get_hostel_options, name='get_hostel_options'),
    path('colleges/suggest/', suggest_colleges, name='suggest_colleges'),

    # ==================== COURSES ====================
    path('courses/', get_courses, name='get_courses'),
    path('courses/<int:course_id>/', get_course_detail, name='get_course_detail'),
    path('courses/<int:course_id>/fees/', get_course_fees, name='get_course_fees'),

    # ==================== FEES ====================
    path('fees/<int:fee_id>/', get_fee_detail, name='get_fee_detail'),
    path('fees/statistics/', get_fee_statistics, name='get_fee_statistics'),
    path('fees/filter/', get_filtered_fees, name='get_filtered_fees'),

    # ==================== AUTHENTICATION ====================
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('check-auth/', views.CheckAuthView.as_view(), name='check-auth'),

    # ==================== USER PROFILES ====================
    path('user-profiles/', user_profiles, name='user_profiles'),
    path('user-profiles/<int:profile_id>/', user_profile_detail, name='user_profile_detail'),
    
    # Profile Management
    path('profile/me/', views.get_current_user_profile, name='current_user_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/create-update/', views.create_or_update_profile, name='create_update_profile'),
    path('profile/update/<int:profile_id>/', views.update_profile_by_id, name='update_profile_by_id'),
    path('change-password/', views.change_password, name='change_password'),

    # ==================== TIMELINE EVENTS ====================
    path('timeline/', timeline_events, name='timeline_events'),
    path('timeline/<int:event_id>/', timeline_event_detail, name='timeline_event_detail'),
]

# Add media URL configuration for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)