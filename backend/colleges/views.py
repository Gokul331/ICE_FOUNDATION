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
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail, EmailMultiAlternatives
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
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
from .utils.pdf_generator import generate_application_pdf
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser

# Set up logger
logger = logging.getLogger(__name__)

# ==================== HIERARCHICAL SELECTION VIEWS ====================

@api_view(['GET'])
def get_college_categories(request, college_id):
    """
    Step 1 & 2: Get categories offered by a specific college
    """
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
        }, status=status.HTTP_200_OK)
        
    except College.DoesNotExist:
        return Response({
            'success': False,
            'error': 'College not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_college_categories: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_category_degree_types(request, college_id, category):
    """
    Step 3: Get degree types available for a specific college and category
    """
    try:
        college = College.objects.get(college_id=college_id)
        
        if category not in (college.courses_offered or []):
            return Response({
                'success': False,
                'error': f'Category "{category}" is not offered by this college'
            }, status=status.HTTP_400_BAD_REQUEST)
        
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
        
        category_display = dict(College.COURSE_CATEGORY_CHOICES).get(category, category)
        
        return Response({
            'success': True,
            'college_id': college.college_id,
            'college_name': college.college_name,
            'category': category,
            'category_display': category_display,
            'total_degree_types': len(degree_data),
            'degree_types': degree_data
        }, status=status.HTTP_200_OK)
        
    except College.DoesNotExist:
        return Response({
            'success': False,
            'error': 'College not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_category_degree_types: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_degree_courses(request, college_id, category, degree_type):
    """
    Step 4: Get courses for a specific college, category, and degree type
    """
    try:
        college = College.objects.get(college_id=college_id)
        
        if category not in (college.courses_offered or []):
            return Response({
                'success': False,
                'error': f'Category "{category}" is not offered by this college'
            }, status=status.HTTP_400_BAD_REQUEST)
        
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
        
        degree_display = dict(Course.DEGREE_TYPE_CHOICES).get(degree_type, degree_type.upper())
        category_display = dict(College.COURSE_CATEGORY_CHOICES).get(category, category)
        
        return Response({
            'success': True,
            'college_id': college.college_id,
            'college_name': college.college_name,
            'category': category,
            'category_display': category_display,
            'degree_type': degree_type,
            'degree_type_display': degree_display,
            'total_courses': len(courses_data),
            'courses': courses_data
        }, status=status.HTTP_200_OK)
        
    except College.DoesNotExist:
        return Response({
            'success': False,
            'error': 'College not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_degree_courses: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_course_details_for_selection(request, course_id):
    """
    Get detailed course information for the final selection
    """
    try:
        course = Course.objects.select_related('college').get(
            course_id=course_id, 
            is_active=True
        )
        
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
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Course not found or inactive'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_course_details_for_selection: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_all_colleges_with_categories(request):
    """
    Get all colleges with their offered categories for dropdown menus
    """
    try:
        colleges = College.objects.all().order_by('college_name')
        
        colleges_data = []
        for college in colleges:
            categories_offered = college.courses_offered or []
            category_count = len(categories_offered)
            course_count = college.courses.filter(is_active=True).count()
            
            category_names = [
                dict(College.COURSE_CATEGORY_CHOICES).get(cat, cat)
                for cat in categories_offered[:3]
            ]
            
            colleges_data.append({
                'id': college.college_id,
                'name': college.college_name,
                'short_name': college.short_name,
                'city': college.location_city,
                'state': college.location_state,
                'category_count': category_count,
                'course_count': course_count,
                'category_preview': category_names,
                'has_categories': category_count > 0,
                'has_courses': course_count > 0,
                'primary_image': college.primary_image
            })
        
        return Response({
            'success': True,
            'total_colleges': len(colleges_data),
            'colleges': colleges_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_all_colleges_with_categories: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_application_form_data(request):
    """Fetch existing student data for pre-filling the application form - NO AUTH REQUIRED"""
    try:
        # Remove authentication check
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
            # Return empty data for anonymous users
            data = {}
        
        return Response(data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
def get_college_hierarchy(request, college_id):
    """
    Get complete hierarchy for a college
    """
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
        }, status=status.HTTP_200_OK)
        
    except College.DoesNotExist:
        return Response({
            'success': False,
            'error': 'College not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_college_hierarchy: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== ENHANCED APPLICATION SUBMISSION - NO AUTH REQUIRED ====================

@api_view(['POST'])
def submit_application_v2(request):
    """
    Enhanced version of submit_application - NO AUTHENTICATION REQUIRED
    """
    try:
        user = request.user if request.user.is_authenticated else None
        print(f"Processing application - User: {user.id if user else 'Anonymous'}")

        selected_course_id = request.data.get('selected_course_id') or request.data.get('course_id')
        
        selected_course = None
        college = None
        course_name = ''
        department_name = ''
        selected_category = ''
        selected_degree_type = ''
        
        if selected_course_id:
            try:
                selected_course = Course.objects.select_related('college').get(
                    course_id=selected_course_id,
                    is_active=True
                )
                college = selected_course.college
                course_name = selected_course.course_name
                department_name = selected_course.get_course_code_display()
                selected_category = selected_course.category
                selected_degree_type = selected_course.degree_type
            except Course.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Selected course not found or inactive'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            college_id = request.data.get('college_id') or request.data.get('college')
            if college_id:
                college = College.objects.filter(college_id=college_id).first()
            course_name = request.data.get('course_name') or request.data.get('course', '')
            department_name = request.data.get('department_name') or request.data.get('department', '')
            selected_category = request.data.get('selected_category', '')
            selected_degree_type = request.data.get('selected_degree_type', '')

        # Generate unique application ID
        if user:
            application_id = f'APP-{user.id}-{datetime.now().strftime("%Y%m%d%H%M%S")}'
        else:
            email_or_mobile = request.data.get('email_id') or request.data.get('mobile_number', 'anonymous')
            application_id = f'APP-{email_or_mobile}-{datetime.now().strftime("%Y%m%d%H%M%S")}'

        application_data = {
            'application_id': application_id,
            'user': user.id if user else None,
            'college': college.college_id if college else None,
            'selected_course': selected_course.course_id if selected_course else None,
            'course_name': course_name,
            'department_name': department_name,
            'selected_category': selected_category,
            'selected_degree_type': selected_degree_type,
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
            'reference_name': request.data.get('reference_name', ''),
        }

        serializer = EnquiryFormSerializer(data=application_data)

        if serializer.is_valid():
            application = serializer.save()

            # Send confirmation email
            try:
                submission_date = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                
                email_content = f"""
Dear {application.first_name},

Your application has been submitted successfully.

Application Details:
- Application ID: {application.application_id}
- College: {college.college_name if college else 'N/A'}
- Course: {course_name or 'N/A'}
- Department: {department_name or 'N/A'}
- Submission Date: {submission_date}

Thank you for choosing Vamshi EduCare.

Best Regards,
Vamshi EduCare Team
"""

                send_mail(
                    subject='Application Submitted Successfully - Vamshi EduCare',
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
                'selected_course': {
                    'id': selected_course.course_id if selected_course else None,
                    'name': course_name,
                    'department': department_name
                }
            }, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
            return Response({
                'success': False,
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e),
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== COLLEGE VIEWS ====================

@api_view(['GET'])
def get_colleges(request):
    """Get all colleges with optional filtering"""
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


# ==================== APPLICATION SUBMISSION - NO AUTH REQUIRED ====================

@api_view(['POST'])
def submit_application(request):
    """Submit student enquiry form - NO AUTHENTICATION REQUIRED"""
    try:
        user = request.user if request.user.is_authenticated else None
        print(f"Processing application - User: {user.id if user else 'Anonymous'}")

        if user:
            application_id = f'APP-{user.id}-{datetime.now().strftime("%Y%m%d%H%M%S")}'
        else:
            email_or_mobile = request.data.get('email_id') or request.data.get('mobile_number', 'anonymous')
            application_id = f'APP-{email_or_mobile}-{datetime.now().strftime("%Y%m%d%H%M%S")}'

        college_id = request.data.get('college_id') or request.data.get('college')
        college = None
        if college_id:
            college = College.objects.filter(college_id=college_id).first()

        course_name = request.data.get('course_name') or request.data.get('course', '')
        department_name = request.data.get('department_name') or request.data.get('department', '')

        application_data = {
            'application_id': application_id,
            'user': user.id if user else None,
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
            'reference_name': request.data.get('reference_name', ''),
        }

        serializer = EnquiryFormSerializer(data=application_data)

        if serializer.is_valid():
            application = serializer.save()

            try:
                submission_date = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

                email_content = f"""
Dear {application.first_name},

Your application has been submitted successfully.

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
                    subject='Application Submitted Successfully - Vamshi EduCare',
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


# ==================== OTHER VIEWS (Keep as is) ====================

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