from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import User, UserProfile, College, TeamMember, TimelineEvent, CompanyStat
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    TeamMemberSerializer,
    TimelineEventSerializer,
    CompanyStatSerializer,
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'message': 'Registration successful.'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Authenticate user and return token/user data."""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'token': f'jwt-token-{user.id}-{user.username}'  # Placeholder token
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def user_detail(request, user_id):
    """Get user details by ID."""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def colleges_list(request):
    """Get list of all colleges."""
    colleges = College.objects.all()[:50]
    data = []
    for college in colleges:
        data.append({
            'id': college.id,
            'name': college.name,
            'city': college.city,
            'district': college.district,
            'branch': college.branch,
            'type': college.type,
            'cutoff_mark': college.cutoff_mark,
            'community_category': college.community_category,
            'scholarship_available': college.scholarship_available,
            'description': college.description,
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def college_detail(request, college_id):
    """Get college details by ID."""
    try:
        college = College.objects.get(id=college_id)
    except College.DoesNotExist:
        return Response({'error': 'College not found.'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'id': college.id,
        'name': college.name,
        'city': college.city,
        'district': college.district,
        'branch': college.branch,
        'type': college.type,
        'cutoff_mark': college.cutoff_mark,
        'community_category': college.community_category,
        'scholarship_available': college.scholarship_available,
        'description': college.description,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def college_suggestions(request):
    """Get college suggestions based on filters."""
    queryset = College.objects.all()

    cutoff = request.GET.get('cutoff_mark')
    if cutoff:
        queryset = queryset.filter(cutoff_mark__lte=cutoff)

    community = request.GET.get('community_category')
    if community:
        queryset = queryset.filter(community_category__iexact=community)

    branch = request.GET.get('preferred_branch')
    if branch:
        queryset = queryset.filter(branch__icontains=branch)

    district = request.GET.get('preferred_district')
    if district:
        queryset = queryset.filter(district__icontains=district)

    colleges = queryset[:50]
    data = []
    for college in colleges:
        data.append({
            'id': college.id,
            'name': college.name,
            'city': college.city,
            'district': college.district,
            'branch': college.branch,
            'type': college.type,
            'cutoff_mark': college.cutoff_mark,
            'community_category': college.community_category,
            'scholarship_available': college.scholarship_available,
            'description': college.description,
        })
    return Response(data)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_profile(request, user_id):
    """Update user profile."""
    try:
        user = User.objects.get(id=user_id)
        profile, _ = UserProfile.objects.get_or_create(user=user)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def team_members(request):
    """Get list of team members."""
    team = TeamMember.objects.all()
    serializer = TeamMemberSerializer(team, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def timeline_events(request):
    """Get list of timeline events."""
    events = TimelineEvent.objects.all()
    serializer = TimelineEventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def company_stats(request):
    """Get list of company stats."""
    stats = CompanyStat.objects.all()
    serializer = CompanyStatSerializer(stats, many=True)
    return Response(serializer.data)