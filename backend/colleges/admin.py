from django.contrib import admin
from django.db.models import Count, Q
from django.db import models  # Changed this line - import models from django.db, not django
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.contrib.admin.widgets import AdminTextareaWidget
from .models import College, Course, UserProfile, EnquiryForm


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
            for img_url in all_images[:5]:  # Show first 5 images
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
        """Display courses offered as badges"""
        if obj.courses_offered and isinstance(obj.courses_offered, list) and len(obj.courses_offered) > 0:
            category_map = dict(College.COURSE_CATEGORY_CHOICES)
            badges = []
            for category in obj.courses_offered[:5]:  # Show first 5 categories
                category_name = category_map.get(category, category)
                badges.append(f'<span style="background: #2196F3; color: white; padding: 2px 8px; margin: 2px; border-radius: 12px; display: inline-block; font-size: 11px;">{category_name}</span>')
            if len(obj.courses_offered) > 5:
                badges.append(f'<span style="background: #666; color: white; padding: 2px 8px; margin: 2px; border-radius: 12px; display: inline-block;">+{len(obj.courses_offered)-5}</span>')
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
    list_display = ('course_code', 'course_name', 'college', 'category_badge', 'degree_type', 'is_active', 'created_at')
    search_fields = ('course_code', 'course_name', 'college__college_name')
    list_filter = ('college', 'category', 'degree_type', 'is_active')
    readonly_fields = ('created_at', 'updated_at', 'category_badge')
    list_editable = ('is_active',)
    list_per_page = 25
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('college', 'course_code', 'course_name', 'category', 'category_badge', 'degree_type')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def category_badge(self, obj):
        """Display category as colored badge"""
        category_map = dict(College.COURSE_CATEGORY_CHOICES)
        category_name = category_map.get(obj.category, obj.category)
        color_map = {
            'engineering': '#2196F3',
            'medical': '#4CAF50',
            'arts_science': '#FF9800',
            'management': '#9C27B0',
            'law': '#F44336',
            'nursing': '#00BCD4',
            'pharmacy': '#795548',
            'education': '#607D8B',
            'polytechnic': '#3F51B5',
            'allied_science': '#009688'
        }
        color = color_map.get(obj.category, '#666')
        return mark_safe(f'<span style="background:{color}; color:white; padding:2px 8px; border-radius:12px; font-size:11px;">{category_name}</span>')
    category_badge.short_description = 'Category'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('college')
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if obj.college:
            obj.college.sync_courses_offered()


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


@admin.register(EnquiryForm)
class EnquiryFormAdmin(admin.ModelAdmin):
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