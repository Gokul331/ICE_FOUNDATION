from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Q, F, Sum, Avg, Min, Max
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import College, Course, UserProfile, TimelineEvent, Fees
from .serializers import (
    CollegeSerializer, CollegeListSerializer, CourseSerializer,
    UserProfileSerializer, TimelineEventSerializer, RegisterSerializer, LoginSerializer,
    FeesSerializer, FeesListSerializer
)
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout 
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
import re


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
        # Check if college exists
        college = College.objects.filter(college_id=college_id).first()
        if not college:
            return Response({'error': 'College not found'}, status=404)
        
        # Get courses for this college
        courses = Course.objects.filter(college_id=college_id)
        
        # Use the CourseSerializer to serialize the data
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_college_fees(request, college_id):
    """Get all fee structures for a specific college"""
    try:
        # Check if college exists
        college = College.objects.filter(college_id=college_id).first()
        if not college:
            return Response({'error': 'College not found'}, status=404)
        
        # Get fees for this college
        fees = Fees.objects.filter(college=college)
        
        # Get query parameters for filtering
        course_id = request.GET.get('course_id')
        academic_year = request.GET.get('academic_year')
        hostel_room_type = request.GET.get('hostel_room_type')
        
        if course_id:
            fees = fees.filter(course_id=course_id)
        if academic_year:
            fees = fees.filter(academic_year=academic_year)
        if hostel_room_type:
            fees = fees.filter(hostel_room_type=hostel_room_type)
        
        serializer = FeesSerializer(fees, many=True)
        return Response(serializer.data, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_course_fees(request, course_id):
    """Get fee structure for a specific course"""
    try:
        # Check if course exists
        course = Course.objects.filter(course_id=course_id).first()
        if not course:
            return Response({'error': 'Course not found'}, status=404)
        
        # Get fees for this course
        fees = Fees.objects.filter(course=course)
        
        # Get query parameters
        academic_year = request.GET.get('academic_year')
        if academic_year:
            fees = fees.filter(academic_year=academic_year)
        
        serializer = FeesSerializer(fees, many=True)
        return Response(serializer.data, status=200)
        
    except Exception as e:
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
def get_courses(request):
    """Get all courses with optional filtering"""
    courses = Course.objects.all()

    # Filter by college
    college_id = request.GET.get('college_id')
    if college_id:
        courses = courses.filter(college_id=college_id)

    # Add filter by course code
    course_code = request.GET.get('course_code')
    if course_code:
        courses = courses.filter(course_code=course_code)

    # Add filter by course name
    course_name = request.GET.get('course_name')
    if course_name:
        courses = courses.filter(course_name__icontains=course_name)

    # Filter by specialization/stream
    stream = request.GET.get('stream')
    if stream:
        courses = courses.filter(specialization__icontains=stream)

    # Filter by min cutoff (for a community)
    cutoff = request.GET.get('cutoff')
    community = request.GET.get('community')
    if cutoff and community:
        cutoff = int(cutoff)
        if community == 'oc':
            courses = courses.filter(cutoff_oc__lte=cutoff)
        elif community == 'bc':
            courses = courses.filter(cutoff_bc__lte=cutoff)
        elif community == 'bcm':
            courses = courses.filter(cutoff_bcm__lte=cutoff)
        elif community == 'mbc':
            courses = courses.filter(cutoff_mbc__lte=cutoff)
        elif community == 'sc':
            courses = courses.filter(cutoff_sc__lte=cutoff)
        elif community == 'sca':
            courses = courses.filter(cutoff_sca__lte=cutoff)
        elif community == 'st':
            courses = courses.filter(cutoff_st__lte=cutoff)

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
    """Suggest colleges based on user preferences (cutoff, community, district, stream)"""
    cutoff = request.GET.get('cutoff_mark')
    community = request.GET.get('community')
    district = request.GET.get('preferred_district')
    stream = request.GET.get('preferred_stream')

    if not cutoff or not community:
        return Response({'error': 'cutoff_mark and community are required'}, status=400)

    cutoff = int(cutoff)

    # Determine cutoff field based on community
    cutoff_field = f'cutoff_{community.lower()}'

    # Get courses that match the cutoff criteria
    courses = Course.objects.filter(**{cutoff_field + '__lte': cutoff})

    if stream:
        courses = courses.filter(specialization__icontains=stream)

    # Get college IDs from filtered courses
    college_ids = courses.values_list('college_id', flat=True).distinct()

    # Filter colleges by district if provided
    colleges = College.objects.filter(college_id__in=college_ids)
    if district:
        colleges = colleges.filter(location_city__icontains=district)

    colleges = colleges.order_by('-placement_percentage', 'nirf_rank')[:20]

    serializer = CollegeListSerializer(colleges, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_fee_comparison(request):
    """Compare fees across multiple colleges/courses"""
    college_ids = request.GET.getlist('college_ids')
    course_id = request.GET.get('course_id')
    academic_year = request.GET.get('academic_year', '2024-2025')
    
    if not college_ids:
        return Response({'error': 'college_ids parameter is required'}, status=400)
    
    comparison_data = []
    
    for college_id in college_ids:
        try:
            college = College.objects.get(college_id=college_id)
            
            # Get fees for this college and course
            fees_query = Fees.objects.filter(college=college, academic_year=academic_year)
            if course_id:
                fees_query = fees_query.filter(course_id=course_id)
            else:
                fees_query = fees_query.filter(course__isnull=True)  # Default fees
            
            fees = fees_query.first()
            
            if fees:
                comparison_data.append({
                    'college_id': college.college_id,
                    'college_name': college.college_name,
                    'tuition_fee': float(fees.tuition_fee),
                    'hostel_fee': float(fees.hostel_fee),
                    'admission_fee': float(fees.admission_fee),
                    'transport_fee_min': float(fees.transport_fee_min),
                    'transport_fee_max': float(fees.transport_fee_max),
                    'total_fee_min': float(fees.total_fee_with_transport_min),
                    'total_fee_max': float(fees.total_fee_with_transport_max),
                    'hostel_options': [
                        {
                            'room_type': room_type,
                            'fee': float(fee_data.get('fee', 0)) if isinstance(fees.hostel_fees, dict) else 0
                        }
                        for room_type, fee_data in (fees.hostel_fees.items() if isinstance(fees.hostel_fees, dict) else {})
                    ] if hasattr(fees, 'hostel_fees') else []
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
        'average_tuition_fee': fees.aggregate(Avg('tuition_fee'))['tuition_fee__avg'],
        'min_tuition_fee': fees.aggregate(Min('tuition_fee'))['tuition_fee__min'],
        'max_tuition_fee': fees.aggregate(Max('tuition_fee'))['tuition_fee__max'],
        'average_hostel_fee': fees.aggregate(Avg('hostel_fee'))['hostel_fee__avg'],
        'min_hostel_fee': fees.aggregate(Min('hostel_fee'))['hostel_fee__min'],
        'max_hostel_fee': fees.aggregate(Max('hostel_fee'))['hostel_fee__max'],
        'total_fees_records': fees.count(),
        'academic_year': academic_year
    }
    
    return Response(stats)


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

# ==================== USER PROFILE VIEWS ====================

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_current_user_profile(request):
    """Get or update the current authenticated user's profile"""
    try:
        # Get or create user profile
        profile, created = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'first_name': request.user.first_name or '',
                'email': request.user.email,
                'phone_number': '0000000000',  # Temporary, user must update
                'address': '',
                'city': '',
                'pincode': '000000'
            }
        )
        
        if request.method == 'GET':
            # Get user data
            user_data = {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'date_joined': request.user.date_joined,
                'is_staff': request.user.is_staff,
            }
            
            # Get profile data
            profile_serializer = UserProfileSerializer(profile)
            profile_data = profile_serializer.data
            
            # Combine both
            combined_data = {**user_data, **profile_data}
            
            return Response(combined_data)
        
        elif request.method in ['PUT', 'PATCH']:
            # Update User model fields
            user_update = False
            
            if 'email' in request.data and request.data['email'] != request.user.email:
                # Check if email is already taken
                if User.objects.filter(email=request.data['email']).exclude(id=request.user.id).exists():
                    return Response(
                        {'error': 'Email already exists'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                request.user.email = request.data['email']
                user_update = True
            
            if user_update:
                request.user.save()
            
            # Update profile fields
            # Map profile fields
            profile_fields = [
                'first_name', 'last_name', 'date_of_birth', 'gender',
                'phone_number', 'whatsapp_number', 'address', 'city', 
                'state', 'pincode'
            ]
            
            for field in profile_fields:
                if field in request.data:
                    setattr(profile, field, request.data[field])
            
            # Also update User model's first_name and last_name if provided
            if 'first_name' in request.data:
                request.user.first_name = request.data['first_name']
                request.user.save()
            if 'last_name' in request.data:
                request.user.last_name = request.data['last_name']
                request.user.save()
            
            try:
                profile.save()
                
                # Return updated data
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
                response_data = {**user_data, **profile_serializer.data}
                
                return Response({
                    'message': 'Profile updated successfully',
                    'user': response_data
                })
                
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update the current user's profile"""
    try:
        # Get user profile
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found. Please complete your registration.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update User model fields
        if 'email' in request.data and request.data['email'] != request.user.email:
            if User.objects.filter(email=request.data['email']).exclude(id=request.user.id).exists():
                return Response(
                    {'error': 'Email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            request.user.email = request.data['email']
        
        if 'first_name' in request.data:
            request.user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            request.user.last_name = request.data['last_name']
        
        request.user.save()
        
        # Update profile fields
        profile_fields = [
            'first_name', 'last_name', 'date_of_birth', 'gender',
            'phone_number', 'whatsapp_number', 'address', 'city', 
            'state', 'pincode'
        ]
        
        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        
        profile.save()
        
        # Prepare response
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
    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_by_id(request, profile_id):
    """Update a user profile by ID (admin only or own profile)"""
    try:
        # Get the profile
        profile = UserProfile.objects.get(id=profile_id)
        
        # Check permission - users can only update their own profile unless admin
        if profile.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Permission denied. You can only update your own profile.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update User model fields if user is updating their own profile
        if profile.user == request.user:
            if 'email' in request.data and request.data['email'] != profile.user.email:
                if User.objects.filter(email=request.data['email']).exclude(id=profile.user.id).exists():
                    return Response(
                        {'error': 'Email already exists'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                profile.user.email = request.data['email']
            
            if 'first_name' in request.data:
                profile.user.first_name = request.data['first_name']
            if 'last_name' in request.data:
                profile.user.last_name = request.data['last_name']
            
            profile.user.save()
        
        # Update profile fields
        profile_fields = [
            'first_name', 'last_name', 'date_of_birth', 'gender',
            'phone_number', 'whatsapp_number', 'address', 'city', 
            'state', 'pincode'
        ]
        
        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        
        profile.save()
        
        # Prepare response
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
    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user's password"""
    try:
        # Get current password and new password from request
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        # Validate input
        if not current_password:
            return Response(
                {'error': 'Current password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not new_password:
            return Response(
                {'error': 'New password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != confirm_password:
            return Response(
                {'error': 'New passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if current password is correct
        if not request.user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new password strength
        if len(new_password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if new password is different from current
        if current_password == new_password:
            return Response(
                {'error': 'New password must be different from current password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        request.user.set_password(new_password)
        request.user.save()
        
        # Update session to prevent logout
        update_session_auth_hash(request, request.user)
        
        # Generate new token (invalidate old token and create new one)
        Token.objects.filter(user=request.user).delete()
        new_token = Token.objects.create(user=request.user)
        
        return Response({
            'message': 'Password changed successfully',
            'token': new_token.key
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_or_update_profile(request):
    """Create or update the current user's profile"""
    try:
        # Get or create profile
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
        
        # Update User model
        if 'email' in request.data and request.data['email'] != request.user.email:
            if User.objects.filter(email=request.data['email']).exclude(id=request.user.id).exists():
                return Response(
                    {'error': 'Email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            request.user.email = request.data['email']
        
        if 'first_name' in request.data:
            request.user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            request.user.last_name = request.data['last_name']
        
        request.user.save()
        
        # Update profile fields
        profile_fields = [
            'first_name', 'last_name', 'date_of_birth', 'gender',
            'phone_number', 'whatsapp_number', 'address', 'city', 
            'state', 'pincode'
        ]
        
        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        
        profile.save()
        
        # Prepare response
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
    
    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
def timeline_events(request):
    """GET: List all timeline events, POST: Create a timeline event"""
    if request.method == 'GET':
        events = TimelineEvent.objects.filter(is_active=True)

        # Filter by event type
        event_type = request.GET.get('event_type')
        if event_type:
            events = events.filter(event_type=event_type)

        # Filter by college
        college_id = request.GET.get('college_id')
        if college_id:
            events = events.filter(college_id=college_id)

        # Filter by upcoming (start_date >= now)
        upcoming = request.GET.get('upcoming')
        if upcoming and upcoming.lower() == 'true':
            from django.utils import timezone
            events = events.filter(start_date__gte=timezone.now())

        events = events[:50]  # Limit results
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
        print("="*50)
        print("REGISTER REQUEST RECEIVED")
        print("Request data:", request.data)
        print("="*50)
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                
                # Create auth token
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
                
                print("Registration successful:", response_data)
                
                return Response(response_data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                print("Registration error:", str(e))
                import traceback
                traceback.print_exc()
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("="*50)
        print("LOGIN REQUEST RECEIVED")
        print("Request data:", request.data)
        print("="*50)
        
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            # Check if username is email
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
                
                print("Login successful:", response_data)
                
                return Response(response_data, status=status.HTTP_200_OK)
            
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        print("Login serializer errors:", serializer.errors)
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
            # Delete the user's token to log them out
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