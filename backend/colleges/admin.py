from django.contrib import admin
from django.db.models import Count, Q
from django.db import models
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.contrib.admin.widgets import AdminTextareaWidget
from django import forms
from .models import College, Course, UserProfile, EnquiryForm


# ==================== COURSE ADMIN FORM WITH COMPLETE HIERARCHICAL SELECTION ====================
class CourseForm(forms.ModelForm):
    """Enhanced Course Form with dynamic filtering for all fields"""
    
    # Add a custom field for degree type with dynamic choices
    degree_type = forms.ChoiceField(
        choices=[],
        required=True,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    
    # Add a custom field for course name with dynamic choices
    course_name = forms.ChoiceField(
        choices=[],
        required=True,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Get the college from either the POST data or the instance
        college_id = None
        
        if self.data.get('college'):
            # When form is submitted with data
            try:
                college_id = int(self.data.get('college'))
            except (ValueError, TypeError):
                pass
        elif self.instance and self.instance.pk and self.instance.college:
            # When editing an existing course
            college_id = self.instance.college.pk
            # Pre-select existing values
            if self.instance.degree_type:
                self.initial['degree_type'] = self.instance.degree_type
            if self.instance.course_code:
                self.initial['course_code'] = self.instance.course_code
        elif self.initial.get('college'):
            # When initial data is provided
            college_id = self.initial.get('college')
        
        # Filter category choices based on selected college
        if college_id:
            try:
                college = College.objects.get(pk=college_id)
                offered_categories = college.courses_offered or []
                
                if offered_categories:
                    # Filter category choices to only those offered by the college
                    self.fields['category'].choices = [
                        choice for choice in self.fields['category'].choices 
                        if choice[0] in offered_categories
                    ]
                    
                    # Add a help text to show available categories
                    category_names = [dict(College.COURSE_CATEGORY_CHOICES).get(cat, cat) for cat in offered_categories]
                    self.fields['category'].help_text = f"This college offers: {', '.join(category_names)}"
                else:
                    self.fields['category'].help_text = "No categories specified for this college. Please update the college's 'Courses Offered' field first."
                
                # Get the selected category
                selected_category = None
                if self.data.get('category'):
                    selected_category = self.data.get('category')
                elif self.instance and self.instance.category:
                    selected_category = self.instance.category
                elif self.initial.get('category'):
                    selected_category = self.initial.get('category')
                
                # Populate degree type choices based on college and category
                if selected_category:
                    # Get existing degree types for this college and category
                    existing_degree_types = Course.objects.filter(
                        college_id=college_id,
                        category=selected_category
                    ).values_list('degree_type', flat=True).distinct()
                    
                    # Add all degree type choices
                    degree_choices = [('', '--------')]
                    for dt_code, dt_name in Course.DEGREE_TYPE_CHOICES:
                        # Mark if this degree type has existing courses
                        if dt_code in existing_degree_types:
                            degree_choices.append((dt_code, f"{dt_name} (has existing courses)"))
                        else:
                            degree_choices.append((dt_code, dt_name))
                    
                    self.fields['degree_type'].choices = degree_choices
                    self.fields['degree_type'].help_text = "Select the degree type (UG, PG, Diploma, etc.)"
                else:
                    self.fields['degree_type'].choices = [('', '-- Select Category First --')]
                    self.fields['degree_type'].help_text = "Please select a category first"
                
                # Populate course name choices based on college, category, and degree type
                selected_degree_type = None
                if self.data.get('degree_type'):
                    selected_degree_type = self.data.get('degree_type')
                elif self.instance and self.instance.degree_type:
                    selected_degree_type = self.instance.degree_type
                elif self.initial.get('degree_type'):
                    selected_degree_type = self.initial.get('degree_type')
                
                if selected_category and selected_degree_type:
                    # Get existing course names for this combination
                    existing_course_names = Course.objects.filter(
                        college_id=college_id,
                        category=selected_category,
                        degree_type=selected_degree_type
                    ).values_list('course_name', flat=True)
                    
                    # Build course choices from COURSE_NAME_CHOICES
                    course_choices = [('', '--------')]
                    for cn_code, cn_name in Course.COURSE_NAME_CHOICES:
                        # Mark if this course already exists
                        if cn_name in existing_course_names:
                            course_choices.append((cn_name, f"{cn_name} (⚠ Already exists for this combination)"))
                        else:
                            course_choices.append((cn_name, cn_name))
                    
                    # Also add option to create custom course name
                    self.fields['course_name'].choices = course_choices
                    self.fields['course_name'].help_text = "Select a course name"
                    
                    # Make course_name a CharField with choices (not a foreign key)
                    self.fields['course_name'].widget = forms.Select(attrs={'class': 'form-control'})
                else:
                    self.fields['course_name'].choices = [('', '-- Select Degree Type First --')]
                    self.fields['course_name'].help_text = "Please select degree type first"
                    
            except College.DoesNotExist:
                pass
        else:
            # No college selected yet
            self.fields['category'].choices = [('', '-- Select College First --')]
            self.fields['degree_type'].choices = [('', '-- Select College First --')]
            self.fields['course_name'].choices = [('', '-- Select College First --')]
    
    def clean(self):
        cleaned_data = super().clean()
        college = cleaned_data.get('college')
        category = cleaned_data.get('category')
        degree_type = cleaned_data.get('degree_type')
        course_code = cleaned_data.get('course_code')
        course_name = cleaned_data.get('course_name')
        
        # Check for duplicate course (same college and course_code)
        if college and course_code:
            existing = Course.objects.filter(
                college=college,
                course_code=course_code
            ).exclude(pk=self.instance.pk if self.instance.pk else None)
            
            if existing.exists():
                raise forms.ValidationError(
                    f"A course with code '{course_code}' already exists for this college."
                )
        
        return cleaned_data


@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ('college_name', 'short_name', 'location_city', 'location_state', 
                    'courses_offered_summary', 'image_preview', 'has_gallery_badge', 'address')
    search_fields = ('college_name', 'short_name', 'location_city', 'location_state')
    list_filter = ('location_state',)
    readonly_fields = ('courses_offered_summary', 'total_courses_count', 
                      'sync_status', 'image_preview', 'gallery_preview', 'all_images_preview')
    
    actions = ['sync_categories_from_courses', 'bulk_add_engineering_category', 'clear_categories']
    
    # Custom widget for JSONField
    formfield_overrides = {
        models.JSONField: {'widget': AdminTextareaWidget(attrs={'rows': 5, 'cols': 80, 'style': 'font-family: monospace;'})},
    }
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('college_name', 'short_name')
        }),
        ('Images', {
            'fields': ('banner_image', 'image_preview', 'college_images', 'campus_images', 'gallery_preview', 'all_images_preview'),
            'description': mark_safe('''
                <div style="background: #e3f2fd; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                    <strong>🖼️ College Images Management:</strong><br>
                    • <strong>Banner Image:</strong> Single banner image URL for college page<br>
                    • <strong>College Images:</strong> JSON array of general college photos<br>
                    • <strong>Campus Images:</strong> JSON array of campus photos<br>
                    <br>
                    <strong>📝 JSON Format Example:</strong><br>
                    <code>["https://example.com/image1.jpg", "https://example.com/image2.jpg"]</code>
                </div>
            ''')
        }),
        ('Location', {
            'fields': ('location_city', 'location_state', 'location_pincode', 'address')
        }),
        ('Course Categories', {
            'fields': ('courses_offered', 'courses_offered_summary', 'total_courses_count', 'sync_status'),
            'description': mark_safe('''
                <div style="background: #e8f5e9; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                    <strong>📚 Course Categories Management:</strong><br>
                    • Select the categories of courses offered by this college<br>
                    • These categories help students filter colleges by course type<br>
                    • Categories can be automatically synced from detailed courses<br>
                    • Use the "Sync Categories from Courses" action below to auto-update
                </div>
            ''')
        })
    )
    
    # ==================== IMAGE PREVIEW METHODS ====================
    
    def image_preview(self, obj):
        """Preview for single banner image"""
        if obj.banner_image:
            return format_html('<img src="{}" width="200" style="max-height: 150px; object-fit: cover; border-radius: 4px;" />', obj.banner_image)
        return "No banner image"
    image_preview.short_description = "Banner Preview"
    
    def gallery_preview(self, obj):
        """Preview for first 3 images from college_images"""
        if obj.college_images and isinstance(obj.college_images, list) and len(obj.college_images) > 0:
            preview_html = '<div style="display: flex; gap: 5px; flex-wrap: wrap;">'
            for img_url in obj.college_images[:3]:
                preview_html += f'<img src="{img_url}" width="80" height="60" style="object-fit: cover; border-radius: 4px;" />'
            preview_html += '</div>'
            if len(obj.college_images) > 3:
                preview_html += f'<small>+{len(obj.college_images) - 3} more</small>'
            return mark_safe(preview_html)
        return "No gallery images"
    gallery_preview.short_description = "Gallery Preview"
    
    def all_images_preview(self, obj):
        """Preview for all images (college_images + campus_images combined)"""
        all_images = []
        if obj.college_images and isinstance(obj.college_images, list):
            all_images.extend(obj.college_images)
        if obj.campus_images and isinstance(obj.campus_images, list):
            all_images.extend(obj.campus_images)
        
        if all_images:
            preview_html = '<div style="display: flex; gap: 5px; flex-wrap: wrap;">'
            for img_url in all_images[:5]:
                preview_html += f'<img src="{img_url}" width="80" height="60" style="object-fit: cover; border-radius: 4px;" />'
            preview_html += '</div>'
            preview_html += f'<small>Total images: {len(all_images)}</small>'
            return mark_safe(preview_html)
        return "No images available"
    all_images_preview.short_description = "All Images Preview"
    
    def has_gallery_badge(self, obj):
        """Badge indicating if college has gallery images"""
        has_images = (obj.college_images and len(obj.college_images) > 0) or (obj.campus_images and len(obj.campus_images) > 0)
        if has_images:
            return mark_safe('<span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 12px;">📷 Has Gallery</span>')
        return mark_safe('<span style="background: #9E9E9E; color: white; padding: 2px 8px; border-radius: 12px;">No Gallery</span>')
    has_gallery_badge.short_description = "Gallery Status"
    
    def courses_offered_summary(self, obj):
        """Display courses offered as badges with category colors"""
        if obj.courses_offered and isinstance(obj.courses_offered, list) and len(obj.courses_offered) > 0:
            category_map = dict(College.COURSE_CATEGORY_CHOICES)
            color_map = {
                'engineering': '#2196F3',
                'arts_science': '#9C27B0',
                'polytechnic': '#FF9800',
                'allied_health_science': '#4CAF50',
                'medical': '#F44336',
                'law': '#3F51B5',
                'nursing': '#00BCD4',
                'management': '#FFC107',
                'computer_applications': '#607D8B',
                'pharmacy': '#795548',
                'agriculture': '#8BC34A',
                'physiotherapy': '#009688',
                'occupational_therapy': '#CDDC39',
                'architecture': '#FF5722',
                'education': '#9E9E9E',
                'physical_education': '#E91E63',
            }
            badges = []
            for category in obj.courses_offered[:5]:
                category_name = category_map.get(category, category.replace('_', ' ').title())
                color = color_map.get(category, '#666')
                badges.append(f'<span style="background:{color}; color:white; padding:2px 8px; margin:2px; border-radius:12px; display:inline-block; font-size:11px;">{category_name}</span>')
            if len(obj.courses_offered) > 5:
                badges.append(f'<span style="background:#666; color:white; padding:2px 8px; margin:2px; border-radius:12px; display:inline-block;">+{len(obj.courses_offered)-5}</span>')
            return mark_safe(' '.join(badges))
        return "No courses specified"
    courses_offered_summary.short_description = "Courses Offered"
    
    def total_courses_count(self, obj):
        """Display total number of detailed courses"""
        count = obj.courses.count()
        return format_html('<span style="background: #4CAF50; color: white; padding: 3px 10px; border-radius: 12px;">{} Courses</span>', count)
    total_courses_count.short_description = "Total Courses"
    
    # ==================== ADMIN ACTIONS ====================
    
    def sync_categories_from_courses(self, request, queryset):
        """Sync courses_offered field from related Course objects"""
        updated_count = 0
        for college in queryset:
            categories = college.courses.values_list('category', flat=True).distinct()
            college.courses_offered = list(categories)
            college.save()
            updated_count += 1
        self.message_user(request, f"Synced categories for {updated_count} college(s).")
    sync_categories_from_courses.short_description = "Sync categories from detailed courses"
    
    def bulk_add_engineering_category(self, request, queryset):
        """Bulk add Engineering category to selected colleges"""
        for college in queryset:
            if not college.courses_offered:
                college.courses_offered = []
            if 'engineering' not in college.courses_offered:
                college.courses_offered.append('engineering')
                college.save()
        self.message_user(request, f"Added Engineering category to {queryset.count()} college(s).")
    bulk_add_engineering_category.short_description = "Add Engineering category to selected"
    
    def clear_categories(self, request, queryset):
        """Clear all categories from selected colleges"""
        for college in queryset:
            college.courses_offered = []
            college.save()
        self.message_user(request, f"Cleared categories for {queryset.count()} college(s).")
    clear_categories.short_description = "Clear all categories from selected"
    
    def sync_status(self, obj):
        """Display sync status between courses_offered and related courses"""
        from_courses = set(obj.courses.values_list('category', flat=True).distinct())
        from_field = set(obj.courses_offered or [])
        
        if from_courses == from_field:
            return mark_safe('<span style="color: #4CAF50;">✓ Synced</span>')
        elif not from_field and from_courses:
            return mark_safe('<span style="color: #FF9800;">⚠ Needs sync</span>')
        else:
            return mark_safe('<span style="color: #F44336;">⚠ Out of sync</span>')
    sync_status.short_description = "Sync Status"


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    form = CourseForm
    list_display = ('course_code_display', 'course_name_short', 'college_link', 'category_badge', 'degree_type_badge', 'is_active', 'created_at')
    search_fields = ('course_code', 'course_name', 'college__college_name')
    list_filter = ('college', 'category', 'degree_type', 'is_active')
    readonly_fields = ('created_at', 'updated_at', 'category_badge', 'degree_type_badge')
    list_editable = ('is_active',)
    list_per_page = 25
    
    fieldsets = (
        ('College Selection', {
            'fields': ('college',),
            'description': 'Step 1: Select the college first. This will determine available categories.'
        }),
        ('Course Category', {
            'fields': ('category', 'category_badge'),
            'description': 'Step 2: Select the course category (based on college offering).'
        }),
        ('Degree Type', {
            'fields': ('degree_type', 'degree_type_badge'),
            'description': 'Step 3: Select the degree type (UG, PG, Diploma, etc.)'
        }),
        ('Course Information', {
            'fields': ('course_code', 'course_name'),
            'description': 'Step 4: Select course code and name.'
        }),
        ('Status', {
            'fields': ('is_active',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def course_code_display(self, obj):
        """Display course code with full name"""
        return format_html('<strong>{}</strong><br><small style="color: #666;">{}</small>', 
                          obj.course_code, 
                          obj.get_course_code_display())
    course_code_display.short_description = 'Course Code'
    
    def course_name_short(self, obj):
        """Truncate long course names"""
        if len(obj.course_name) > 50:
            return obj.course_name[:47] + '...'
        return obj.course_name
    course_name_short.short_description = 'Course Name'
    
    def college_link(self, obj):
        """Link to college in admin"""
        from django.urls import reverse
        url = reverse('admin:colleges_college_change', args=[obj.college.college_id])
        return format_html('<a href="{}">{}</a>', url, obj.college.college_name)
    college_link.short_description = 'College'
    college_link.admin_order_field = 'college__college_name'
    
    def category_badge(self, obj):
        """Display category as colored badge"""
        category_map = dict(College.COURSE_CATEGORY_CHOICES)
        category_name = category_map.get(obj.category, obj.category.replace('_', ' ').title())
        color_map = {
            'engineering': '#2196F3',
            'arts_science': '#9C27B0',
            'polytechnic': '#FF9800',
            'allied_health_science': '#4CAF50',
            'medical': '#F44336',
            'law': '#3F51B5',
            'nursing': '#00BCD4',
            'management': '#FFC107',
            'computer_applications': '#607D8B',
            'pharmacy': '#795548',
            'agriculture': '#8BC34A',
            'physiotherapy': '#009688',
            'occupational_therapy': '#CDDC39',
            'architecture': '#FF5722',
            'education': '#9E9E9E',
            'physical_education': '#E91E63',
        }
        color = color_map.get(obj.category, '#666')
        return mark_safe(f'<span style="background:{color}; color:white; padding:4px 12px; border-radius:20px; font-size:11px; display:inline-block;">{category_name}</span>')
    category_badge.short_description = 'Category'
    
    def degree_type_badge(self, obj):
        """Display degree type as colored badge"""
        degree_map = dict(Course.DEGREE_TYPE_CHOICES)
        degree_name = degree_map.get(obj.degree_type, obj.degree_type.upper())
        color_map = {
            'ug': '#4CAF50',
            'pg': '#FF9800',
            'diploma': '#2196F3',
            'phd': '#9C27B0',
            'integrated': '#F44336',
        }
        color = color_map.get(obj.degree_type, '#666')
        return mark_safe(f'<span style="background:{color}; color:white; padding:4px 12px; border-radius:20px; font-size:11px; display:inline-block;">{degree_name}</span>')
    degree_type_badge.short_description = 'Degree Type'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('college')
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if obj.college:
            obj.college.sync_courses_offered()
    
    class Media:
        js = ['admin/js/jquery.init.js']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone_number', 'city', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'phone_number', 'city')
    list_filter = ('gender', 'city')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('user', 'first_name', 'last_name', 'date_of_birth', 'gender')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone_number', 'whatsapp_number')
        }),
        ('Address', {
            'fields': ('address', 'city', 'pincode')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'), 
            'classes': ('collapse',)
        })
    )


class EnquiryFormAdminForm(forms.ModelForm):
    """Custom form for EnquiryForm admin with dynamic college filtering"""
    
    college = forms.ModelChoiceField(
        queryset=College.objects.all().order_by('college_name'),
        empty_label="-- Select College --",
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    
    class Meta:
        model = EnquiryForm
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


@admin.register(EnquiryForm)
class EnquiryFormAdmin(admin.ModelAdmin):
    form = EnquiryFormAdminForm
    list_display = ('application_id', 'first_name', 'last_name', 'email_id', 'mobile_number', 
                    'college', 'course_name', 'submitted_at')
    search_fields = ('application_id', 'first_name', 'last_name', 'email_id', 'mobile_number', 
                    'college__college_name', 'course_name')
    list_filter = ('college', 'gender', 'community')
    readonly_fields = ('application_id', 'submitted_at', 'updated_at')
    date_hierarchy = 'submitted_at'
    list_per_page = 25

    fieldsets = (
        ('Application Info', {
            'fields': ('application_id', 'user', 'college', 'course_name', 'department_name')
        }),
        ('Bio-data', {
            'fields': ('first_name', 'last_name', 'gender', 'date_of_birth', 'mobile_number',
                      'email_id', 'blood_group', 'community', 'aadhar_number')
        }),
        ("Parent's Details", {
            'fields': ('father_name', 'father_mobile', 'mother_name', 'mother_mobile')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'city', 'pincode')
        }),
        ('Education Details', {
            'fields': ('tenth_marks_percentage', 'twelfth_marks_percentage', 
                      'has_diploma', 'diploma_marks_percentage',
                      'has_ug', 'ug_marks_percentage')
        }),
        ('Document Uploads', {
            'fields': ('photo', 'aadhar_card'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'college')


# ==================== CUSTOM ADMIN SITE SETTINGS ====================
admin.site.site_header = "Vamshi EduCare Administration"
admin.site.site_title = "Vamshi EduCare Admin Portal"
admin.site.index_title = "Welcome to Vamshi EduCare Admin Dashboard"