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
from .models import College, Course, UserProfile, EnquiryForm
import logging

logger = logging.getLogger(__name__)


# ==================== COLLEGE SERIALIZERS ====================

class CollegeSerializer(serializers.ModelSerializer):
    courses_offered_display = serializers.SerializerMethodField()
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
    
    def get_all_images(self, obj):
        """Get all images combined"""
        images = []
        if obj.college_images:
            images.extend(obj.college_images)
        if obj.campus_images:
            images.extend(obj.campus_images)
        return images
    
    def get_primary_image(self, obj):
        """Get primary/cover image"""
        if obj.banner_image:
            return obj.banner_image
        if obj.college_images and len(obj.college_images) > 0:
            return obj.college_images[0]
        if obj.campus_images and len(obj.campus_images) > 0:
            return obj.campus_images[0]
        return None
    
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
            'college_id', 'college_name', 'short_name', 
            'location_city', 'location_state', 'banner_image',
            'college_images', 'campus_images', 'primary_image',
            'courses_offered', 'courses_offered_display', 'courses_count'
        ]
    
    def get_courses_offered_display(self, obj):
        course_map = dict(College.COURSE_CATEGORY_CHOICES)
        return [course_map.get(course, course) for course in obj.courses_offered]
    
    def get_courses_count(self, obj):
        return len(obj.courses_offered) if obj.courses_offered else 0
    
    def get_primary_image(self, obj):
        if obj.banner_image:
            return obj.banner_image
        if obj.college_images and len(obj.college_images) > 0:
            return obj.college_images[0]
        if obj.campus_images and len(obj.campus_images) > 0:
            return obj.campus_images[0]
        return None


class CollegeDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single college view with all images"""
    courses_offered_display = serializers.SerializerMethodField()
    
    # Image gallery fields
    all_images = serializers.SerializerMethodField()
    all_categorized_images = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    has_gallery = serializers.SerializerMethodField()
    
    # Related data
    courses_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = College
        fields = '__all__'
    
    def get_courses_offered_display(self, obj):
        course_map = dict(College.COURSE_CATEGORY_CHOICES)
        return [course_map.get(course, course) for course in obj.courses_offered]
    
    def get_all_images(self, obj):
        """Get all images combined"""
        images = []
        if obj.college_images:
            images.extend(obj.college_images)
        if obj.campus_images:
            images.extend(obj.campus_images)
        return images
    
    def get_all_categorized_images(self, obj):
        """Get all images categorized by type"""
        return {
            'general': obj.college_images or [],
            'campus': obj.campus_images or [],
        }
    
    def get_primary_image(self, obj):
        if obj.banner_image:
            return obj.banner_image
        if obj.college_images and len(obj.college_images) > 0:
            return obj.college_images[0]
        if obj.campus_images and len(obj.campus_images) > 0:
            return obj.campus_images[0]
        return None
    
    def get_has_gallery(self, obj):
        return bool(self.get_all_images(obj))
    
    def get_courses_detail(self, obj):
        if hasattr(obj, 'courses'):
            courses = obj.courses.filter(is_active=True)
            return CourseSerializer(courses, many=True).data
        return []


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


class CollegeUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating college with partial updates"""
    
    class Meta:
        model = College
        fields = '__all__'
        read_only_fields = ['college_id']
    
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
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = College
        fields = '__all__'
    
    def get_courses_offered_display(self, obj):
        course_map = dict(College.COURSE_CATEGORY_CHOICES)
        return [course_map.get(course, course) for course in obj.courses_offered]
    
    def get_courses_detail(self, obj):
        if hasattr(obj, 'courses'):
            courses = obj.courses.filter(is_active=True)
            return CourseSerializer(courses, many=True).data
        return None
    
    def get_primary_image(self, obj):
        if obj.banner_image:
            return obj.banner_image
        if obj.college_images and len(obj.college_images) > 0:
            return obj.college_images[0]
        if obj.campus_images and len(obj.campus_images) > 0:
            return obj.campus_images[0]
        return None


class CollegeImageUpdateSerializer(serializers.Serializer):
    """Serializer for updating college images"""
    action = serializers.ChoiceField(choices=['add', 'remove', 'set'])
    category = serializers.ChoiceField(choices=['general', 'campus'])
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
        return dict(obj.COURSE_NAME_CHOICES).get(obj.course_code, obj.course_code)

    def get_course_name_display(self, obj):
        return obj.course_name

    def get_degree_type_display(self, obj):
        return dict(obj.DEGREE_TYPE_CHOICES).get(obj.degree_type, obj.degree_type)

    def get_college_details(self, obj):
        if obj.college:
            return {
                'college_id': obj.college.college_id,
                'college_name': obj.college.college_name,
                'banner_image': obj.college.banner_image,
                'location_city': obj.college.location_city,
                'location_state': obj.college.location_state
            }
        return None


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing courses in dropdowns"""
    full_name = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()
    degree_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'course_id', 'course_code', 'course_name', 'full_name',
            'category', 'category_display', 'degree_type', 'degree_type_display',
            'college', 'is_active'
        ]
    
    def get_full_name(self, obj):
        return f"{obj.get_course_code_display()} - {obj.course_name}"
    
    def get_category_display(self, obj):
        return dict(College.COURSE_CATEGORY_CHOICES).get(obj.category, obj.category)
    
    def get_degree_type_display(self, obj):
        return dict(obj.DEGREE_TYPE_CHOICES).get(obj.degree_type, obj.degree_type)


class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed course serializer with complete information"""
    category_display = serializers.SerializerMethodField()
    course_code_display = serializers.SerializerMethodField()
    degree_type_display = serializers.SerializerMethodField()
    college_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_category_display(self, obj):
        return dict(College.COURSE_CATEGORY_CHOICES).get(obj.category, obj.category)
    
    def get_course_code_display(self, obj):
        return dict(obj.COURSE_NAME_CHOICES).get(obj.course_code, obj.course_code)
    
    def get_degree_type_display(self, obj):
        return dict(obj.DEGREE_TYPE_CHOICES).get(obj.degree_type, obj.degree_type)
    
    def get_college_info(self, obj):
        if obj.college:
            return {
                'college_id': obj.college.college_id,
                'college_name': obj.college.college_name,
                'location_city': obj.college.location_city,
                'location_state': obj.college.location_state,
                'banner_image': obj.college.banner_image,
                'primary_image': obj.college.primary_image
            }
        return None


# ==================== HIERARCHICAL SELECTION SERIALIZERS (NEW) ====================

class CategoryInfoSerializer(serializers.Serializer):
    """Serializer for category information in hierarchical selection"""
    code = serializers.CharField()
    name = serializers.CharField()
    course_count = serializers.IntegerField()
    has_courses = serializers.BooleanField()


class DegreeTypeInfoSerializer(serializers.Serializer):
    """Serializer for degree type information in hierarchical selection"""
    code = serializers.CharField()
    name = serializers.CharField()
    course_count = serializers.IntegerField()
    has_courses = serializers.BooleanField()


class CourseInfoSerializer(serializers.Serializer):
    """Serializer for course information in hierarchical selection"""
    id = serializers.IntegerField()
    course_code = serializers.CharField()
    course_code_display = serializers.CharField()
    course_name = serializers.CharField()
    full_name = serializers.CharField()
    degree_type = serializers.CharField()
    degree_type_display = serializers.CharField()
    category = serializers.CharField()
    category_display = serializers.CharField()
    college_id = serializers.IntegerField()
    college_name = serializers.CharField()
    is_active = serializers.BooleanField()


class CollegeHierarchySerializer(serializers.Serializer):
    """Serializer for complete college hierarchy"""
    college_id = serializers.IntegerField()
    college_name = serializers.CharField()
    categories = serializers.ListField(child=serializers.DictField())


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


# ==================== USER PROFILE SERIALIZER ====================

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


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
            subject = f'Welcome to Vamshi EduCare, {user.first_name or user.username}!'
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #4CAF50; color: #fff; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .button {{ display: inline-block; padding: 10px 20px; background: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px; }}
                    .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Vamshi EduCare</h1>
                    </div>
                    <div class="content">
                        <h2>Welcome, {user.first_name or user.username}!</h2>
                        <p>Thank you for registering with Vamshi EduCare. We're excited to help you find your perfect college!</p>
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
                        </ul>
                        <p style="text-align: center;">
                            <a href="{settings.FRONTEND_URL}/profile" class="button">Complete Your Profile</a>
                        </p>
                        <p>If you have any questions, feel free to contact our support team.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Vamshi EduCare. All rights reserved.</p>
                        <p>Vamshi EduCare - Smart College Prediction & Admission Guidance</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            Welcome to Vamshi EduCare, {user.first_name or user.username}!
            
            Thank you for registering with Vamshi EduCare. 
            
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


# ==================== ENQUIRY FORM SERIALIZERS ====================

class EnquiryFormSerializer(serializers.ModelSerializer):
    """Serializer for EnquiryForm model"""
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    selected_course_details = serializers.SerializerMethodField()
    selection_path = serializers.SerializerMethodField()
    
    class Meta:
        model = EnquiryForm
        fields = '__all__'
        read_only_fields = ['application_id', 'submitted_at', 'updated_at']
    
    def get_selected_course_details(self, obj):
        """Get details of the selected course"""
        if obj.selected_course:
            return {
                'id': obj.selected_course.course_id,
                'course_code': obj.selected_course.course_code,
                'course_code_display': obj.selected_course.get_course_code_display(),
                'course_name': obj.selected_course.course_name,
                'full_name': f"{obj.selected_course.get_course_code_display()} - {obj.selected_course.course_name}",
                'degree_type': obj.selected_course.degree_type,
                'degree_type_display': obj.selected_course.get_degree_type_display(),
                'category': obj.selected_course.category,
                'category_display': obj.selected_course.category_display
            }
        return None
    
    def get_selection_path(self, obj):
        """Get the full selection path"""
        if obj.selection_completed:
            return obj.selection_path_display
        return None
    
    def validate_photo(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Photo size must be less than 5MB")
        return value
    
    def validate_aadhar_card(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Aadhar card size must be less than 5MB")
        return value
    
    def validate(self, data):
        """Validate that if selected_course is provided, it's active and belongs to the college"""
        selected_course = data.get('selected_course')
        college = data.get('college')
        
        if selected_course:
            if not selected_course.is_active:
                raise serializers.ValidationError({
                    'selected_course': 'The selected course is not active'
                })
            
            if college and selected_course.college != college:
                raise serializers.ValidationError({
                    'selected_course': 'The selected course does not belong to the specified college'
                })
            
            # Auto-populate fields from selected course
            data['course_name'] = selected_course.course_name
            data['department_name'] = selected_course.get_course_code_display()
            data['selected_category'] = selected_course.category
            data['selected_degree_type'] = selected_course.degree_type
            
            if not college:
                data['college'] = selected_course.college
        
        return data


class EnquiryFormListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing enquiry forms"""
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    course_display = serializers.SerializerMethodField()
    selection_status = serializers.SerializerMethodField()
    
    class Meta:
        model = EnquiryForm
        fields = [
            'application_id', 'college_name', 'course_name', 'department_name',
            'first_name', 'last_name', 'email_id', 'mobile_number',
            'submitted_at', 'updated_at', 'course_display', 'selection_status'
        ]
    
    def get_course_display(self, obj):
        if obj.selected_course:
            return f"{obj.selected_course.get_course_code_display()} - {obj.course_name}"
        return obj.course_name or 'N/A'
    
    def get_selection_status(self, obj):
        return 'Completed' if obj.selection_completed else 'Partial'


class EnquiryFormCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new enquiry forms with hierarchical selection"""
    
    class Meta:
        model = EnquiryForm
        fields = '__all__'
        read_only_fields = ['application_id', 'submitted_at', 'updated_at', 'course_name', 'department_name']
    
    def create(self, validated_data):
        # Generate application ID
        from datetime import datetime
        user = validated_data.get('user')
        if user:
            validated_data['application_id'] = f"APP-{user.id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        return super().create(validated_data)