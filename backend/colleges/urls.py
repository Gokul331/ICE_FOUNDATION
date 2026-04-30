from django.urls import path
from .views import (
    download_application_pdf, 
    get_colleges, 
    get_college_detail, 
    get_college_courses, 
    get_college_fees,
    get_courses, 
    get_course_detail, 
    get_filtered_fees, 
    get_fee_detail,
    get_fee_statistics, 
    get_fee_comparison, 
    suggest_colleges,
    get_college_hostels, 
    get_hostel_by_room_type, 
    get_available_hostels, 
    get_hostel_detail, 
    update_profile,
    user_profiles, 
    user_profile_detail, 
    timeline_events, 
    timeline_event_detail,
    password_reset_request, 
    password_reset_confirm,
    get_application_form_data, 
    submit_application,
    get_my_applications, 
    get_application_detail,
    get_application_detail_page,
    sync_applications_to_local,
    
    # New views for course categories
    get_college_course_categories,
    get_colleges_by_course_category,
    get_courses_by_category,
    bulk_update_college_categories,
    get_course_category_stats,
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
    path('colleges/<int:college_id>/hostels/', get_college_hostels, name='get_college_hostels'),
    path('colleges/<int:college_id>/hostels/<int:room_type>/', get_hostel_by_room_type, name='get_hostel_by_room_type'),
    path('colleges/suggest/', suggest_colleges, name='suggest_colleges'),
    
    # ==================== COLLEGE COURSE CATEGORIES (NEW) ====================
    path('colleges/categories/', get_college_course_categories, name='get_college_course_categories'),
    path('colleges/by-category/', get_colleges_by_course_category, name='get_colleges_by_course_category'),
    path('colleges/categories/stats/', get_course_category_stats, name='get_course_category_stats'),
    path('colleges/bulk-update-categories/', bulk_update_college_categories, name='bulk_update_college_categories'),
    
    # ==================== COURSES ====================
    path('courses/', get_courses, name='get_courses'),
    path('courses/<int:course_id>/', get_course_detail, name='get_course_detail'),
    
    # ==================== COURSE CATEGORIES (NEW) ====================
    path('courses/categories/', get_courses_by_category, name='get_courses_by_category'),
    path('courses/categories/<str:category>/', get_courses_by_category, name='get_courses_by_category_filtered'),

    # ==================== FEES ====================
    path('fees/', get_filtered_fees, name='get_filtered_fees'),
    path('fees/<int:fee_id>/', get_fee_detail, name='get_fee_detail'),
    path('fees/statistics/', get_fee_statistics, name='get_fee_statistics'),
    path('fees/comparison/', get_fee_comparison, name='get_fee_comparison'),

    # ==================== HOSTELS ====================
    path('hostels/', get_available_hostels, name='get_available_hostels'),
    path('hostels/<int:hostel_id>/', get_hostel_detail, name='get_hostel_detail'),

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
    path('change-password/', views.change_password, name='change_password'),
    path('profile/update/', update_profile, name='update_profile'),

    # ==================== TIMELINE EVENTS ====================
    path('timeline/', timeline_events, name='timeline_events'),
    path('timeline/<int:event_id>/', timeline_event_detail, name='timeline_event_detail'),

    # ==================== PASSWORD RESET ====================
    path('password-reset/', password_reset_request, name='password_reset_request'),
    path('password-reset-confirm/', password_reset_confirm, name='password_reset_confirm'),

    # ==================== APPLICATION FORM ====================
    path('application-form-data/', get_application_form_data, name='get_application_form_data'),
    path('submit-application/', submit_application, name='submit_application'),
    
    # ==================== MY APPLICATIONS ====================
    path('my-applications/', get_my_applications, name='get_my_applications'),
    path('my-applications/<str:application_id>/', get_application_detail, name='get_application_detail'),
    path('applications/<str:application_id>/', get_application_detail_page, name='application_detail_page'),
    
    # ==================== PDF DOWNLOAD ====================
    path('download-application-pdf/<str:application_id>/', download_application_pdf, name='download_application_pdf'),
    
    # ==================== ADMIN BACKUP ====================
    path('sync-applications/', sync_applications_to_local, name='sync_applications'),
]

# Add media URL configuration for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)