from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import College, Course, UserProfile, TimelineEvent, Fees, Hostel


class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = '__all__'


class CollegeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ['college_id', 'college_name', 'short_name', 'counselling_code', 
                  'location_city', 'location_state', 'type', 'affiliation',
                  'placement_percentage', 'naac_grade', 'nirf_rank', 'logo_url', 
                  'hostel_available']


class CollegeWithCoursesSerializer(serializers.ModelSerializer):
    courses = serializers.SerializerMethodField()
    
    class Meta:
        model = College
        fields = '__all__'
    
    def get_courses(self, obj):
        courses = Course.objects.filter(college_id=obj.college_id)
        return CourseSerializer(courses, many=True).data


class CourseSerializer(serializers.ModelSerializer):
    # Add display fields for better readability
    course_code_display = serializers.SerializerMethodField()
    course_name_display = serializers.SerializerMethodField()
    degree_type_display = serializers.SerializerMethodField()
    
    # Add formatted fee fields for Management and Government quotas
    tuition_fee_management_formatted = serializers.SerializerMethodField()
    tuition_fee_government_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_course_code_display(self, obj):
        return obj.get_course_code_display()
    
    def get_course_name_display(self, obj):
        return obj.get_course_name_display()
    
    def get_degree_type_display(self, obj):
        return obj.get_degree_type_display()
    
    def get_tuition_fee_management_formatted(self, obj):
        """Get formatted management quota fee"""
        if obj.tuition_fee_management:
            return f"₹{obj.tuition_fee_management:,.2f}/year"
        return None
    
    def get_tuition_fee_government_formatted(self, obj):
        """Get formatted government quota fee"""
        if obj.tuition_fee_government:
            return f"₹{obj.tuition_fee_government:,.2f}/year"
        return None


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


# ==================== FEES SERIALIZER ====================

class FeesSerializer(serializers.ModelSerializer):
    # Display fields for better readability
    payment_frequency_display = serializers.SerializerMethodField()
    total_fee = serializers.ReadOnlyField()
    total_fee_with_transport_min = serializers.ReadOnlyField()
    total_fee_with_transport_max = serializers.ReadOnlyField()
    transport_fee_range = serializers.ReadOnlyField()
    total_one_time_fees = serializers.ReadOnlyField()
    total_annual_fees = serializers.ReadOnlyField()
    additional_fees_list = serializers.SerializerMethodField()
    fee_breakdown = serializers.SerializerMethodField()
    
    # Nested fields for better API response
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
        """Get basic college details"""
        if obj.college:
            return {
                'college_id': obj.college.college_id,
                'college_name': obj.college.college_name,
                'location_city': obj.college.location_city,
                'location_state': obj.college.location_state,
                'type': obj.college.type,
                'hostel_available': obj.college.hostel_available
            }
        return None


class FeesListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
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


class CollegeWithFeesSerializer(serializers.ModelSerializer):
    """Serializer for college with all fees"""
    fees = serializers.SerializerMethodField()
    courses = serializers.SerializerMethodField()
    hostels = serializers.SerializerMethodField()
    
    class Meta:
        model = College
        fields = [
            'college_id', 'college_name', 'counselling_code', 
            'location_city', 'location_state', 'type', 
            'courses', 'fees', 'hostels'
        ]
    
    def get_fees(self, obj):
        fees = Fees.objects.filter(college=obj).order_by('-academic_year')
        return FeesListSerializer(fees, many=True).data
    
    def get_courses(self, obj):
        courses = Course.objects.filter(college_id=obj.college_id, is_active=True)
        return CourseSerializer(courses, many=True).data
    
    def get_hostels(self, obj):
        hostels = Hostel.objects.filter(college=obj, is_active=True)
        return HostelSerializer(hostels, many=True).data


class CourseWithFeesSerializer(serializers.ModelSerializer):
    """Serializer for course with fees from its college"""
    college_fees = serializers.SerializerMethodField()
    college_hostels = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_college_fees(self, obj):
        """Get fees from the college this course belongs to"""
        fees = Fees.objects.filter(college=obj.college).order_by('-academic_year')
        return FeesListSerializer(fees, many=True).data
    
    def get_college_hostels(self, obj):
        """Get hostels from the college this course belongs to"""
        hostels = Hostel.objects.filter(college=obj.college, is_active=True)
        return HostelSerializer(hostels, many=True).data


class FeeRangeSerializer(serializers.Serializer):
    """Serializer for fee range filter"""
    min_fee = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    max_fee = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    academic_year = serializers.CharField(required=False)
    quota_type = serializers.ChoiceField(choices=['management', 'government'], required=False)


# ==================== USER PROFILE SERIALIZER ====================

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    
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
        
        UserProfile.objects.create(
            user=user,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data['email'],
            phone_number=phone_number or '0000000000',
            address='',
            city='',
            state='Tamil Nadu',
            pincode='000000'
        )
        
        # Send welcome email
        try:
            subject = 'Welcome to ICE Foundation - Registration Successful'
            message = render_to_string('emails/welcome_email.html', {
                'user': user,
                'profile': user.userprofile,
            })
            send_mail(
                subject,
                '',  # Plain text version can be empty if using HTML
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=message,
                fail_silently=True
            )
        except Exception as e:
            # Log the error but don't fail registration
            print(f"Failed to send welcome email: {e}")
        
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)