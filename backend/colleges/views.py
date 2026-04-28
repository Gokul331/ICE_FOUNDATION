import os
import json
import zipfile
import re
import logging
from io import BytesIO
from datetime import datetime
from django.http import HttpResponse
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, F, Sum, Avg, Min, Max, Count
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from .models import College, Course, UserProfile, TimelineEvent, Fees, Hostel, StudentApplication
from .serializers import (
    CollegeSerializer, CollegeListSerializer, CourseSerializer,
    UserProfileSerializer, TimelineEventSerializer, RegisterSerializer, LoginSerializer,
    FeesSerializer, FeesListSerializer, HostelSerializer, ApplicationFormSerializer,
    StudentApplicationSerializer, StudentApplicationListSerializer
)
from .utils.pdf_generator import generate_application_pdf
from .utils.local_save import save_application_locally, save_application_media_files

# Set up logger
logger = logging.getLogger(__name__)

# ==================== COLLEGE VIEWS ====================

@api_view(['GET'])
def get_colleges(request):
    """Get all colleges with optional filtering"""
    colleges = College.objects.all()

    # Filter by city/district
    district = request.GET.get('district')
    if district:
        colleges = colleges.filter(location_city__icontains=district)

    # Filter by state
    state = request.GET.get('state')
    if state:
        colleges = colleges.filter(location_state__icontains=state)

    # Filter by type
    college_type = request.GET.get('type')
    if college_type:
        colleges = colleges.filter(type=college_type)

    # Filter by affiliation
    affiliation = request.GET.get('affiliation')
    if affiliation:
        colleges = colleges.filter(affiliation=affiliation)

    # Filter by min placement
    min_placement = request.GET.get('min_placement')
    if min_placement:
        colleges = colleges.filter(placement_percentage__gte=int(min_placement))

    # Filter by nirf ranking
    nirf = request.GET.get('nirf')
    if nirf:
        colleges = colleges.filter(nirf_rank__lte=int(nirf))

    # Filter by naac grade
    naac = request.GET.get('naac_grade')
    if naac:
        colleges = colleges.filter(naac_grade=naac)

    serializer = CollegeSerializer(colleges, many=True)
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


@api_view(['GET'])
def get_college_fees(request, college_id):
    """Get fee structure for a specific college"""
    try:
        college = College.objects.filter(college_id=college_id).first()
        if not college:
            return Response({'error': 'College not found'}, status=404)

        fees = Fees.objects.filter(college=college)

        academic_year = request.GET.get('academic_year')
        if academic_year:
            fees = fees.filter(academic_year=academic_year)

        serializer = FeesSerializer(fees, many=True)
        return Response(serializer.data, status=200)

    except Exception as e:
        print(f"Error in get_college_fees: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_courses(request):
    """Get all courses with optional filtering"""
    courses = Course.objects.filter(is_active=True)

    # Filter by college
    college_id = request.GET.get('college_id')
    if college_id:
        courses = courses.filter(college_id=college_id)

    # Filter by course code
    course_code = request.GET.get('course_code')
    if course_code:
        courses = courses.filter(course_code=course_code)

    # Filter by course name
    course_name = request.GET.get('course_name')
    if course_name:
        courses = courses.filter(course_name__icontains=course_name)

    # Filter by degree type
    degree_type = request.GET.get('degree_type')
    if degree_type:
        courses = courses.filter(degree_type=degree_type)

    # Filter by fee range for a specific quota
    min_fee = request.GET.get('min_fee')
    max_fee = request.GET.get('max_fee')
    quota_type = request.GET.get('quota_type', 'management')

    if min_fee and max_fee:
        if quota_type == 'management':
            courses = courses.filter(tuition_fee_management__gte=min_fee, tuition_fee_management__lte=max_fee)
        else:
            courses = courses.filter(tuition_fee_government__gte=min_fee, tuition_fee_government__lte=max_fee)
    elif min_fee:
        if quota_type == 'management':
            courses = courses.filter(tuition_fee_management__gte=min_fee)
        else:
            courses = courses.filter(tuition_fee_government__gte=min_fee)
    elif max_fee:
        if quota_type == 'management':
            courses = courses.filter(tuition_fee_management__lte=max_fee)
        else:
            courses = courses.filter(tuition_fee_government__lte=max_fee)

    # Filter by min cutoff
    cutoff = request.GET.get('cutoff')
    community = request.GET.get('community')
    if cutoff and community:
        cutoff = int(cutoff)
        community_field = f'cutoff_{community.lower()}'
        courses = courses.filter(**{f'{community_field}__lte': cutoff})

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


# ==================== FEES VIEWS ====================

@api_view(['GET'])
def get_filtered_fees(request):
    """Get fees with advanced filtering"""
    try:
        fees = Fees.objects.all()

        college_id = request.GET.get('college_id')
        if college_id:
            fees = fees.filter(college_id=college_id)

        academic_year = request.GET.get('academic_year')
        if academic_year:
            fees = fees.filter(academic_year=academic_year)

        serializer = FeesSerializer(fees, many=True)
        return Response(serializer.data, status=200)

    except Exception as e:
        print(f"Error in get_filtered_fees: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_fee_detail(request, fee_id):
    """Get a single fee record by ID"""
    try:
        fee = Fees.objects.get(fee_id=fee_id)
        serializer = FeesSerializer(fee)
        return Response(serializer.data)
    except Fees.DoesNotExist:
        return Response({'error': 'Fee record not found'}, status=404)


@api_view(['GET'])
def get_fee_comparison(request):
    """Compare fees across multiple colleges"""
    college_ids = request.GET.getlist('college_ids')
    academic_year = request.GET.get('academic_year', '2024-2025')

    if not college_ids:
        return Response({'error': 'college_ids parameter is required'}, status=400)

    comparison_data = []

    for college_id in college_ids:
        try:
            college = College.objects.get(college_id=college_id)
            fees = Fees.objects.filter(college=college, academic_year=academic_year).first()

            if fees:
                comparison_data.append({
                    'college_id': college.college_id,
                    'college_name': college.college_name,
                    'admission_fee': float(fees.admission_fee),
                    'application_fee': float(fees.application_fee),
                    'book_fee': float(fees.book_fee),
                    'exam_fee': float(fees.exam_fee),
                    'lab_fee': float(fees.lab_fee),
                    'sports_fee': float(fees.sports_fee),
                    'miscellaneous_fee': float(fees.miscellaneous_fee),
                    'transport_fee_min': float(fees.transport_fee_min),
                    'transport_fee_max': float(fees.transport_fee_max),
                    'total_fee': fees.total_fee,
                    'academic_year': fees.academic_year
                })
        except College.DoesNotExist:
            continue

    return Response(comparison_data)


@api_view(['GET'])
def get_fee_statistics(request):
    """Get fee statistics across all colleges"""
    academic_year = request.GET.get('academic_year', '2024-2025')

    fees = Fees.objects.filter(academic_year=academic_year)

    stats = {
        'average_admission_fee': fees.aggregate(Avg('admission_fee'))['admission_fee__avg'] or 0,
        'min_admission_fee': fees.aggregate(Min('admission_fee'))['admission_fee__min'] or 0,
        'max_admission_fee': fees.aggregate(Max('admission_fee'))['admission_fee__max'] or 0,
        'average_transport_fee_min': fees.aggregate(Avg('transport_fee_min'))['transport_fee_min__avg'] or 0,
        'average_transport_fee_max': fees.aggregate(Avg('transport_fee_max'))['transport_fee_max__avg'] or 0,
        'total_colleges': fees.count(),
        'academic_year': academic_year
    }

    return Response(stats)


# ==================== HOSTEL VIEWS ====================

@api_view(['GET'])
def get_college_hostels(request, college_id):
    """Get all hostels for a specific college"""
    try:
        college = College.objects.get(college_id=college_id)
        hostels = Hostel.objects.filter(college=college, is_active=True)
        serializer = HostelSerializer(hostels, many=True)
        return Response(serializer.data)
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)


@api_view(['GET'])
def get_hostel_by_room_type(request, college_id, room_type):
    """Get hostel by specific room type"""
    try:
        college = College.objects.get(college_id=college_id)
        hostel = Hostel.objects.filter(
            college=college, 
            room_type=room_type, 
            is_active=True
        ).first()

        if hostel:
            serializer = HostelSerializer(hostel)
            return Response(serializer.data)
        return Response({'error': 'Hostel not found for this room type'}, status=404)
    except College.DoesNotExist:
        return Response({'error': 'College not found'}, status=404)


@api_view(['GET'])
def get_available_hostels(request):
    """Get all hostels with available rooms"""
    hostels = Hostel.objects.filter(is_active=True)

    # Optional filters
    college_id = request.GET.get('college_id')
    if college_id:
        hostels = hostels.filter(college_id=college_id)

    gender = request.GET.get('gender')
    if gender:
        hostels = hostels.filter(gender=gender)

    room_type = request.GET.get('room_type')
    if room_type:
        hostels = hostels.filter(room_type=room_type)

    serializer = HostelSerializer(hostels, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_hostel_detail(request, hostel_id):
    """Get a single hostel by ID"""
    try:
        hostel = Hostel.objects.get(hostel_id=hostel_id)
        serializer = HostelSerializer(hostel)
        return Response(serializer.data)
    except Hostel.DoesNotExist:
        return Response({'error': 'Hostel not found'}, status=404)


# ==================== SUGGESTION VIEWS ====================

@api_view(['GET'])
def suggest_colleges(request):
    """Suggest colleges based on user preferences"""
    cutoff = request.GET.get('cutoff_mark')
    community = request.GET.get('community')
    district = request.GET.get('preferred_district')
    course = request.GET.get('preferred_course')

    if not cutoff or not community:
        return Response({'error': 'cutoff_mark and community are required'}, status=400)

    cutoff = int(cutoff)
    cutoff_field = f'cutoff_{community.lower()}'

    courses = Course.objects.filter(**{cutoff_field + '__lte': cutoff})

    if course:
        courses = courses.filter(course_name__icontains=course)

    college_ids = courses.values_list('college_id', flat=True).distinct()
    colleges = College.objects.filter(college_id__in=college_ids)

    if district:
        colleges = colleges.filter(location_city__icontains=district)

    colleges = colleges.order_by('-placement_percentage', 'nirf_rank')[:20]
    serializer = CollegeListSerializer(colleges, many=True)
    return Response(serializer.data)


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
                            'whatsapp_number', 'address', 'city', 'state', 'pincode']

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


# ==================== TIMELINE EVENT VIEWS ====================

@api_view(['GET', 'POST'])
def timeline_events(request):
    """GET: List all timeline events, POST: Create a timeline event"""
    if request.method == 'GET':
        events = TimelineEvent.objects.filter(is_active=True)

        event_type = request.GET.get('event_type')
        if event_type:
            events = events.filter(event_type=event_type)

        college_id = request.GET.get('college_id')
        if college_id:
            events = events.filter(college_id=college_id)

        upcoming = request.GET.get('upcoming')
        if upcoming and upcoming.lower() == 'true':
            from django.utils import timezone
            events = events.filter(start_date__gte=timezone.now())

        events = events[:50]
        serializer = TimelineEventSerializer(events, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TimelineEventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def timeline_event_detail(request, event_id):
    """Get, update, or delete a timeline event"""
    try:
        event = TimelineEvent.objects.get(id=event_id)
    except TimelineEvent.DoesNotExist:
        return Response({'error': 'Event not found'}, status=404)

    if request.method == 'GET':
        serializer = TimelineEventSerializer(event)
        return Response(serializer.data)
    elif request.method in ['PUT', 'PATCH']:
        serializer = TimelineEventSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        event.delete()
        return Response(status=204)


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
                          'whatsapp_number', 'address', 'city', 'state', 'pincode']

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
                          'whatsapp_number', 'address', 'city', 'state', 'pincode']

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
                          'whatsapp_number', 'address', 'city', 'state', 'pincode']

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

@api_view(['GET'])
def get_course_fees(request, course_id):
    """Get fee structure for a specific course"""
    try:
        course = Course.objects.get(course_id=course_id)
        fees = Fees.objects.filter(college=course.college)

        academic_year = request.GET.get('academic_year')
        if academic_year:
            fees = fees.filter(academic_year=academic_year)

        serializer = FeesSerializer(fees, many=True)
        data = serializer.data

        for fee_data in data:
            fee_data['course_specific_tuition'] = {
                'management': float(course.tuition_fee_management),
                'government': float(course.tuition_fee_government)
            }

        return Response(data, status=200)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)


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
        subject = 'Password Reset Request - ICE Foundation'
        message = render_to_string('emails/password_reset_email.html', {
            'user': user,
            'reset_link': reset_link,
        })
        send_mail(
            subject,
            '',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=message,
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
                'address_line2': '',
                'city': profile.city or '',
                'state': profile.state or '',
                'pincode': profile.pincode or '',
            })

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== APPLICATION SUBMISSION VIEW ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_application(request):
    """Submit student application form with file uploads"""
    try:
        user = request.user
        print(f"Processing application for user: {user.id} - {user.username}")

        if not user.is_authenticated:
            return Response({'error': 'User not authenticated'}, status=401)

        # Generate unique application ID
        application_id = f'APP-{user.id}-{datetime.now().strftime("%Y%m%d%H%M%S")}'

        # Get college object
        college_id = request.data.get('college_id') or request.data.get('college')
        if not college_id:
            return Response({'error': 'College ID is required'}, status=400)

        college = College.objects.filter(college_id=college_id).first()
        if not college:
            college = College.objects.filter(id=college_id).first()
        if not college:
            return Response({'error': 'College not found'}, status=404)

        # Get course_name
        course_name = request.data.get('course')
        if not course_name:
            return Response({'error': 'Course ID is required'}, status=400)

        quota_type = request.data.get('quota_type', 'management')

        # Prepare data for StudentApplication model
        application_data = {
            'application_id': application_id,
            'user': user.id,
            'college': college.college_id,
            'course_name': course_name,
            'quota_type': quota_type,
            'status': 'submitted',
            'first_name': request.data.get('first_name', ''),
            'last_name': request.data.get('last_name', ''),
            'gender': request.data.get('gender', ''),
            'date_of_birth': request.data.get('date_of_birth') or None,
            'mobile_number': request.data.get('mobile_number', ''),
            'email_id': request.data.get('email_id', ''),
            'blood_group': request.data.get('blood_group', ''),
            'nationality': request.data.get('nationality', 'Indian'),
            'community': request.data.get('community', ''),
            'sub_caste': request.data.get('sub_caste', ''),
            'marital_status': request.data.get('marital_status', ''),
            'mother_tongue': request.data.get('mother_tongue', ''),
            'aadhar_number': request.data.get('aadhar_number', ''),
            'first_graduation': request.data.get('first_graduation', ''),
            'father_name': request.data.get('father_name', ''),
            'father_mobile': request.data.get('father_mobile', ''),
            'father_occupation': request.data.get('father_occupation', ''),
            'mother_name': request.data.get('mother_name', ''),
            'mother_mobile': request.data.get('mother_mobile', ''),
            'mother_occupation': request.data.get('mother_occupation', ''),
            'family_annual_income': request.data.get('family_annual_income') or None,
            'address_line1': request.data.get('address_line1', ''),
            'address_line2': request.data.get('address_line2', ''),
            'city': request.data.get('city', ''),
            'state': request.data.get('state', ''),
            'pincode': request.data.get('pincode', ''),
            'tenth_school_name': request.data.get('tenth_school_name', ''),
            'tenth_board': request.data.get('tenth_board', ''),
            'tenth_year_of_passing': request.data.get('tenth_year_of_passing') or None,
            'tenth_result_status': request.data.get('tenth_result_status', ''),
            'tenth_marks_percentage': request.data.get('tenth_marks_percentage') or None,
            'twelfth_school_name': request.data.get('twelfth_school_name', ''),
            'twelfth_board': request.data.get('twelfth_board', ''),
            'twelfth_year_of_passing': request.data.get('twelfth_year_of_passing') or None,
            'twelfth_result_status': request.data.get('twelfth_result_status', ''),
            'twelfth_marks_percentage': request.data.get('twelfth_marks_percentage') or None,
            'has_diploma': request.data.get('has_diploma') in [True, 'true', 'True', '1', 1],
            'has_ug': request.data.get('has_ug') in [True, 'true', 'True', '1', 1],
            'declaration_accepted': request.data.get('declaration_accepted') in [True, 'true', 'True', '1', 1],
        }

        # Handle diploma fields
        if application_data['has_diploma']:
            application_data['diploma_college_name'] = request.data.get('diploma_college_name', '')
            application_data['diploma_board_university'] = request.data.get('diploma_board_university', '')
            application_data['diploma_year_of_passing'] = request.data.get('diploma_year_of_passing') or None
            application_data['diploma_result_status'] = request.data.get('diploma_result_status', '')
            application_data['diploma_marks_percentage'] = request.data.get('diploma_marks_percentage') or None

        # Handle UG fields
        if application_data['has_ug']:
            application_data['ug_college_name'] = request.data.get('ug_college_name', '')
            application_data['ug_board_university'] = request.data.get('ug_board_university', '')
            application_data['ug_year_of_passing'] = request.data.get('ug_year_of_passing') or None
            application_data['ug_result_status'] = request.data.get('ug_result_status', '')
            application_data['ug_marks_percentage'] = request.data.get('ug_marks_percentage') or None

        # Validate file sizes
        max_size = 5 * 1024 * 1024
        file_fields = ['photo', 'aadhar_card', 'tenth_marksheet', 'twelfth_marksheet',
                      'diploma_marksheet', 'ug_marksheet', 'community_marksheet']

        for field in file_fields:
            if field in request.FILES:
                file = request.FILES[field]
                if file.size > max_size:
                    return Response({
                        'error': f'{field} size must be less than 5MB.'
                    }, status=400)

        # Create application
        serializer = StudentApplicationSerializer(data=application_data)

        if serializer.is_valid():
            application = serializer.save()

            # Save files
            for field in file_fields:
                if field in request.FILES:
                    setattr(application, field, request.FILES[field])

            # Generate and save PDF
            try:

                pdf_buffer = generate_application_pdf(application)
                pdf_filename = f"{application.application_id}_application.pdf"
                application.pdf_copy.save(pdf_filename, ContentFile(pdf_buffer.getvalue()))
            except Exception as pdf_error:
                print(f"PDF generation error: {pdf_error}")

            # Save the application with files
            application.save()

            # Save to local folder
            try:
                local_save_result = save_application_locally(application)
                print(f"Application saved locally at: {local_save_result['folder_path']}")
                print(f"Files saved: {local_save_result['files_count']} files")
            except Exception as local_error:
                print(f"Local save error: {local_error}")
            
            # Send confirmation email with PDF attachment
            try:
                # Prepare email context
                submission_date = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

                email_context = {
                    'first_name': application.first_name,
                    'application_id': application.application_id,
                    'college_name': college.college_name,
                    'course_name': course_name,
                    'quota_type': quota_type.upper(),
                    'submission_date': submission_date,
                }
                
                # Render HTML email template
                html_message = render_to_string('emails/application_submitted_email.html', email_context)
                
                # Create plain text version
                text_message = f'''Dear {application.first_name},

Your application has been submitted successfully.

Application Details:
- Application ID: {application.application_id}
- College: {college.college_name}
- Course ID: {course_id}
- Quota: {quota_type.upper()}
- Submission Date: {submission_date}

A copy of your application PDF has been attached to this email.
Your application has been saved securely in our records.

Thank you for choosing ICE Foundation.

Best Regards,
The ICE Foundation Team'''

                # Create email with attachment
                email = EmailMultiAlternatives(
                    subject='Application Submitted Successfully - ICE Foundation',
                    body=text_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[application.email_id],
                    reply_to=[settings.DEFAULT_FROM_EMAIL]
                )

                # Attach HTML version
                email.attach_alternative(html_message, "text/html")
                
                # Attach PDF file
                if application.pdf_copy and application.pdf_copy.path:
                    try:
                        with open(application.pdf_copy.path, 'rb') as pdf_file:
                            pdf_content = pdf_file.read()
                            email.attach(
                                filename=f'{application.application_id}_application.pdf',
                                content=pdf_content,
                                mimetype='application/pdf'
                            )
                    except Exception as pdf_attach_error:
                        logger.error(f"Failed to attach PDF for application {application.application_id}: {pdf_attach_error}")

                # Send email
                email.send(fail_silently=False)
                logger.info(f"Application submission email sent successfully to {application.email_id} for application {application.application_id}")

            except Exception as email_error:
                logger.error(f"Email send failed for application {application.application_id}: {email_error}", exc_info=True)
                print(f"Email send failed: {email_error}")

            return Response({
                'success': True,
                'message': 'Application submitted successfully',
                'application_id': application.application_id,
                'college_id': college.college_id,
                'course_name': course_name,
                'quota_type': quota_type,
                'status': 'submitted'
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
            'trace': traceback.format_exc()
        }, status=500)


# ==================== APPLICATION RETRIEVAL VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_applications(request):
    """Get all applications for the current user"""
    try:
        applications = StudentApplication.objects.filter(user=request.user)
        serializer = StudentApplicationListSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_application_pdf(request, application_id):
    """Download PDF for a specific application"""
    try:
        application = StudentApplication.objects.get(application_id=application_id, user=request.user)
        
        if application.pdf_copy and application.pdf_copy.name:
            try:
                pdf_content = application.pdf_copy.read()
                response = HttpResponse(pdf_content, content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="application_{application_id}.pdf"'
                return response
            except Exception as e:
                print(f"Error reading PDF: {e}")
        
        from .utils.pdf_generator import generate_application_pdf
        pdf_buffer = generate_application_pdf(application)
        application.pdf_copy.save(f"{application.application_id}_application.pdf", ContentFile(pdf_buffer.getvalue()))
        application.save()
        
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="application_{application_id}.pdf"'
        return response
    except StudentApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)
    except Exception as e:
        print(f"Error in download_application_pdf: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_application_detail(request, application_id):
    """Get a specific application by ID"""
    try:
        application = StudentApplication.objects.get(application_id=application_id, user=request.user)
        serializer = StudentApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except StudentApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_application_detail_page(request, application_id):
    """Get detailed application data for view page"""
    try:
        application = StudentApplication.objects.get(application_id=application_id, user=request.user)
        
        data = {
            'application_id': application.application_id,
            'status': application.status,
            'submitted_at': application.submitted_at,
            'college_name': application.college.college_name if application.college else 'N/A',
            'college_id': application.college.college_id if application.college else None,
            'course_name': application.course_name if application.course_name else 'N/A',
            'quota_type': application.quota_type,
            'first_name': application.first_name,
            'last_name': application.last_name,
            'gender': application.gender,
            'date_of_birth': application.date_of_birth,
            'mobile_number': application.mobile_number,
            'email_id': application.email_id,
            'blood_group': application.blood_group,
            'nationality': application.nationality,
            'community': application.community,
            'sub_caste': application.sub_caste,
            'marital_status': application.marital_status,
            'mother_tongue': application.mother_tongue,
            'aadhar_number': application.aadhar_number,
            'first_graduation': application.first_graduation,
            'father_name': application.father_name,
            'father_mobile': application.father_mobile,
            'father_occupation': application.father_occupation,
            'mother_name': application.mother_name,
            'mother_mobile': application.mother_mobile,
            'mother_occupation': application.mother_occupation,
            'family_annual_income': application.family_annual_income,
            'address_line1': application.address_line1,
            'address_line2': application.address_line2,
            'city': application.city,
            'state': application.state,
            'pincode': application.pincode,
            'tenth_school_name': application.tenth_school_name,
            'tenth_board': application.tenth_board,
            'tenth_year_of_passing': application.tenth_year_of_passing,
            'tenth_result_status': application.tenth_result_status,
            'tenth_marks_percentage': application.tenth_marks_percentage,
            'twelfth_school_name': application.twelfth_school_name,
            'twelfth_board': application.twelfth_board,
            'twelfth_year_of_passing': application.twelfth_year_of_passing,
            'twelfth_result_status': application.twelfth_result_status,
            'twelfth_marks_percentage': application.twelfth_marks_percentage,
            'has_diploma': application.has_diploma,
            'diploma_college_name': application.diploma_college_name,
            'diploma_board_university': application.diploma_board_university,
            'diploma_year_of_passing': application.diploma_year_of_passing,
            'diploma_result_status': application.diploma_result_status,
            'diploma_marks_percentage': application.diploma_marks_percentage,
            'has_ug': application.has_ug,
            'ug_college_name': application.ug_college_name,
            'ug_board_university': application.ug_board_university,
            'ug_year_of_passing': application.ug_year_of_passing,
            'ug_result_status': application.ug_result_status,
            'ug_marks_percentage': application.ug_marks_percentage,
            'declaration_accepted': application.declaration_accepted,
        }
        
        return Response(data, status=200)
    except StudentApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)






























































































