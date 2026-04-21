from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import College, Course, UserProfile, TimelineEvent, Fees


class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = '__all__'


class CollegeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ['college_id', 'college_name', 'short_name', 'counselling_code', 
                  'location_city', 'location_state', 'type', 'affiliation',
                  'scholarship_available', 'placement_percentage', 
                  'naac_grade', 'nirf_rank', 'logo_url', 'hostel_available']


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
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_course_code_display(self, obj):
        return obj.get_course_code_display()
    
    def get_course_name_display(self, obj):
        return obj.get_course_name_display()
    
    def get_degree_type_display(self, obj):
        return obj.get_degree_type_display()


# ==================== FEES SERIALIZER ====================
class FeesSerializer(serializers.ModelSerializer):
    # Display fields for better readability
    payment_frequency_display = serializers.SerializerMethodField()
    hostel_room_type_display = serializers.SerializerMethodField()
    total_fee = serializers.ReadOnlyField()
    total_fee_with_transport_min = serializers.ReadOnlyField()
    total_fee_with_transport_max = serializers.ReadOnlyField()
    transport_fee_range = serializers.ReadOnlyField()
    hostel_room_display = serializers.ReadOnlyField()
    
    # Nested fields for better API response
    college_name = serializers.ReadOnlyField(source='college.college_name')
    course_name = serializers.ReadOnlyField(source='course.course_name', default=None)
    
    class Meta:
        model = Fees
        fields = [
            'fee_id',
            'college',
            'college_name',
            'course',
            'course_name',
            'academic_year',
            'tuition_fee',
            'hostel_room_type',
            'hostel_room_type_display',
            'hostel_room_display',
            'hostel_fee',
            'transport_fee_min',
            'transport_fee_max',
            'transport_fee_range',
            'admission_fee',
            'payment_frequency',
            'payment_frequency_display',
            'total_fee',
            'total_fee_with_transport_min',
            'total_fee_with_transport_max',
            'fee_notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_payment_frequency_display(self, obj):
        return obj.get_payment_frequency_display()
    
    def get_hostel_room_type_display(self, obj):
        if obj.hostel_room_type:
            return dict(Fees.HOSTEL_ROOM_TYPE_CHOICES).get(obj.hostel_room_type)
        return None


class FeesListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    college_name = serializers.ReadOnlyField(source='college.college_name')
    course_name = serializers.ReadOnlyField(source='course.course_name', default=None)
    total_fee = serializers.ReadOnlyField()
    transport_fee_range = serializers.ReadOnlyField()
    
    class Meta:
        model = Fees
        fields = [
            'fee_id',
            'college_name',
            'course_name',
            'academic_year',
            'tuition_fee',
            'hostel_fee',
            'transport_fee_range',
            'total_fee',
            'payment_frequency',
        ]


class CollegeWithFeesSerializer(serializers.ModelSerializer):
    """Serializer for college with all fees"""
    fees = serializers.SerializerMethodField()
    courses = serializers.SerializerMethodField()
    
    class Meta:
        model = College
        fields = [
            'college_id', 'college_name', 'counselling_code', 
            'location_city', 'location_state', 'type', 'courses', 'fees'
        ]
    
    def get_fees(self, obj):
        fees = Fees.objects.filter(college=obj).order_by('-academic_year')
        return FeesListSerializer(fees, many=True).data
    
    def get_courses(self, obj):
        courses = Course.objects.filter(college_id=obj.college_id)
        return CourseSerializer(courses, many=True).data


class CourseWithFeesSerializer(serializers.ModelSerializer):
    """Serializer for course with fees"""
    fees = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_fees(self, obj):
        fees = Fees.objects.filter(course=obj).order_by('-academic_year')
        return FeesListSerializer(fees, many=True).data


class FeeRangeSerializer(serializers.Serializer):
    """Serializer for fee range filter"""
    min_fee = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    max_fee = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    academic_year = serializers.CharField(required=False)
    hostel_room_type = serializers.IntegerField(required=False)


# ==================== EXISTING SERIALIZERS ====================
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'


class TimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEvent
        fields = '__all__'


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
            phone_number=validated_data.get('phone_number', ''),
            address='',
            city='',
            state='Tamil Nadu',
            pincode=''
        )    
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)