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
    course_code_display = serializers.SerializerMethodField()
    course_name_display = serializers.SerializerMethodField()
    degree_type_display = serializers.SerializerMethodField()
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
        if obj.tuition_fee_management:
            return f"₹{obj.tuition_fee_management:,.2f}/year"
        return None
    
    def get_tuition_fee_government_formatted(self, obj):
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
                'hostel_available': obj.college.hostel_available
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


class CollegeWithFeesSerializer(serializers.ModelSerializer):
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
    college_fees = serializers.SerializerMethodField()
    college_hostels = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_college_fees(self, obj):
        fees = Fees.objects.filter(college=obj.college).order_by('-academic_year')
        return FeesListSerializer(fees, many=True).data
    
    def get_college_hostels(self, obj):
        hostels = Hostel.objects.filter(college=obj.college, is_active=True)
        return HostelSerializer(hostels, many=True).data


class FeeRangeSerializer(serializers.Serializer):
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


# ==================== APPLICATION FORM SERIALIZER (UPDATED) ====================

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

    # Applied course info (updated to match model)
    college_id = serializers.IntegerField(required=False)
    course_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    quota_type = serializers.ChoiceField(choices=['management', 'government'], required=False, default='management')


# ==================== STUDENT APPLICATION DATA SERIALIZER ====================

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


# ==================== STUDENT APPLICATION MODEL SERIALIZER ====================

class StudentApplicationSerializer(serializers.ModelSerializer):
    """Serializer for StudentApplication model with file uploads"""
    college_name = serializers.CharField(source='college.college_name', read_only=True)

    class Meta:
        model = StudentApplication
        fields = '__all__'
        read_only_fields = ['application_id', 'submitted_at', 'updated_at']

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

    class Meta:
        model = StudentApplication
        fields = [
            'application_id', 'college_name', 'quota_type', 'status',
            'first_name', 'last_name', 'email_id', 'mobile_number',
            'submitted_at', 'updated_at'
        ]
