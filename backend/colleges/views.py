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
from django.db.models import Q, Count
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail, EmailMultiAlternatives
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from .models import College, Course, UserProfile, EnquiryForm
from .serializers import (
    CollegeSerializer, CollegeListSerializer, CourseSerializer,
    UserProfileSerializer, RegisterSerializer, LoginSerializer,
    EnquiryFormSerializer, EnquiryFormListSerializer,
    CollegeCourseFilterSerializer, 
    CollegeBulkCourseUpdateSerializer,
    CollegeWithCoursesSerializer,
    CollegeImageUpdateSerializer
)
from .utils.pdf_generator import generate_application_pdf
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser

# Set up logger
logger = logging.getLogger(__name__)

# ==================== COLLEGE VIEWS ====================

@api_view(['GET'])
def get_colleges(request):
    """Get all colleges with optional filtering including course categories"""
    colleges = College.objects.all()

    # Existing filters
    district = request.GET.get('district')
    if district:
        colleges = colleges.filter(location_city__icontains=district)

    state = request.GET.get('state')
    if state:
        colleges = colleges.filter(location_state__icontains=state)

    # NEW: Filter by course categories
    categories = request.GET.getlist('categories')
    if categories:
        category_query = Q()
        for category in categories:
            category_query |= Q(courses_offered__contains=category)
        colleges = colleges.filter(category_query)
    
    # NEW: Filter by multiple categories (AND condition)
    require_all_categories = request.GET.get('require_all', 'false').lower() == 'true'
    if require_all_categories and categories:
        for category in categories:
            colleges = colleges.filter(courses_offered__contains=category)

    serializer = CollegeListSerializer(colleges, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_college_detail(request, college_id):
    """Get a single college by ID"""
    try:
        college = College.objects.get(college_id=college_id)
        serializer = CollegeSerializer(college)
        return Response(serializer.data)
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)


@api_view(['GET'])
def get_college_courses(request, college_id):
    """Get all courses for a specific college"""
    try:
        college = College.objects.filter(college_id=college_id).first()
        if not college:
            return Response({'error': 'College not found'}, status=404)

        courses = Course.objects.filter(college_id=college_id, is_active=True)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=200)

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
        return Response({'error': 'College not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_college_gallery: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            return Response({'error': f'Invalid category. Valid options: {list(category_map.keys())}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'college_id': college.college_id,
            'college_name': college.college_name,
            'category': category,
            'images': category_map.get(category, [])
        }, status=status.HTTP_200_OK)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_college_images_by_category: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_college_images(request, college_id):
    """Add images to a specific college category (Admin only)"""
    try:
        college = College.objects.get(college_id=college_id)
        
        serializer = CollegeImageUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        action = data['action']
        category = data['category']
        images = data.get('images', [])
        image_url = data.get('image_url')
        
        # Get the appropriate image list
        category_map = {
            'general': 'college_images',
            'campus': 'campus_images',
        }
        
        if category not in category_map:
            return Response({'error': f'Invalid category'}, status=status.HTTP_400_BAD_REQUEST)
        
        field_name = category_map[category]
        current_images = getattr(college, field_name) or []
        
        if action == 'add':
            new_images = images or ([image_url] if image_url else [])
            if not new_images:
                return Response({'error': 'No images provided to add'}, status=status.HTTP_400_BAD_REQUEST)
            
            for img in new_images:
                if img not in current_images:
                    current_images.append(img)
            
            setattr(college, field_name, current_images)
            college.save()
            
            return Response({
                'success': True,
                'message': f'Added {len(new_images)} image(s) to {category}',
                'category': category,
                'images': current_images,
                'total_images': len(current_images)
            }, status=status.HTTP_200_OK)
            
        elif action == 'remove':
            images_to_remove = images or ([image_url] if image_url else [])
            if not images_to_remove:
                return Response({'error': 'No images provided to remove'}, status=status.HTTP_400_BAD_REQUEST)
            
            removed_count = 0
            for img in images_to_remove:
                if img in current_images:
                    current_images.remove(img)
                    removed_count += 1
            
            setattr(college, field_name, current_images)
            college.save()
            
            return Response({
                'success': True,
                'message': f'Removed {removed_count} image(s) from {category}',
                'category': category,
                'images': current_images,
                'total_images': len(current_images)
            }, status=status.HTTP_200_OK)
            
        elif action == 'set':
            if not images:
                return Response({'error': 'No images provided to set'}, status=status.HTTP_400_BAD_REQUEST)
            
            setattr(college, field_name, images)
            college.save()
            
            return Response({
                'success': True,
                'message': f'Replaced images in {category} with {len(images)} image(s)',
                'category': category,
                'images': images,
                'total_images': len(images)
            }, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in add_college_images: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_college_banner_image(request, college_id):
    """Update college banner image (Admin only)"""
    try:
        college = College.objects.get(college_id=college_id)
        banner_image_url = request.data.get('banner_image')
        
        if not banner_image_url:
            return Response({'error': 'banner_image URL is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        college.banner_image = banner_image_url
        college.save()
        
        return Response({
            'success': True,
            'message': 'Banner image updated successfully',
            'college_id': college.college_id,
            'banner_image': college.banner_image
        }, status=status.HTTP_200_OK)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in update_college_banner_image: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_college_image(request, college_id, category, image_index):
    """Delete a specific image from college gallery by index (Admin only)"""
    try:
        college = College.objects.get(college_id=college_id)
        
        category_map = {
            'general': 'college_images',
            'campus': 'campus_images',
        }
        
        if category not in category_map:
            return Response({'error': f'Invalid category. Valid options: {list(category_map.keys())}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        field_name = category_map[category]
        current_images = getattr(college, field_name) or []
        
        if image_index < 0 or image_index >= len(current_images):
            return Response({'error': 'Image index out of range'}, status=status.HTTP_400_BAD_REQUEST)
        
        removed_image = current_images.pop(image_index)
        setattr(college, field_name, current_images)
        college.save()
        
        return Response({
            'success': True,
            'message': f'Image deleted from {category}',
            'category': category,
            'removed_image': removed_image,
            'remaining_images': len(current_images)
        }, status=status.HTTP_200_OK)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in delete_college_image: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        
        popular = sorted(categories, key=lambda x: x['college_count'], reverse=True)[:5]
        
        return Response({
            'total_categories': len(categories),
            'categories': categories,
            'popular_categories': popular,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in get_college_course_categories: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_colleges_by_course_category(request):
    """Get colleges filtered by course categories with advanced filtering"""
    try:
        serializer = CollegeCourseFilterSerializer(data=request.query_params)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = College.objects.all()
        data = serializer.validated_data
        
        categories = data.get('categories', [])
        if categories:
            category_query = Q()
            for category in categories:
                category_query |= Q(courses_offered__contains=category)
            queryset = queryset.filter(category_query)
        
        if data.get('city'):
            queryset = queryset.filter(location_city__icontains=data['city'])
        
        if data.get('state'):
            queryset = queryset.filter(location_state__icontains=data['state'])
        
        # Filter colleges with images
        if data.get('has_images'):
            queryset = queryset.filter(
                Q(college_images__isnull=False) | 
                Q(campus_images__isnull=False) |
                Q(banner_image__isnull=False)
            )
        
        order_by = request.query_params.get('order_by', 'college_name')
        queryset = queryset.order_by(order_by)
        
        limit = int(request.query_params.get('limit', 20))
        offset = int(request.query_params.get('offset', 0))
        
        total_count = queryset.count()
        colleges = queryset[offset:offset + limit]
        
        use_detailed = request.query_params.get('detailed', 'false').lower() == 'true'
        if use_detailed:
            serializer_class = CollegeWithCoursesSerializer
        else:
            serializer_class = CollegeListSerializer
        
        serializer = serializer_class(colleges, many=True)
        
        return Response({
            'total': total_count,
            'limit': limit,
            'offset': offset,
            'has_next': offset + limit < total_count,
            'has_previous': offset > 0,
            'filters_applied': {
                'categories': categories,
                'city': data.get('city'),
                'state': data.get('state'),
            },
            'colleges': serializer.data
        })
        
    except Exception as e:
        logger.error(f"Error in get_colleges_by_course_category: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_courses_by_category(request, category=None):
    """Get courses filtered by category"""
    try:
        queryset = Course.objects.filter(is_active=True)
        
        if category:
            queryset = queryset.filter(category=category)
        else:
            category_param = request.query_params.get('category')
            if category_param:
                queryset = queryset.filter(category=category_param)
        
        college_id = request.query_params.get('college_id')
        if college_id:
            queryset = queryset.filter(college_id=college_id)
        
        degree_type = request.query_params.get('degree_type')
        if degree_type:
            queryset = queryset.filter(degree_type=degree_type)
        
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(course_name__icontains=search)
        
        order_by = request.query_params.get('order_by', 'college__college_name')
        queryset = queryset.order_by(order_by)
        
        colleges_count = queryset.values('college').distinct().count()
        
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        
        total_count = queryset.count()
        courses = queryset[offset:offset + limit]
        
        serializer = CourseSerializer(courses, many=True)
        
        category_display = None
        if category:
            category_display = dict(College.COURSE_CATEGORY_CHOICES).get(category)
        
        return Response({
            'total': total_count,
            'limit': limit,
            'offset': offset,
            'colleges_count': colleges_count,
            'category': category,
            'category_display': category_display,
            'courses': serializer.data
        })
        
    except Exception as e:
        logger.error(f"Error in get_courses_by_category: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
                'percentage_of_colleges': round((colleges_with_category / total_colleges * 100), 2) if total_colleges > 0 else 0,
                'percentage_of_courses': round((courses_in_category / total_courses * 100), 2) if total_courses > 0 else 0,
            })
        
        category_stats.sort(key=lambda x: x['colleges_count'], reverse=True)
        
        return Response({
            'summary': {
                'total_colleges': total_colleges,
                'total_courses': total_courses,
                'total_categories': len(College.COURSE_CATEGORY_CHOICES),
            },
            'category_breakdown': category_stats,
        })
        
    except Exception as e:
        logger.error(f"Error in get_course_category_stats: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_update_college_categories(request):
    """Bulk update course categories for multiple colleges (Admin only)"""
    try:
        serializer = CollegeBulkCourseUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        result = serializer.update_colleges()
        
        return Response({
            'success': True,
            'message': f"Successfully updated {result['updated_colleges']} colleges",
            'updated_college_ids': result['college_ids'],
            'timestamp': datetime.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in bulk_update_college_categories: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== COURSE VIEWS ====================

@api_view(['GET'])
def get_courses(request):
    """Get all courses with optional filtering"""
    courses = Course.objects.filter(is_active=True)

    college_id = request.GET.get('college_id')
    if college_id:
        courses = courses.filter(college_id=college_id)

    course_code = request.GET.get('course_code')
    if course_code:
        courses = courses.filter(course_code=course_code)

    course_name = request.GET.get('course_name')
    if course_name:
        courses = courses.filter(course_name__icontains=course_name)

    degree_type = request.GET.get('degree_type')
    if degree_type:
        courses = courses.filter(degree_type=degree_type)

    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_course_detail(request, course_id):
    """Get a single course by ID"""
    try:
        course = Course.objects.get(course_id=course_id)
        serializer = CourseSerializer(course)
        return Response(serializer.data)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)


# ==================== SUGGESTION VIEWS ====================

@api_view(['GET'])
def suggest_colleges(request):
    """Suggest colleges based on user preferences"""
    categories = request.GET.getlist('categories')
    
    if not categories:
        return Response({'error': 'categories parameter is required'}, status=400)
    
    colleges = College.objects.all()
    category_query = Q()
    for category in categories:
        category_query |= Q(courses_offered__contains=category)
    colleges = colleges.filter(category_query)
    
    colleges = colleges[:20]
    serializer = CollegeListSerializer(colleges, many=True)
    return Response(serializer.data)


# ==================== ADDITIONAL COLLEGE IMAGE VIEWS ====================

@api_view(['GET'])
def get_featured_colleges(request):
    """Get featured colleges with images for homepage"""
    try:
        limit = int(request.GET.get('limit', 6))
        
        colleges = College.objects.filter(
            Q(banner_image__isnull=False) | 
            Q(college_images__isnull=False)
        ).order_by('-college_id')[:limit]
        
        serializer = CollegeListSerializer(colleges, many=True)
        
        data = []
        for idx, college in enumerate(colleges):
            college_data = serializer.data[idx]
            college_data['primary_image'] = college.primary_image
            college_data['image_count'] = len(college.all_images)
            data.append(college_data)
        
        return Response({
            'success': True,
            'count': len(data),
            'colleges': data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_featured_colleges: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        }, status=status.HTTP_200_OK)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_college_slideshow_images: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        
        data = []
        for idx, college in enumerate(colleges):
            college_data = serializer.data[idx]
            college_data['primary_image'] = college.primary_image
            college_data['total_images'] = len(college.all_images)
            college_data['image_categories'] = {
                'general': len(college.college_images or []),
                'campus': len(college.campus_images or []),
            }
            data.append(college_data)
        
        return Response({
            'total': total_count,
            'limit': limit,
            'offset': offset,
            'has_next': offset + limit < total_count,
            'colleges': data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_colleges_with_gallery: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_upload_college_images(request):
    """Bulk upload images for multiple colleges (Admin only)"""
    try:
        data = request.data
        college_ids = data.get('college_ids', [])
        image_urls = data.get('image_urls', [])
        category = data.get('category', 'general')
        
        if not college_ids:
            return Response({'error': 'college_ids is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not image_urls:
            return Response({'error': 'image_urls is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        category_map = {
            'general': 'college_images',
            'campus': 'campus_images',
        }
        
        if category not in category_map:
            return Response({'error': f'Invalid category'}, status=status.HTTP_400_BAD_REQUEST)
        
        field_name = category_map[category]
        updated_colleges = []
        
        for college_id in college_ids:
            try:
                college = College.objects.get(college_id=college_id)
                current_images = getattr(college, field_name) or []
                
                for img_url in image_urls:
                    if img_url not in current_images:
                        current_images.append(img_url)
                
                setattr(college, field_name, current_images)
                college.save()
                updated_colleges.append({
                    'college_id': college.college_id,
                    'college_name': college.college_name,
                    'images_added': len(image_urls),
                    'total_images': len(current_images)
                })
                
            except College.DoesNotExist:
                continue
        
        return Response({
            'success': True,
            'message': f'Updated {len(updated_colleges)} colleges with {len(image_urls)} images each',
            'category': category,
            'updated_colleges': updated_colleges
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in bulk_upload_college_images: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
@permission_classes([IsAuthenticated])
def get_current_user_profile(request):
    """Get or update the current authenticated user's profile"""
    try:
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
                'date_joined': request.user.date_joined,
                'is_staff': request.user.is_staff,
            }
            profile_serializer = UserProfileSerializer(profile)
            combined_data = {**user_data, **profile_serializer.data}
            return Response(combined_data)

        elif request.method in ['PUT', 'PATCH']:
            if 'email' in request.data and request.data['email'] != request.user.email:
                if User.objects.filter(email=request.data['email']).exclude(id=request.user.id).exists():
                    return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
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
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user's password"""
    try:
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not current_password:
            return Response({'error': 'Current password is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not new_password:
            return Response({'error': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({'error': 'New passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        if not request.user.check_password(current_password):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters long'}, status=status.HTTP_400_BAD_REQUEST)

        if current_password == new_password:
            return Response({'error': 'New password must be different from current password'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()
        update_session_auth_hash(request, request.user)

        Token.objects.filter(user=request.user).delete()
        new_token = Token.objects.create(user=request.user)

        return Response({
            'message': 'Password changed successfully',
            'token': new_token.key
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update the current user's profile"""
    try:
        profile = UserProfile.objects.get(user=request.user)

        if 'email' in request.data and request.data['email'] != request.user.email:
            if User.objects.filter(email=request.data['email']).exclude(id=request.user.id).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
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
        }, status=status.HTTP_200_OK)

    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_by_id(request, profile_id):
    """Update a user profile by ID (admin only or own profile)"""
    try:
        profile = UserProfile.objects.get(id=profile_id)

        if profile.user != request.user and not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        if profile.user == request.user:
            if 'email' in request.data and request.data['email'] != profile.user.email:
                if User.objects.filter(email=request.data['email']).exclude(id=profile.user.id).exists():
                    return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
                profile.user.email = request.data['email']

            if 'first_name' in request.data:
                profile.user.first_name = request.data['first_name']
            if 'last_name' in request.data:
                profile.user.last_name = request.data['last_name']

            profile.user.save()

        profile_fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number', 
                          'whatsapp_number', 'address', 'city', 'pincode']

        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])

        profile.save()

        user_data = {
            'id': profile.user.id,
            'username': profile.user.username,
            'email': profile.user.email,
            'first_name': profile.user.first_name,
            'last_name': profile.user.last_name,
        }

        profile_serializer = UserProfileSerializer(profile)

        return Response({
            'message': 'Profile updated successfully',
            'user': {**user_data, **profile_serializer.data}
        }, status=status.HTTP_200_OK)

    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_or_update_profile(request):
    """Create or update the current user's profile"""
    try:
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

        if 'email' in request.data and request.data['email'] != request.user.email:
            if User.objects.filter(email=request.data['email']).exclude(id=request.user.id).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
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

        user_data = {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        }

        profile_serializer = UserProfileSerializer(profile)

        return Response({
            'message': 'Profile created/updated successfully',
            'user': {**user_data, **profile_serializer.data}
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== AUTH VIEWS ====================

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                token, created = Token.objects.get_or_create(user=user)

                response_data = {
                    'message': 'Registration successful',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'token': token.key
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            if re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', username):
                try:
                    user_obj = User.objects.get(email=username)
                    username = user_obj.username
                except User.DoesNotExist:
                    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

            user = authenticate(request, username=username, password=password)

            if user:
                login(request, user)
                token, created = Token.objects.get_or_create(user=user)

                response_data = {
                    'message': 'Login successful',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'token': token.key
                }
                return Response(response_data, status=status.HTTP_200_OK)

            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CheckAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'isAuthenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            }
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
            logout(request)
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)

    def put(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)


# ==================== PASSWORD RESET VIEWS ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Send password reset email"""
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'If an account with this email exists, a password reset link has been sent.'}, status=status.HTTP_200_OK)

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

    try:
        subject = 'Password Reset Request - Vamshi EduCare'
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #4CAF50; color: #fff; padding: 20px; text-align: center; }}
                .button {{ display: inline-block; padding: 10px 20px; background: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Vamshi EduCare</h1>
                </div>
                <div class="content">
                    <h2>Password Reset Request</h2>
                    <p>Hello {user.username},</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <p style="text-align: center;">
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        send_mail(
            subject=subject,
            message=f'Reset your password using this link: {reset_link}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content,
            fail_silently=False
        )
    except Exception as e:
        return Response({'error': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'message': 'Password reset link sent to your email'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Reset password with token"""
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not all([uidb64, token, new_password, confirm_password]):
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Invalid or expired reset token'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(new_password, user)
    except ValidationError as e:
        return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)


# ==================== ENQUIRY FORM VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_application_form_data(request):
    """Fetch existing student data for pre-filling the application form"""
    try:
        user = request.user
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            profile = None

        data = {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
        }

        if profile:
            data.update({
                'date_of_birth': profile.date_of_birth.isoformat() if profile.date_of_birth else None,
                'gender': profile.gender or '',
                'mobile_number': profile.phone_number or '',
                'email_id': profile.email or user.email,
                'address_line1': profile.address or '',
                'city': profile.city or '',
                'pincode': profile.pincode or '',
            })

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_application(request):
    """Submit student enquiry form with file uploads"""
    try:
        user = request.user
        print(f"Processing application for user: {user.id} - {user.username}")

        # Generate unique application ID
        application_id = f'APP-{user.id}-{datetime.now().strftime("%Y%m%d%H%M%S")}'

        # Get college object
        college_id = request.data.get('college_id') or request.data.get('college')
        college = None
        if college_id:
            college = College.objects.filter(college_id=college_id).first()

        course_name = request.data.get('course_name') or request.data.get('course', '')
        department_name = request.data.get('department_name') or request.data.get('department', '')

        # Prepare data for EnquiryForm model
        application_data = {
            'application_id': application_id,
            'user': user.id,
            'college': college.college_id if college else None,
            'course_name': course_name,
            'department_name': department_name,
            'first_name': request.data.get('first_name', ''),
            'last_name': request.data.get('last_name', ''),
            'gender': request.data.get('gender', ''),
            'date_of_birth': request.data.get('date_of_birth') or None,
            'mobile_number': request.data.get('mobile_number', ''),
            'email_id': request.data.get('email_id') or request.data.get('email', ''),
            'blood_group': request.data.get('blood_group', ''),
            'community': request.data.get('community', ''),
            'aadhar_number': request.data.get('aadhar_number', ''),
            'father_name': request.data.get('father_name', ''),
            'father_mobile': request.data.get('father_mobile', ''),
            'mother_name': request.data.get('mother_name', ''),
            'mother_mobile': request.data.get('mother_mobile', ''),
            'address_line1': request.data.get('address_line1', ''),
            'address_line2': request.data.get('address_line2', ''),
            'city': request.data.get('city', ''),
            'pincode': request.data.get('pincode', ''),
            'tenth_marks_percentage': request.data.get('tenth_marks_percentage') or None,
            'twelfth_marks_percentage': request.data.get('twelfth_marks_percentage') or None,
            'has_diploma': request.data.get('has_diploma', False) in [True, 'true', 'True', '1', 1],
            'diploma_marks_percentage': request.data.get('diploma_marks_percentage') or None,
            'has_ug': request.data.get('has_ug', False) in [True, 'true', 'True', '1', 1],
            'ug_marks_percentage': request.data.get('ug_marks_percentage') or None,
        }

        # Validate file sizes
        max_size = 5 * 1024 * 1024
        file_fields = ['photo', 'aadhar_card']

        for field in file_fields:
            if field in request.FILES:
                file = request.FILES[field]
                if file.size > max_size:
                    return Response({'error': f'{field} size must be less than 5MB.'}, status=400)

        # Create application
        serializer = EnquiryFormSerializer(data=application_data)

        if serializer.is_valid():
            application = serializer.save()

            # Save files
            for field in file_fields:
                if field in request.FILES:
                    setattr(application, field, request.FILES[field])

            application.save()

            # Send confirmation email
            try:
                submission_date = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

                email_content = f"""
Dear {application.first_name},

Your enquiry has been submitted successfully.

Application Details:
- Application ID: {application.application_id}
- College: {college.college_name if college else 'N/A'}
- Course: {course_name or 'N/A'}
- Submission Date: {submission_date}

Thank you for choosing Vamshi EduCare.

Best Regards,
Vamshi EduCare Team
"""

                send_mail(
                    subject='Enquiry Submitted Successfully - Vamshi EduCare',
                    message=email_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[application.email_id],
                    fail_silently=False,
                )
                logger.info(f"Email sent to {application.email_id}")

            except Exception as email_error:
                logger.error(f"Email send failed: {email_error}")

            return Response({
                'success': True,
                'message': 'Application submitted successfully',
                'application_id': application.application_id,
            }, status=201)
        else:
            print("Serializer errors:", serializer.errors)
            return Response({
                'success': False,
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=400)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e),
        }, status=500)


# ==================== ENQUIRY RETRIEVAL VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_applications(request):
    """Get all enquiry forms for the current user"""
    try:
        applications = EnquiryForm.objects.filter(user=request.user).order_by('-submitted_at')
        serializer = EnquiryFormListSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_application_detail(request, application_id):
    """Get a specific enquiry form by ID"""
    try:
        application = EnquiryForm.objects.get(application_id=application_id, user=request.user)
        serializer = EnquiryFormSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except EnquiryForm.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_application_pdf(request, application_id):
    """Download PDF for a specific enquiry form"""
    try:
        application = EnquiryForm.objects.get(application_id=application_id, user=request.user)
        
        # Generate PDF
        from .utils.pdf_generator import generate_application_pdf
        pdf_buffer = generate_application_pdf(application)

        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="application_{application_id}.pdf"'
        return response
        
    except EnquiryForm.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)
    except Exception as e:
        print(f"Error in download_application_pdf: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)