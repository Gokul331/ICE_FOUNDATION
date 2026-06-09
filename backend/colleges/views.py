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

# ==================== BASIC COLLEGE VIEWS ====================

@api_view(['GET'])
def get_colleges(request):
    """Get all colleges with optional filtering"""
    try:
        colleges = College.objects.all()

        district = request.GET.get('district')
        if district:
            colleges = colleges.filter(location_city__icontains=district)

        state = request.GET.get('state')
        if state:
            colleges = colleges.filter(location_state__icontains=state)

        categories = request.GET.getlist('categories')
        if categories:
            category_query = Q()
            for category in categories:
                category_query |= Q(courses_offered__contains=category)
            colleges = colleges.filter(category_query)
        
        require_all_categories = request.GET.get('require_all', 'false').lower() == 'true'
        if require_all_categories and categories:
            for category in categories:
                colleges = colleges.filter(courses_offered__contains=category)

        serializer = CollegeListSerializer(colleges, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_college_detail(request, college_id):
    """Get a single college by ID"""
    try:
        college = College.objects.get(college_id=college_id)
        serializer = CollegeSerializer(college)
        return Response(serializer.data)
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_college_courses(request, college_id):
    """Get all courses for a specific college"""
    try:
        courses = Course.objects.filter(college_id=college_id, is_active=True)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_courses(request):
    """Get all courses with optional filtering"""
    try:
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
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_course_detail(request, course_id):
    """Get a single course by ID"""
    try:
        course = Course.objects.get(course_id=course_id)
        serializer = CourseSerializer(course)
        return Response(serializer.data)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def suggest_colleges(request):
    """Suggest colleges based on user preferences"""
    try:
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
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_application_form_data(request):
    """Get application form data - NO AUTH REQUIRED"""
    try:
        user = request.user if request.user.is_authenticated else None
        
        if user:
            try:
                profile = UserProfile.objects.get(user=user)
                data = {
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'date_of_birth': profile.date_of_birth.isoformat() if profile.date_of_birth else None,
                    'gender': profile.gender or '',
                    'mobile_number': profile.phone_number or '',
                    'email_id': profile.email or user.email,
                    'address_line1': profile.address or '',
                    'city': profile.city or '',
                    'pincode': profile.pincode or '',
                }
            except UserProfile.DoesNotExist:
                data = {
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                }
        else:
            data = {}
        
        return Response(data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def submit_application(request):
    """Submit student enquiry form - NO AUTHENTICATION REQUIRED"""
    try:
        user = request.user if request.user.is_authenticated else None

        if user:
            application_id = f'APP-{user.id}-{datetime.now().strftime("%Y%m%d%H%M%S")}'
        else:
            email_or_mobile = request.data.get('email_id') or request.data.get('mobile_number', 'anonymous')
            application_id = f'APP-{email_or_mobile}-{datetime.now().strftime("%Y%m%d%H%M%S")}'

        college_id = request.data.get('college_id') or request.data.get('college')
        college = None
        if college_id:
            try:
                college = College.objects.get(college_id=college_id)
            except College.DoesNotExist:
                pass

        application = EnquiryForm.objects.create(
            application_id=application_id,
            user=user if user else None,
            college=college,
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
            mobile_number=request.data.get('mobile_number', ''),
            email_id=request.data.get('email_id') or request.data.get('email', ''),
            course_name=request.data.get('course_name') or request.data.get('course', ''),
            department_name=request.data.get('department_name') or request.data.get('department', ''),
            gender=request.data.get('gender', ''),
            date_of_birth=request.data.get('date_of_birth') or None,
            blood_group=request.data.get('blood_group', ''),
            community=request.data.get('community', ''),
            aadhar_number=request.data.get('aadhar_number', ''),
            father_name=request.data.get('father_name', ''),
            father_mobile=request.data.get('father_mobile', ''),
            mother_name=request.data.get('mother_name', ''),
            mother_mobile=request.data.get('mother_mobile', ''),
            address_line1=request.data.get('address_line1', ''),
            address_line2=request.data.get('address_line2', ''),
            city=request.data.get('city', ''),
            pincode=request.data.get('pincode', ''),
            tenth_marks_percentage=request.data.get('tenth_marks_percentage') or None,
            twelfth_marks_percentage=request.data.get('twelfth_marks_percentage') or None,
            reference_name=request.data.get('reference_name', ''),
        )

        return Response({
            'success': True,
            'message': 'Application submitted successfully',
            'application_id': application.application_id,
        }, status=201)

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
        }, status=500)


@api_view(['GET'])
def get_my_applications(request):
    """Get all enquiry forms for the current user"""
    try:
        user = request.user if request.user.is_authenticated else None
        
        if not user:
            return Response({'applications': []}, status=200)
        
        applications = EnquiryForm.objects.filter(user=user).order_by('-submitted_at')
        serializer = EnquiryFormListSerializer(applications, many=True)
        return Response(serializer.data, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_application_detail(request, application_id):
    """Get a specific enquiry form by ID"""
    try:
        user = request.user if request.user.is_authenticated else None
        
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        
        application = EnquiryForm.objects.get(application_id=application_id, user=user)
        serializer = EnquiryFormSerializer(application)
        return Response(serializer.data, status=200)
        
    except EnquiryForm.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def download_application_pdf(request, application_id):
    """Download PDF for a specific enquiry form"""
    try:
        user = request.user if request.user.is_authenticated else None
        
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        
        application = EnquiryForm.objects.get(application_id=application_id, user=user)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="application_{application_id}.pdf"'
        response.write(f"Application PDF for {application.application_id}")
        return response
        
    except EnquiryForm.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


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
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def submit_application_v2(request):
    """Enhanced version of submit_application - NO AUTH REQUIRED"""
    return submit_application(request)


# ==================== HIERARCHICAL SELECTION VIEWS ====================

@api_view(['GET'])
def get_college_categories(request, college_id):
    """Get categories offered by a specific college"""
    try:
        college = College.objects.get(college_id=college_id)
        categories_offered = college.courses_offered or []
        
        categories_data = []
        for category_code in categories_offered:
            category_name = dict(College.COURSE_CATEGORY_CHOICES).get(category_code, category_code)
            course_count = Course.objects.filter(
                college_id=college_id,
                category=category_code,
                is_active=True
            ).count()
            
            categories_data.append({
                'code': category_code,
                'name': category_name,
                'course_count': course_count,
                'has_courses': course_count > 0
            })
        
        return Response({
            'success': True,
            'college_id': college.college_id,
            'college_name': college.college_name,
            'total_categories': len(categories_data),
            'categories': categories_data
        }, status=200)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_category_degree_types(request, college_id, category):
    """Get degree types for a specific college and category"""
    try:
        degree_types = Course.objects.filter(
            college_id=college_id,
            category=category,
            is_active=True
        ).values_list('degree_type', flat=True).distinct()
        
        degree_data = []
        for degree_code in degree_types:
            degree_name = dict(Course.DEGREE_TYPE_CHOICES).get(degree_code, degree_code.upper())
            course_count = Course.objects.filter(
                college_id=college_id,
                category=category,
                degree_type=degree_code,
                is_active=True
            ).count()
            
            degree_data.append({
                'code': degree_code,
                'name': degree_name,
                'course_count': course_count,
                'has_courses': course_count > 0
            })
        
        return Response({
            'success': True,
            'degree_types': degree_data
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_degree_courses(request, college_id, category, degree_type):
    """Get courses for specific college, category, and degree type"""
    try:
        courses = Course.objects.filter(
            college_id=college_id,
            category=category,
            degree_type=degree_type,
            is_active=True
        ).select_related('college')
        
        courses_data = []
        for course in courses:
            courses_data.append({
                'id': course.course_id,
                'course_code': course.course_code,
                'course_code_display': course.get_course_code_display(),
                'course_name': course.course_name,
                'full_name': f"{course.get_course_code_display()} - {course.course_name}",
                'degree_type': course.degree_type,
                'degree_type_display': course.get_degree_type_display(),
                'category': course.category,
                'category_display': course.category_display,
                'college_id': course.college.college_id,
                'college_name': course.college.college_name,
                'is_active': course.is_active
            })
        
        return Response({
            'success': True,
            'total_courses': len(courses_data),
            'courses': courses_data
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_course_details_for_selection(request, course_id):
    """Get detailed course information for final selection"""
    try:
        course = Course.objects.select_related('college').get(course_id=course_id, is_active=True)
        
        return Response({
            'success': True,
            'course': {
                'id': course.course_id,
                'course_code': course.course_code,
                'course_code_display': course.get_course_code_display(),
                'course_name': course.course_name,
                'full_name': f"{course.get_course_code_display()} - {course.course_name}",
                'degree_type': course.degree_type,
                'degree_type_display': course.get_degree_type_display(),
                'category': course.category,
                'category_display': course.category_display,
                'college_id': course.college.college_id,
                'college_name': course.college.college_name,
                'college_city': course.college.location_city,
                'college_state': course.college.location_state,
                'is_active': course.is_active
            }
        }, status=200)
        
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_all_colleges_with_categories(request):
    """Get all colleges with their offered categories"""
    try:
        colleges = College.objects.all().order_by('college_name')
        
        colleges_data = []
        for college in colleges:
            categories_offered = college.courses_offered or []
            
            colleges_data.append({
                'id': college.college_id,
                'name': college.college_name,
                'short_name': college.short_name,
                'city': college.location_city,
                'state': college.location_state,
                'category_count': len(categories_offered),
                'course_count': college.courses.filter(is_active=True).count(),
                'has_categories': len(categories_offered) > 0,
                'primary_image': college.primary_image
            })
        
        return Response({
            'success': True,
            'total_colleges': len(colleges_data),
            'colleges': colleges_data
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_college_hierarchy(request, college_id):
    """Get complete hierarchy for a college"""
    try:
        college = College.objects.get(college_id=college_id)
        categories_offered = college.courses_offered or []
        
        hierarchy_data = {
            'college_id': college.college_id,
            'college_name': college.college_name,
            'categories': []
        }
        
        for category_code in categories_offered:
            category_name = dict(College.COURSE_CATEGORY_CHOICES).get(category_code, category_code)
            
            degree_types = Course.objects.filter(
                college_id=college_id,
                category=category_code,
                is_active=True
            ).values_list('degree_type', flat=True).distinct()
            
            category_data = {
                'code': category_code,
                'name': category_name,
                'degree_types': []
            }
            
            for degree_code in degree_types:
                degree_name = dict(Course.DEGREE_TYPE_CHOICES).get(degree_code, degree_code.upper())
                
                courses = Course.objects.filter(
                    college_id=college_id,
                    category=category_code,
                    degree_type=degree_code,
                    is_active=True
                ).values('course_id', 'course_code', 'course_name')
                
                courses_list = []
                for course in courses:
                    courses_list.append({
                        'id': course['course_id'],
                        'course_code': course['course_code'],
                        'course_name': course['course_name'],
                        'full_name': f"{course['course_code']} - {course['course_name']}"
                    })
                
                category_data['degree_types'].append({
                    'code': degree_code,
                    'name': degree_name,
                    'courses': courses_list,
                    'course_count': len(courses_list)
                })
            
            hierarchy_data['categories'].append(category_data)
        
        return Response({
            'success': True,
            'hierarchy': hierarchy_data
        }, status=200)
        
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


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
            return Response({'error': 'Authentication required'}, status=401)
        
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
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def change_password(request):
    """Change user's password"""
    try:
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
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
        
        return Response(gallery_data, status=200)
        
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