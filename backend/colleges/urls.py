from django.urls import path
from .views import (
    get_colleges, 
    get_college_detail, 
    get_college_courses, 
    get_courses, 
    get_course_detail, 
    suggest_colleges,
    get_application_form_data, 
    submit_application,
    get_my_applications, 
    get_application_detail,
    download_application_pdf,
    
    # Views for course categories
    get_college_course_categories,
    get_colleges_by_course_category,
    get_courses_by_category,
    bulk_update_college_categories,
    get_course_category_stats,
    
    # College Image Views
    get_college_gallery,
    get_college_images_by_category,
    get_college_slideshow_images,
    get_featured_colleges,
    get_colleges_with_gallery,
    add_college_images,
    update_college_banner_image,
    delete_college_image,
    bulk_upload_college_images,
)

from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ==================== COLLEGES ====================
    path('colleges/', get_colleges, name='get_colleges'),
    path('colleges/<int:college_id>/', get_college_detail, name='get_college_detail'),
    path('colleges/<int:college_id>/courses/', get_college_courses, name='get_college_courses'),
    path('colleges/suggest/', suggest_colleges, name='suggest_colleges'),
    
    # ==================== COLLEGE IMAGES ====================
    # Gallery and Images
    path('colleges/<int:college_id>/gallery/', get_college_gallery, name='college-gallery'),
    path('colleges/<int:college_id>/gallery/<str:category>/', get_college_images_by_category, name='college-images-by-category'),
    path('colleges/<int:college_id>/slideshow/', get_college_slideshow_images, name='college-slideshow'),
    
    # Featured and Gallery Listings
    path('colleges/featured/', get_featured_colleges, name='featured-colleges'),
    path('colleges/with-gallery/', get_colleges_with_gallery, name='colleges-with-gallery'),
    
    # Image Management (Admin only)
    path('colleges/<int:college_id>/images/', add_college_images, name='add-college-images'),
    path('colleges/<int:college_id>/banner/', update_college_banner_image, name='update-banner-image'),
    path('colleges/<int:college_id>/images/<str:category>/<int:image_index>/', delete_college_image, name='delete-college-image'),
    path('colleges/bulk-upload-images/', bulk_upload_college_images, name='bulk-upload-images'),
    
    # ==================== COLLEGE COURSE CATEGORIES ====================
    path('colleges/categories/', get_college_course_categories, name='get_college_course_categories'),
    path('colleges/by-category/', get_colleges_by_course_category, name='get_colleges_by_course_category'),
    path('colleges/categories/stats/', get_course_category_stats, name='get_course_category_stats'),
    path('colleges/bulk-update-categories/', bulk_update_college_categories, name='bulk_update_college_categories'),
    
    # ==================== COURSES ====================
    path('courses/', get_courses, name='get_courses'),
    path('courses/<int:course_id>/', get_course_detail, name='get_course_detail'),
    
    # ==================== COURSE CATEGORIES ====================
    path('courses/categories/', get_courses_by_category, name='get_courses_by_category'),
    path('courses/categories/<str:category>/', get_courses_by_category, name='get_courses_by_category_filtered'),

    # ==================== AUTHENTICATION ====================
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('check-auth/', views.CheckAuthView.as_view(), name='check-auth'),

    # ==================== USER PROFILES ====================
    path('user-profiles/', views.user_profiles, name='user_profiles'),
    path('user-profiles/<int:profile_id>/', views.user_profile_detail, name='user_profile_detail'),
    
    # Profile Management
    path('profile/me/', views.get_current_user_profile, name='current_user_profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/create-update/', views.create_or_update_profile, name='create_or_update_profile'),
    path('profile/update/<int:profile_id>/', views.update_profile_by_id, name='update_profile_by_id'),

    # ==================== PASSWORD RESET ====================
    path('password-reset/', views.password_reset_request, name='password_reset_request'),
    path('password-reset-confirm/', views.password_reset_confirm, name='password_reset_confirm'),

    # ==================== ENQUIRY FORM ====================
    path('application-form-data/', get_application_form_data, name='get_application_form_data'),
    path('submit-application/', submit_application, name='submit_application'),
    
    # ==================== MY APPLICATIONS ====================
    path('my-applications/', get_my_applications, name='get_my_applications'),
    path('my-applications/<str:application_id>/', get_application_detail, name='get_application_detail'),
    
    # ==================== PDF DOWNLOAD ====================
    path('download-application-pdf/<str:application_id>/', download_application_pdf, name='download_application_pdf'),
]

# Add media URL configuration for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)