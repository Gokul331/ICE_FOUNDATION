import os
import json
import re
import logging
from datetime import datetime
from django.http import HttpResponse
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.db.models import Q, Count, Prefetch
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from .models import College, Course, UserProfile, EnquiryForm
from .serializers import (
    CollegeSerializer, CollegeListSerializer, CourseSerializer,
    UserProfileSerializer, EnquiryFormSerializer, EnquiryFormListSerializer,
    CollegeCourseFilterSerializer, 
    CollegeBulkCourseUpdateSerializer,
    CollegeWithCoursesSerializer,
    CollegeImageUpdateSerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser

logger = logging.getLogger(__name__)

# ==================== USER PROFILE VIEWS ====================

@api_view(['GET', 'POST'])
def user_profiles(request):
    """GET: List all user profiles, POST: Create a user profile"""
    if request.method == 'GET':
        profiles = UserProfile.objects.all()
        serializer = UserProfileSerializer(profiles, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = UserProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def user_profile_detail(request, profile_id):
    """Get, update, or delete a user profile"""
    try:
        profile = UserProfile.objects.get(id=profile_id)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)

    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    elif request.method in ['PUT', 'PATCH']:
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        profile.delete()
        return Response(status=204)


@api_view(['GET', 'PUT', 'PATCH'])
def get_current_user_profile(request):
    """Get or update the current authenticated user's profile"""
    try:
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        profile, created = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'first_name': request.user.first_name or '',
                'email': request.user.email,
                'phone_number': '0000000000',
                'address': '',
                'city': '',
                'pincode': '000000'
            }
        )

        if request.method == 'GET':
            user_data = {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            }
            profile_serializer = UserProfileSerializer(profile)
            return Response({**user_data, **profile_serializer.data})

        elif request.method in ['PUT', 'PATCH']:
            if 'email' in request.data:
                request.user.email = request.data['email']
                request.user.save()

            profile_fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number', 
                            'whatsapp_number', 'address', 'city', 'pincode']

            for field in profile_fields:
                if field in request.data:
                    setattr(profile, field, request.data[field])

            if 'first_name' in request.data:
                request.user.first_name = request.data['first_name']
                request.user.save()
            if 'last_name' in request.data:
                request.user.last_name = request.data['last_name']
                request.user.save()

            profile.save()

            user_data = {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            }
            profile_serializer = UserProfileSerializer(profile)

            return Response({
                'message': 'Profile updated successfully',
                'user': {**user_data, **profile_serializer.data}
            })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def change_password(request):
    """Change user's password"""
    try:
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not current_password or not new_password:
            return Response({'error': 'Current password and new password are required'}, status=400)

        if new_password != confirm_password:
            return Response({'error': 'New passwords do not match'}, status=400)

        if not request.user.check_password(current_password):
            return Response({'error': 'Current password is incorrect'}, status=400)

        request.user.set_password(new_password)
        request.user.save()

        return Response({'message': 'Password changed successfully'}, status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['PUT', 'PATCH'])
def update_profile(request):
    """Update the current user's profile"""
    try:
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        profile = UserProfile.objects.get(user=request.user)

        if 'email' in request.data:
            request.user.email = request.data['email']
        if 'first_name' in request.data:
            request.user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            request.user.last_name = request.data['last_name']
        request.user.save()

        profile_fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number', 
                          'whatsapp_number', 'address', 'city', 'pincode']

        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])

        profile.save()

        return Response({'message': 'Profile updated successfully'}, status=200)

    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['PUT', 'PATCH'])
def update_profile_by_id(request, profile_id):
    """Update a user profile by ID"""
    try:
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        profile = UserProfile.objects.get(id=profile_id)

        if profile.user != request.user and not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=403)

        profile_fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number', 
                          'whatsapp_number', 'address', 'city', 'pincode']

        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])

        profile.save()

        return Response({'message': 'Profile updated successfully'}, status=200)

    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def create_or_update_profile(request):
    """Create or update the current user's profile"""
    try:
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        profile, created = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'first_name': request.user.first_name or '',
                'email': request.user.email,
                'phone_number': request.data.get('phone_number', '0000000000'),
                'address': request.data.get('address', ''),
                'city': request.data.get('city', ''),
                'pincode': request.data.get('pincode', '000000')
            }
        )

        if 'email' in request.data:
            request.user.email = request.data['email']
        if 'first_name' in request.data:
            request.user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            request.user.last_name = request.data['last_name']
        request.user.save()

        profile_fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number', 
                          'whatsapp_number', 'address', 'city', 'pincode']

        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])

        profile.save()

        return Response({'message': 'Profile created/updated successfully'}, status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ==================== MY APPLICATIONS VIEWS ====================

@api_view(['GET'])
def get_my_applications(request):
    """Get all enquiry forms for the current user"""
    try:
        user = request.user if request.user.is_authenticated else None
        
        if not user:
            return Response({'applications': []}, status=status.HTTP_200_OK)
        
        applications = EnquiryForm.objects.filter(user=user).order_by('-submitted_at')
        serializer = EnquiryFormListSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_application_detail(request, application_id):
    """Get a specific enquiry form by ID"""
    try:
        user = request.user if request.user.is_authenticated else None
        
        if user:
            application = EnquiryForm.objects.get(application_id=application_id, user=user)
        else:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = EnquiryFormSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except EnquiryForm.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def download_application_pdf(request, application_id):
    """Download PDF for a specific enquiry form"""
    try:
        user = request.user if request.user.is_authenticated else None
        
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        application = EnquiryForm.objects.get(application_id=application_id, user=user)
        
        # Simple PDF response (you can implement actual PDF generation later)
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="application_{application_id}.pdf"'
        response.write(f"Application PDF for {application.application_id}")
        return response
        
    except EnquiryForm.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ==================== COLLEGE IMAGE VIEWS ====================

@api_view(['GET'])
def get_college_gallery(request, college_id):
    """Get all images for a specific college"""
    try:
        college = College.objects.get(college_id=college_id)
        
        gallery_data = {
            'college_id': college.college_id,
            'college_name': college.college_name,
            'banner_image': college.banner_image,
            'college_images': college.college_images or [],
            'campus_images': college.campus_images or [],
            'all_images': college.all_images,
            'primary_image': college.primary_image,
            'has_gallery': college.has_gallery
        }
        
        return Response(gallery_data, status=status.HTTP_200_OK)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_college_images_by_category(request, college_id, category):
    """Get images by specific category for a college"""
    try:
        college = College.objects.get(college_id=college_id)
        
        category_map = {
            'general': college.college_images,
            'campus': college.campus_images,
        }
        
        if category not in category_map:
            return Response({'error': f'Invalid category'}, status=400)
        
        return Response({
            'college_id': college.college_id,
            'college_name': college.college_name,
            'category': category,
            'images': category_map.get(category, [])
        }, status=200)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_college_slideshow_images(request, college_id):
    """Get images suitable for slideshow/carousel display"""
    try:
        college = College.objects.get(college_id=college_id)
        
        slideshow_images = []
        
        if college.banner_image:
            slideshow_images.append({
                'url': college.banner_image,
                'type': 'banner',
                'title': f'{college.college_name} - Banner'
            })
        
        for idx, img in enumerate(college.college_images or []):
            slideshow_images.append({
                'url': img,
                'type': 'general',
                'title': f'{college.college_name} - View {idx + 1}'
            })
        
        for idx, img in enumerate(college.campus_images or []):
            slideshow_images.append({
                'url': img,
                'type': 'campus',
                'title': f'{college.college_name} - Campus {idx + 1}'
            })
        
        return Response({
            'college_id': college.college_id,
            'college_name': college.college_name,
            'slideshow_images': slideshow_images,
            'total_images': len(slideshow_images)
        }, status=200)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_colleges_with_gallery(request):
    """Get all colleges that have gallery images"""
    try:
        limit = int(request.GET.get('limit', 20))
        offset = int(request.GET.get('offset', 0))
        
        colleges = College.objects.filter(
            Q(college_images__isnull=False) | 
            Q(campus_images__isnull=False) |
            Q(banner_image__isnull=False)
        )
        
        total_count = colleges.count()
        colleges = colleges[offset:offset + limit]
        
        serializer = CollegeListSerializer(colleges, many=True)
        
        return Response({
            'total': total_count,
            'limit': limit,
            'offset': offset,
            'colleges': serializer.data
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_college_images(request, college_id):
    """Add images to a specific college category (Admin only)"""
    try:
        college = College.objects.get(college_id=college_id)
        
        category = request.data.get('category', 'general')
        image_url = request.data.get('image_url')
        
        if not image_url:
            return Response({'error': 'image_url is required'}, status=400)
        
        if category == 'general':
            if not college.college_images:
                college.college_images = []
            if image_url not in college.college_images:
                college.college_images.append(image_url)
        elif category == 'campus':
            if not college.campus_images:
                college.campus_images = []
            if image_url not in college.campus_images:
                college.campus_images.append(image_url)
        else:
            return Response({'error': 'Invalid category'}, status=400)
        
        college.save()
        
        return Response({'success': True, 'message': 'Image added successfully'}, status=200)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_college_banner_image(request, college_id):
    """Update college banner image (Admin only)"""
    try:
        college = College.objects.get(college_id=college_id)
        banner_image_url = request.data.get('banner_image')
        
        if not banner_image_url:
            return Response({'error': 'banner_image URL is required'}, status=400)
        
        college.banner_image = banner_image_url
        college.save()
        
        return Response({'success': True, 'message': 'Banner image updated successfully'}, status=200)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_college_image(request, college_id, category, image_index):
    """Delete a specific image from college gallery by index (Admin only)"""
    try:
        college = College.objects.get(college_id=college_id)
        
        if category == 'general':
            if college.college_images and 0 <= image_index < len(college.college_images):
                college.college_images.pop(image_index)
            else:
                return Response({'error': 'Image index out of range'}, status=400)
        elif category == 'campus':
            if college.campus_images and 0 <= image_index < len(college.campus_images):
                college.campus_images.pop(image_index)
            else:
                return Response({'error': 'Image index out of range'}, status=400)
        else:
            return Response({'error': 'Invalid category'}, status=400)
        
        college.save()
        
        return Response({'success': True, 'message': 'Image deleted successfully'}, status=200)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_upload_college_images(request):
    """Bulk upload images for multiple colleges (Admin only)"""
    try:
        data = request.data
        college_ids = data.get('college_ids', [])
        image_urls = data.get('image_urls', [])
        category = data.get('category', 'general')
        
        if not college_ids or not image_urls:
            return Response({'error': 'college_ids and image_urls are required'}, status=400)
        
        updated_colleges = []
        
        for college_id in college_ids:
            try:
                college = College.objects.get(college_id=college_id)
                
                if category == 'general':
                    if not college.college_images:
                        college.college_images = []
                    for img_url in image_urls:
                        if img_url not in college.college_images:
                            college.college_images.append(img_url)
                elif category == 'campus':
                    if not college.campus_images:
                        college.campus_images = []
                    for img_url in image_urls:
                        if img_url not in college.campus_images:
                            college.campus_images.append(img_url)
                
                college.save()
                updated_colleges.append(college_id)
                
            except College.DoesNotExist:
                continue
        
        return Response({
            'success': True,
            'message': f'Updated {len(updated_colleges)} colleges',
            'updated_colleges': updated_colleges
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ==================== COURSE CATEGORY VIEWS ====================

@api_view(['GET'])
def get_college_course_categories(request):
    """Get all available course categories with statistics"""
    try:
        categories = []
        for category_code, category_name in College.COURSE_CATEGORY_CHOICES:
            college_count = College.objects.filter(
                courses_offered__contains=category_code
            ).count()
            
            course_count = Course.objects.filter(
                category=category_code, 
                is_active=True
            ).count()
            
            categories.append({
                'code': category_code,
                'name': category_name,
                'college_count': college_count,
                'course_count': course_count,
            })
        
        return Response({
            'total_categories': len(categories),
            'categories': categories,
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_colleges_by_course_category(request):
    """Get colleges filtered by course categories"""
    try:
        categories = request.GET.getlist('categories')
        queryset = College.objects.all()
        
        if categories:
            category_query = Q()
            for category in categories:
                category_query |= Q(courses_offered__contains=category)
            queryset = queryset.filter(category_query)
        
        city = request.GET.get('city')
        if city:
            queryset = queryset.filter(location_city__icontains=city)
        
        state = request.GET.get('state')
        if state:
            queryset = queryset.filter(location_state__icontains=state)
        
        serializer = CollegeListSerializer(queryset, many=True)
        
        return Response({
            'total': queryset.count(),
            'colleges': serializer.data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_courses_by_category(request, category=None):
    """Get courses filtered by category"""
    try:
        queryset = Course.objects.filter(is_active=True)
        
        if category:
            queryset = queryset.filter(category=category)
        
        college_id = request.GET.get('college_id')
        if college_id:
            queryset = queryset.filter(college_id=college_id)
        
        degree_type = request.GET.get('degree_type')
        if degree_type:
            queryset = queryset.filter(degree_type=degree_type)
        
        serializer = CourseSerializer(queryset, many=True)
        
        return Response({
            'total': queryset.count(),
            'courses': serializer.data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_course_category_stats(request):
    """Get detailed statistics for course categories"""
    try:
        total_colleges = College.objects.count()
        total_courses = Course.objects.filter(is_active=True).count()
        
        category_stats = []
        for category_code, category_name in College.COURSE_CATEGORY_CHOICES:
            colleges_with_category = College.objects.filter(
                courses_offered__contains=category_code
            ).count()
            
            courses_in_category = Course.objects.filter(
                category=category_code,
                is_active=True
            ).count()
            
            category_stats.append({
                'code': category_code,
                'name': category_name,
                'colleges_count': colleges_with_category,
                'courses_count': courses_in_category,
            })
        
        return Response({
            'total_colleges': total_colleges,
            'total_courses': total_courses,
            'category_breakdown': category_stats,
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_update_college_categories(request):
    """Bulk update course categories for multiple colleges (Admin only)"""
    try:
        college_ids = request.data.get('college_ids', [])
        add_categories = request.data.get('add_categories', [])
        remove_categories = request.data.get('remove_categories', [])
        
        updated_colleges = []
        
        for college_id in college_ids:
            try:
                college = College.objects.get(college_id=college_id)
                current = set(college.courses_offered or [])
                current.update(add_categories)
                current.difference_update(remove_categories)
                college.courses_offered = list(current)
                college.save()
                updated_colleges.append(college_id)
            except College.DoesNotExist:
                continue
        
        return Response({
            'success': True,
            'message': f'Updated {len(updated_colleges)} colleges',
            'updated_colleges': updated_colleges
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)