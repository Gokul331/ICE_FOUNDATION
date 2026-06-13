from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from .models import College, Course, UserProfile, EnquiryForm
from .utils.pdf_generator import generate_application_pdf
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


# ==================== HIERARCHICAL SELECTION SERIALIZERS ====================

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


# ==================== ENQUIRY FORM SERIALIZERS ====================

class EnquiryFormSerializer(serializers.ModelSerializer):
    """Serializer for EnquiryForm model with reference field"""
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
        if value and hasattr(value, 'size') and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Photo size must be less than 5MB")
        return value
    
    def validate_aadhar_card(self, value):
        if value and hasattr(value, 'size') and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Aadhar card size must be less than 5MB")
        return value
    
    def validate_reference_name(self, value):
        """Validate reference name (optional field)"""
        if value and len(value) > 200:
            raise serializers.ValidationError("Reference name must be less than 200 characters")
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
    """Lightweight serializer for listing enquiry forms with reference field"""
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    course_display = serializers.SerializerMethodField()
    selection_status = serializers.SerializerMethodField()
    
    class Meta:
        model = EnquiryForm
        fields = [
            'application_id', 'college_name', 'course_name', 'department_name',
            'first_name', 'last_name', 'email_id', 'mobile_number',
            'submitted_at', 'updated_at', 'course_display', 'selection_status',
            'reference_name'
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
        read_only_fields = [
            'application_id', 'submitted_at', 'updated_at', 
            'course_name', 'department_name', 'user', 'selected_category', 
            'selected_degree_type', 'college'
        ]
    
    def validate_selected_course(self, value):
        """Validate that the selected course is active"""
        if value and not value.is_active:
            raise serializers.ValidationError("The selected course is not active")
        return value
    
    def validate_reference_name(self, value):
        """Validate reference name length"""
        if value and len(value) > 200:
            raise serializers.ValidationError("Reference name must be less than 200 characters")
        return value
    
    def create(self, validated_data):
        # Remove user if present (for anonymous submissions)
        validated_data.pop('user', None)
        
        # Auto-populate from selected_course if present
        selected_course = validated_data.get('selected_course')
        if selected_course:
            validated_data['course_name'] = selected_course.course_name
            validated_data['department_name'] = selected_course.get_course_code_display()
            validated_data['selected_category'] = selected_course.category
            validated_data['selected_degree_type'] = selected_course.degree_type
            validated_data['college'] = selected_course.college
        
        # Generate application ID
        from datetime import datetime
        identifier = validated_data.get('email_id') or validated_data.get('mobile_number', 'anonymous')
        # Clean identifier to remove special characters
        clean_identifier = ''.join(c for c in identifier if c.isalnum())[:30]
        validated_data['application_id'] = f"APP-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Create the enquiry form
        enquiry = EnquiryForm.objects.create(**validated_data)
        
        # Send email notification (optional)
        try:
            self._send_confirmation_email(enquiry)
        except Exception as e:
            logger.error(f"Failed to send confirmation email: {e}")
        
        return enquiry
    
    def _send_confirmation_email(self, enquiry):
        """Send the branded confirmation email to the applicant, with the application PDF attached."""
        context = {
            "first_name":       enquiry.first_name,
            "application_id":   enquiry.application_id,
            "college_name":     enquiry.college.college_name if enquiry.college else "ICE Foundation",
            "course_name":      enquiry.course_name or "—",
            # EnquiryForm has no quota field; map community (OC/BC/SC/ST/...) into the template
            "quota_type":       enquiry.get_community_display() or "N/A",
            "submission_date":  enquiry.submitted_at.strftime("%d %b %Y, %I:%M %p") if enquiry.submitted_at else "",
            "frontend_url":     settings.FRONTEND_URL,
        }

        subject = f"Application Received - {enquiry.application_id}"
        html_content = render_to_string("emails/application_submitted_email.html", context)
        text_content = (
            f"Dear {enquiry.first_name},\n\n"
            f"Your application has been received successfully.\n"
            f"Application ID: {enquiry.application_id}\n"
            f"College:        {context['college_name']}\n"
            f"Course:         {context['course_name']}\n"
            f"Community:      {context['quota_type']}\n\n"
            f"Our team will review your application and contact you shortly.\n\n"
            f"Best regards,\nVAMSHI EDUCARE Team"
        )

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[enquiry.email_id],
        )
        email.attach_alternative(html_content, "text/html")

        # Attach the application PDF (the template advertises this)
        try:
            pdf_buffer = generate_application_pdf(enquiry)
            email.attach(
                filename=f"{enquiry.application_id}_application.pdf",
                content=pdf_buffer.getvalue(),
                mimetype="application/pdf",
            )
        except Exception as pdf_err:
            # PDF failure should not block the email
            logger.warning(f"Could not generate PDF for {enquiry.application_id}: {pdf_err}")

        email.send()