from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .models import College, Course, UserProfile, TimelineEvent, Fees, Hostel, StudentApplication
import logging

logger = logging.getLogger(__name__)


# ==================== COLLEGE SERIALIZERS (UPDATED WITH IMAGE FIELDS) ====================

class CollegeSerializer(serializers.ModelSerializer):
    courses_offered_display = serializers.SerializerMethodField()
    type_display = serializers.SerializerMethodField()
    affiliation_display = serializers.SerializerMethodField()
    all_images = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    has_gallery = serializers.SerializerMethodField()
    
    class Meta:
        model = College
        fields = '__all__'
    
    def get_courses_offered_display(self, obj):
        """Return human-readable course names"""
        course_map = dict(College.COURSE_CATEGORY_CHOICES)
        return [course_map.get(course, course) for course in obj.courses_offered]
    
    def get_type_display(self, obj):
        return dict(College.TYPE_CHOICES).get(obj.type, obj.type)
    
    def get_affiliation_display(self, obj):
        return dict(College.AFFILIATION_CHOICES).get(obj.affiliation, obj.affiliation)
    
    def get_all_images(self, obj):
        """Get all images combined"""
        images = []
        if obj.college_images:
            images.extend(obj.college_images)
        if obj.campus_images:
            images.extend(obj.campus_images)
        if obj.facility_images:
            images.extend(obj.facility_images)
        if obj.hostel_images:
            images.extend(obj.hostel_images)
        if obj.library_images:
            images.extend(obj.library_images)
        if obj.lab_images:
            images.extend(obj.lab_images)
        if obj.sports_images:
            images.extend(obj.sports_images)
        return images
    
    def get_primary_image(self, obj):
        """Get primary/cover image"""
        if obj.cover_image:
            return obj.cover_image
        if obj.college_images and len(obj.college_images) > 0:
            return obj.college_images[0]
        if obj.campus_images and len(obj.campus_images) > 0:
            return obj.campus_images[0]
        return obj.logo_url
    
    def get_has_gallery(self, obj):
        """Check if college has any gallery images"""
        return bool(self.get_all_images(obj))


class CollegeListSerializer(serializers.ModelSerializer):
    courses_offered_display = serializers.SerializerMethodField()
    courses_count = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = College
        fields = [
            'college_id', 'college_name', 'short_name', 'counselling_code', 
            'location_city', 'location_state', 'type', 'affiliation',
            'placement_percentage', 'naac_grade', 'nirf_rank', 'logo_url',
            'cover_image', 'college_images', 'primary_image',
            'hostel_available', 'courses_offered', 'courses_offered_display',
            'courses_count'
        ]
    
    def get_courses_offered_display(self, obj):
        course_map = dict(College.COURSE_CATEGORY_CHOICES)
        return [course_map.get(course, course) for course in obj.courses_offered]
    
    def get_courses_count(self, obj):
        return len(obj.courses_offered) if obj.courses_offered else 0
    
    def get_primary_image(self, obj):
        """Get primary/cover image for list view"""
        if obj.cover_image:
            return obj.cover_image
        if obj.college_images and len(obj.college_images) > 0:
            return obj.college_images[0]
        if obj.campus_images and len(obj.campus_images) > 0:
            return obj.campus_images[0]
        return obj.logo_url


class CollegeDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single college view with all images"""
    courses_offered_display = serializers.SerializerMethodField()
    type_display = serializers.SerializerMethodField()
    affiliation_display = serializers.SerializerMethodField()
    
    # Image gallery fields
    all_images = serializers.SerializerMethodField()
    all_categorized_images = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    has_gallery = serializers.SerializerMethodField()
    
    # Related data
    courses_detail = serializers.SerializerMethodField()
    fees = serializers.SerializerMethodField()
    hostels = serializers.SerializerMethodField()
    
    class Meta:
        model = College
        fields = '__all__'
    
    def get_courses_offered_display(self, obj):
        course_map = dict(College.COURSE_CATEGORY_CHOICES)
        return [course_map.get(course, course) for course in obj.courses_offered]
    
    def get_type_display(self, obj):
        return dict(College.TYPE_CHOICES).get(obj.type, obj.type)
    
    def get_affiliation_display(self, obj):
        return dict(College.AFFILIATION_CHOICES).get(obj.affiliation, obj.affiliation)
    
    def get_all_images(self, obj):
        """Get all images combined"""
        images = []
        if obj.college_images:
            images.extend(obj.college_images)
        if obj.campus_images:
            images.extend(obj.campus_images)
        if obj.facility_images:
            images.extend(obj.facility_images)
        if obj.hostel_images:
            images.extend(obj.hostel_images)
        if obj.library_images:
            images.extend(obj.library_images)
        if obj.lab_images:
            images.extend(obj.lab_images)
        if obj.sports_images:
            images.extend(obj.sports_images)
        return images
    
    def get_all_categorized_images(self, obj):
        """Get all images categorized by type"""
        return {
            'general': obj.college_images or [],
            'campus': obj.campus_images or [],
            'facilities': obj.facility_images or [],
            'hostel': obj.hostel_images or [],
            'library': obj.library_images or [],
            'labs': obj.lab_images or [],
            'sports': obj.sports_images or [],
        }
    
    def get_primary_image(self, obj):
        if obj.cover_image:
            return obj.cover_image
        if obj.college_images and len(obj.college_images) > 0:
            return obj.college_images[0]
        if obj.campus_images and len(obj.campus_images) > 0:
            return obj.campus_images[0]
        return obj.logo_url
    
    def get_has_gallery(self, obj):
        return bool(self.get_all_images(obj))
    
    def get_courses_detail(self, obj):
        if hasattr(obj, 'course_set'):
            courses = obj.course_set.filter(is_active=True)
            return CourseSerializer(courses, many=True).data
        return []
    
    def get_fees(self, obj):
        fees = Fees.objects.filter(college=obj).order_by('-academic_year')
        return FeesListSerializer(fees, many=True).data
    
    def get_hostels(self, obj):
        hostels = Hostel.objects.filter(college=obj, is_active=True)
        return HostelSerializer(hostels, many=True).data


class CollegeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating colleges with image fields validation"""
    
    class Meta:
        model = College
        fields = '__all__'
    
    def validate_courses_offered(self, value):
        valid_categories = [choice[0] for choice in College.COURSE_CATEGORY_CHOICES]
        for category in value:
            if category not in valid_categories:
                raise serializers.ValidationError(
                    f"'{category}' is not a valid course category. Valid options: {valid_categories}"
                )
        return value
    
    def validate_college_images(self, value):
        """Validate college images array"""
        if value and len(value) > 50:
            raise serializers.ValidationError("Maximum 50 images allowed")
        return value
    
    def validate_campus_images(self, value):
        if value and len(value) > 30:
            raise serializers.ValidationError("Maximum 30 campus images allowed")
        return value
    
    def validate_facility_images(self, value):
        if value and len(value) > 30:
            raise serializers.ValidationError("Maximum 30 facility images allowed")
        return value


class CollegeUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating college with partial updates"""
    
    class Meta:
        model = College
        fields = '__all__'
        read_only_fields = ['college_id', 'created_at', 'updated_at']
    
    def validate_courses_offered(self, value):
        if value is not None:
            valid_categories = [choice[0] for choice in College.COURSE_CATEGORY_CHOICES]
            for category in value:
                if category not in valid_categories:
                    raise serializers.ValidationError(
                        f"'{category}' is not a valid course category"
                    )
        return value


class CollegeWithCoursesSerializer(serializers.ModelSerializer):
    courses_offered_display = serializers.SerializerMethodField()
    courses_detail = serializers.SerializerMethodField()
    type_display = serializers.SerializerMethodField()
    affiliation_display = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = College
        fields = '__all__'
    
    def get_courses_offered_display(self, obj):
        course_map = dict(College.COURSE_CATEGORY_CHOICES)
        return [course_map.get(course, course) for course in obj.courses_offered]
    
    def get_courses_detail(self, obj):
        if hasattr(obj, 'course_set'):
            courses = obj.course_set.filter(is_active=True)
            return CourseSerializer(courses, many=True).data
        return None
    
    def get_type_display(self, obj):
        return dict(College.TYPE_CHOICES).get(obj.type, obj.type)
    
    def get_affiliation_display(self, obj):
        return dict(College.AFFILIATION_CHOICES).get(obj.affiliation, obj.affiliation)
    
    def get_primary_image(self, obj):
        if obj.cover_image:
            return obj.cover_image
        if obj.college_images and len(obj.college_images) > 0:
            return obj.college_images[0]
        if obj.campus_images and len(obj.campus_images) > 0:
            return obj.campus_images[0]
        return obj.logo_url


class CollegeWithFeesSerializer(serializers.ModelSerializer):
    fees = serializers.SerializerMethodField()
    courses_offered_display = serializers.SerializerMethodField()
    hostels = serializers.SerializerMethodField()
    type_display = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    all_images = serializers.SerializerMethodField()
    
    class Meta:
        model = College
        fields = [
            'college_id', 'college_name', 'counselling_code', 
            'location_city', 'location_state', 'type', 'type_display',
            'courses_offered', 'courses_offered_display', 'fees', 'hostels',
            'logo_url', 'cover_image', 'primary_image', 'all_images',
            'college_images', 'campus_images', 'facility_images',
            'hostel_images', 'library_images', 'lab_images', 'sports_images'
        ]
    
    def get_fees(self, obj):
        fees = Fees.objects.filter(college=obj).order_by('-academic_year')
        return FeesListSerializer(fees, many=True).data
    
    def get_courses_offered_display(self, obj):
        course_map = dict(College.COURSE_CATEGORY_CHOICES)
        return [course_map.get(course, course) for course in obj.courses_offered]
    
    def get_hostels(self, obj):
        hostels = Hostel.objects.filter(college=obj, is_active=True)
        return HostelSerializer(hostels, many=True).data
    
    def get_type_display(self, obj):
        return dict(College.TYPE_CHOICES).get(obj.type, obj.type)
    
    def get_primary_image(self, obj):
        if obj.cover_image:
            return obj.cover_image
        if obj.college_images and len(obj.college_images) > 0:
            return obj.college_images[0]
        if obj.campus_images and len(obj.campus_images) > 0:
            return obj.campus_images[0]
        return obj.logo_url
    
    def get_all_images(self, obj):
        images = []
        if obj.college_images:
            images.extend(obj.college_images)
        if obj.campus_images:
            images.extend(obj.campus_images)
        if obj.facility_images:
            images.extend(obj.facility_images)
        if obj.hostel_images:
            images.extend(obj.hostel_images)
        if obj.library_images:
            images.extend(obj.library_images)
        if obj.lab_images:
            images.extend(obj.lab_images)
        if obj.sports_images:
            images.extend(obj.sports_images)
        return images


class CollegeImageUpdateSerializer(serializers.Serializer):
    """Serializer for updating college images"""
    action = serializers.ChoiceField(choices=['add', 'remove', 'set'])
    category = serializers.ChoiceField(choices=[
        'general', 'campus', 'facility', 'hostel', 'library', 'lab', 'sports'
    ])
    images = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        default=list
    )
    image_url = serializers.URLField(required=False)
    
    def validate_images(self, value):
        if len(value) > 50:
            raise serializers.ValidationError("Cannot add more than 50 images at once")
        return value


# ==================== COURSE SERIALIZERS ====================

class CourseSerializer(serializers.ModelSerializer):
    """Course serializer - for detailed course information"""
    category_display = serializers.SerializerMethodField()
    course_code_display = serializers.SerializerMethodField()
    course_name_display = serializers.SerializerMethodField()
    degree_type_display = serializers.SerializerMethodField()
    tuition_fee_management_formatted = serializers.SerializerMethodField()
    tuition_fee_government_formatted = serializers.SerializerMethodField()
    college_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_category_display(self, obj):
        if hasattr(obj, 'category'):
            category_map = dict(College.COURSE_CATEGORY_CHOICES)
            return category_map.get(obj.category, obj.category)
        return None
    
    def get_course_code_display(self, obj):
        return obj.get_course_code_display()
    
    def get_course_name_display(self, obj):
        return obj.get_course_name_display()
    
    def get_degree_type_display(self, obj):
        return obj.get_degree_type_display()
    
    def get_tuition_fee_management_formatted(self, obj):
        if obj.tuition_fee_management:
            return f"₹{obj.tuition_fee_management:,.2f}/year"
        return None
    
    def get_tuition_fee_government_formatted(self, obj):
        if obj.tuition_fee_government:
            return f"₹{obj.tuition_fee_government:,.2f}/year"
        return None
    
    def get_college_details(self, obj):
        if obj.college:
            return {
                'college_id': obj.college.college_id,
                'college_name': obj.college.college_name,
                'logo_url': obj.college.logo_url,
                'cover_image': obj.college.cover_image,
                'location_city': obj.college.location_city,
                'location_state': obj.college.location_state
            }
        return None


class CourseWithFeesSerializer(serializers.ModelSerializer):
    college_fees = serializers.SerializerMethodField()
    college_hostels = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()
    college_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_college_fees(self, obj):
        fees = Fees.objects.filter(college=obj.college).order_by('-academic_year')
        return FeesListSerializer(fees, many=True).data
    
    def get_college_hostels(self, obj):
        hostels = Hostel.objects.filter(college=obj.college, is_active=True)
        return HostelSerializer(hostels, many=True).data
    
    def get_category_display(self, obj):
        category_map = dict(College.COURSE_CATEGORY_CHOICES)
        return category_map.get(obj.category, obj.category) if hasattr(obj, 'category') else None
    
    def get_college_details(self, obj):
        if obj.college:
            return {
                'college_id': obj.college.college_id,
                'college_name': obj.college.college_name,
                'logo_url': obj.college.logo_url,
                'cover_image': obj.college.cover_image,
                'college_images': obj.college.college_images[:5] if obj.college.college_images else [],
                'location_city': obj.college.location_city,
                'location_state': obj.college.location_state,
                'type': obj.college.type,
                'naac_grade': obj.college.naac_grade,
                'nirf_rank': obj.college.nirf_rank,
                'placement_percentage': obj.college.placement_percentage
            }
        return None


# ==================== FILTER SERIALIZERS ====================

class CollegeCourseFilterSerializer(serializers.Serializer):
    """Serializer for filtering colleges by course categories"""
    categories = serializers.ListField(
        child=serializers.ChoiceField(choices=College.COURSE_CATEGORY_CHOICES),
        required=False,
        help_text="List of course categories to filter"
    )
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    type = serializers.ChoiceField(choices=College.TYPE_CHOICES, required=False)
    min_placement = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    hostel_available = serializers.BooleanField(required=False)
    has_images = serializers.BooleanField(required=False, help_text="Filter colleges with gallery images")


class CollegeBulkCourseUpdateSerializer(serializers.Serializer):
    """Serializer for bulk updating course categories for multiple colleges"""
    college_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    add_categories = serializers.ListField(
        child=serializers.ChoiceField(choices=College.COURSE_CATEGORY_CHOICES),
        required=False,
        default=list
    )
    remove_categories = serializers.ListField(
        child=serializers.ChoiceField(choices=College.COURSE_CATEGORY_CHOICES),
        required=False,
        default=list
    )
    replace_categories = serializers.ListField(
        child=serializers.ChoiceField(choices=College.COURSE_CATEGORY_CHOICES),
        required=False,
        help_text="If provided, completely replaces existing categories"
    )
    
    def validate(self, attrs):
        has_add_remove = attrs.get('add_categories') or attrs.get('remove_categories')
        has_replace = attrs.get('replace_categories') is not None
        
        if not has_add_remove and not has_replace:
            raise serializers.ValidationError(
                "Either add_categories/remove_categories or replace_categories must be provided"
            )
        
        return attrs
    
    def update_colleges(self):
        from django.db import transaction
        
        colleges = College.objects.filter(college_id__in=self.validated_data['college_ids'])
        updated_count = 0
        
        with transaction.atomic():
            for college in colleges:
                if self.validated_data.get('replace_categories') is not None:
                    college.courses_offered = self.validated_data['replace_categories']
                else:
                    current = set(college.courses_offered)
                    current.update(self.validated_data.get('add_categories', []))
                    current.difference_update(self.validated_data.get('remove_categories', []))
                    college.courses_offered = list(current)
                
                college.save()
                updated_count += 1
        
        return {
            'updated_colleges': updated_count,
            'college_ids': list(colleges.values_list('college_id', flat=True))
        }


# ==================== HOSTEL SERIALIZER ====================

class HostelSerializer(serializers.ModelSerializer):
    room_type_display = serializers.ReadOnlyField()
    gender_display = serializers.SerializerMethodField()
    total_capacity = serializers.ReadOnlyField()
    total_fee_with_deposit = serializers.ReadOnlyField()
    
    class Meta:
        model = Hostel
        fields = [
            'hostel_id', 'college', 'name', 'gender', 'gender_display',
            'room_type', 'room_type_display',
            'fee_per_semester', 'fee_per_year', 'caution_deposit',
            'total_fee_with_deposit',
            'total_rooms', 'capacity_per_room', 'total_capacity',
            'is_active', 'created_at', 'updated_at'
        ]
    
    def get_gender_display(self, obj):
        return dict(Hostel.GENDER_CHOICES).get(obj.gender, obj.gender)


# ==================== FEES SERIALIZERS ====================

class FeesSerializer(serializers.ModelSerializer):
    payment_frequency_display = serializers.SerializerMethodField()
    total_fee = serializers.ReadOnlyField()
    total_fee_with_transport_min = serializers.ReadOnlyField()
    total_fee_with_transport_max = serializers.ReadOnlyField()
    transport_fee_range = serializers.ReadOnlyField()
    total_one_time_fees = serializers.ReadOnlyField()
    total_annual_fees = serializers.ReadOnlyField()
    additional_fees_list = serializers.SerializerMethodField()
    fee_breakdown = serializers.SerializerMethodField()
    college_name = serializers.ReadOnlyField(source='college.college_name')
    college_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Fees
        fields = [
            'fee_id', 'college', 'college_name', 'college_details', 'academic_year',
            'transport_fee_min', 'transport_fee_max', 'transport_fee_range',
            'admission_fee', 'application_fee', 'book_fee', 'exam_fee', 
            'lab_fee', 'sports_fee', 'miscellaneous_fee', 'miscellaneous_description',
            'additional_fees', 'additional_fees_list', 'fee_breakdown',
            'total_one_time_fees', 'total_annual_fees',
            'payment_frequency', 'payment_frequency_display',
            'total_fee', 'total_fee_with_transport_min', 'total_fee_with_transport_max',
            'fee_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_payment_frequency_display(self, obj):
        return obj.get_payment_frequency_display()
    
    def get_additional_fees_list(self, obj):
        return obj.get_additional_fees_list()
    
    def get_fee_breakdown(self, obj):
        return obj.get_fee_breakdown()
    
    def get_college_details(self, obj):
        if obj.college:
            return {
                'college_id': obj.college.college_id,
                'college_name': obj.college.college_name,
                'location_city': obj.college.location_city,
                'location_state': obj.college.location_state,
                'type': obj.college.type,
                'hostel_available': obj.college.hostel_available,
                'courses_offered': obj.college.courses_offered,
                'logo_url': obj.college.logo_url
            }
        return None


class FeesListSerializer(serializers.ModelSerializer):
    college_name = serializers.ReadOnlyField(source='college.college_name')
    total_fee = serializers.ReadOnlyField()
    transport_fee_range = serializers.ReadOnlyField()
    payment_frequency_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Fees
        fields = [
            'fee_id', 'college', 'college_name', 'academic_year',
            'admission_fee', 'application_fee', 'book_fee', 'exam_fee',
            'transport_fee_range', 'total_fee',
            'payment_frequency', 'payment_frequency_display',
        ]
    
    def get_payment_frequency_display(self, obj):
        return obj.get_payment_frequency_display()


class FeeRangeSerializer(serializers.Serializer):
    min_fee = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    max_fee = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    academic_year = serializers.CharField(required=False)
    quota_type = serializers.ChoiceField(choices=['management', 'government'], required=False)


# ==================== USER PROFILE SERIALIZER ====================

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


# ==================== TIMELINE EVENT SERIALIZER ====================

class TimelineEventSerializer(serializers.ModelSerializer):
    college_name = serializers.ReadOnlyField(source='college.college_name')
    event_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = TimelineEvent
        fields = '__all__'
    
    def get_event_type_display(self, obj):
        return dict(TimelineEvent.EVENT_TYPES).get(obj.event_type, obj.event_type)


# ==================== AUTH SERIALIZERS ====================

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone_number']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def send_welcome_email(self, user, profile):
        """Send welcome email to new user"""
        try:
            subject = f'Welcome to ICE Foundation, {user.first_name or user.username}!'
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #000; color: #fff; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .button {{ display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; }}
                    .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ICE Foundation</h1>
                    </div>
                    <div class="content">
                        <h2>Welcome, {user.first_name or user.username}!</h2>
                        <p>Thank you for registering with ICE Foundation. We're excited to help you find your perfect college!</p>
                        <p>Your account has been successfully created with the following details:</p>
                        <ul>
                            <li><strong>Username:</strong> {user.username}</li>
                            <li><strong>Email:</strong> {user.email}</li>
                        </ul>
                        <p>Here's what you can do next:</p>
                        <ul>
                            <li>✅ Complete your profile</li>
                            <li>🔍 Explore colleges and courses</li>
                            <li>🎯 Get personalized college suggestions</li>
                            <li>💰 Discover scholarship opportunities</li>
                        </ul>
                        <p style="text-align: center;">
                            <a href="{settings.FRONTEND_URL}/profile" class="button">Complete Your Profile</a>
                        </p>
                        <p>If you have any questions, feel free to contact our support team.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 ICE Foundation. All rights reserved.</p>
                        <p>ICE Foundation - Smart College Prediction & Admission Guidance</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            Welcome to ICE Foundation, {user.first_name or user.username}!
            
            Thank you for registering with ICE Foundation. 
            
            Your account has been successfully created with:
            Username: {user.username}
            Email: {user.email}
            
            Next steps:
            1. Complete your profile at {settings.FRONTEND_URL}/profile
            2. Explore colleges and courses
            3. Get personalized college suggestions
            """
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
                reply_to=[settings.DEFAULT_FROM_EMAIL],
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
            logger.info(f"Welcome email sent successfully to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
            return False
    
    def create(self, validated_data):
        validated_data.pop('password2')
        phone_number = validated_data.pop('phone_number', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        profile = UserProfile.objects.create(
            user=user,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data['email'],
            phone_number=phone_number or '',
            address='',
            city='',
            state='Tamil Nadu',
            pincode='',
        )
        
        try:
            self.send_welcome_email(user, profile)
        except Exception as e:
            logger.error(f"Email sending failed but user was created: {str(e)}")
        
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


# ==================== PASSWORD RESET SERIALIZERS ====================

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value
    
    def send_reset_email(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        try:
            subject = 'Password Reset Request - ICE Foundation'
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #000; color: #fff; padding: 20px; text-align: center; }}
                    .button {{ display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ICE Foundation</h1>
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
                recipient_list=[email],
                html_message=html_content,
                fail_silently=False,
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset email to {email}: {str(e)}")
            return False


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match."})
        return attrs


# ==================== APPLICATION FORM SERIALIZERS ====================

class ApplicationFormSerializer(serializers.Serializer):
    # Bio-data
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    gender = serializers.ChoiceField(choices=['male', 'female', 'other'], required=False)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    mobile_number = serializers.CharField(max_length=10, required=False)
    email_id = serializers.EmailField(required=False)
    blood_group = serializers.CharField(max_length=5, required=False, allow_blank=True)
    nationality = serializers.CharField(max_length=50, required=False, default='Indian')
    community = serializers.ChoiceField(choices=['OC', 'BC', 'MBC', 'SC', 'ST', 'SCA', 'BCM', 'DNC'], required=False, allow_blank=True)
    sub_caste = serializers.CharField(max_length=50, required=False, allow_blank=True)
    marital_status = serializers.ChoiceField(choices=['single', 'married'], required=False, allow_blank=True)
    mother_tongue = serializers.CharField(max_length=30, required=False, allow_blank=True)
    aadhar_number = serializers.CharField(max_length=14, required=False, allow_blank=True)
    first_graduation = serializers.CharField(max_length=255, required=False, allow_blank=True)

    # Parent's details
    father_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    father_mobile = serializers.CharField(max_length=10, required=False, allow_blank=True)
    father_occupation = serializers.CharField(max_length=100, required=False, allow_blank=True)
    mother_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    mother_mobile = serializers.CharField(max_length=10, required=False, allow_blank=True)
    mother_occupation = serializers.CharField(max_length=100, required=False, allow_blank=True)
    family_annual_income = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)

    # Address details
    address_line1 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    pincode = serializers.CharField(max_length=6, required=False, allow_blank=True)

    # 10th details
    tenth_school_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    tenth_board = serializers.CharField(max_length=50, required=False, allow_blank=True)
    tenth_year_of_passing = serializers.IntegerField(required=False, allow_null=True)
    tenth_result_status = serializers.ChoiceField(choices=['declared', 'awaited'], required=False, allow_blank=True)
    tenth_marks_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)

    # 12th details
    twelfth_school_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    twelfth_board = serializers.CharField(max_length=50, required=False, allow_blank=True)
    twelfth_year_of_passing = serializers.IntegerField(required=False, allow_null=True)
    twelfth_result_status = serializers.ChoiceField(choices=['declared', 'awaited'], required=False, allow_blank=True)
    twelfth_marks_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)

    # Diploma details
    has_diploma = serializers.BooleanField(required=False, default=False)
    diploma_college_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    diploma_board_university = serializers.CharField(max_length=100, required=False, allow_blank=True)
    diploma_year_of_passing = serializers.IntegerField(required=False, allow_null=True)
    diploma_result_status = serializers.ChoiceField(choices=['declared', 'awaited'], required=False, allow_blank=True)
    diploma_marks_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)

    # UG details
    has_ug = serializers.BooleanField(required=False, default=False)
    ug_college_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    ug_board_university = serializers.CharField(max_length=100, required=False, allow_blank=True)
    ug_year_of_passing = serializers.IntegerField(required=False, allow_null=True)
    ug_result_status = serializers.ChoiceField(choices=['declared', 'awaited'], required=False, allow_blank=True)
    ug_marks_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)

    # Applied course info
    college_id = serializers.IntegerField(required=False)
    course_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    quota_type = serializers.ChoiceField(choices=['management', 'government'], required=False, default='management')


class StudentApplicationDataSerializer(serializers.Serializer):
    """Serializer to fetch existing student data for pre-filling application form"""
    username = serializers.ReadOnlyField()
    email = serializers.ReadOnlyField()
    first_name = serializers.ReadOnlyField()
    last_name = serializers.ReadOnlyField()
    date_of_birth = serializers.DateField(allow_null=True, required=False)
    gender = serializers.CharField(allow_null=True, required=False)
    phone_number = serializers.CharField(allow_null=True, required=False)
    address = serializers.CharField(allow_null=True, required=False)
    city = serializers.CharField(allow_null=True, required=False)
    state = serializers.CharField(allow_null=True, required=False)
    pincode = serializers.CharField(allow_null=True, required=False)


class StudentApplicationSerializer(serializers.ModelSerializer):
    """Serializer for StudentApplication model with file uploads"""
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    college_logo = serializers.CharField(source='college.logo_url', read_only=True)
    college_images = serializers.SerializerMethodField()

    class Meta:
        model = StudentApplication
        fields = '__all__'
        read_only_fields = ['application_id', 'submitted_at', 'updated_at']
    
    def get_college_images(self, obj):
        if obj.college:
            return {
                'logo': obj.college.logo_url,
                'cover': obj.college.cover_image,
                'gallery': obj.college.college_images[:5] if obj.college.college_images else []
            }
        return None

    def validate_photo(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Photo size must be less than 5MB")
        return value

    def validate_aadhar_card(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Aadhar card size must be less than 5MB")
        return value

    def validate_tenth_marksheet(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("10th marksheet size must be less than 5MB")
        return value

    def validate_twelfth_marksheet(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("12th marksheet size must be less than 5MB")
        return value


class StudentApplicationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing applications"""
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    college_logo = serializers.CharField(source='college.logo_url', read_only=True)

    class Meta:
        model = StudentApplication
        fields = [
            'application_id', 'college_name', 'college_logo', 'quota_type', 'status',
            'first_name', 'last_name', 'email_id', 'mobile_number',
            'submitted_at', 'updated_at'
        ]