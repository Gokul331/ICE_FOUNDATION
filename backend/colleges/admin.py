from django.contrib import admin
from django.db.models import Count, Q
from django.utils.html import format_html
from .models import College, Course, UserProfile, EnquiryForm
from django.utils.safestring import mark_safe


@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ('college_name', 'short_name', 'location_city', 'location_state', 
                    'courses_offered_summary', 'image_preview', 'has_gallery_badge', 'address')
    search_fields = ('college_name', 'short_name', 'location_city', 'location_state')
    list_filter = ('location_state',)
    readonly_fields = ('courses_offered_summary', 'total_courses_count', 
                      'sync_status', 'image_preview', 'gallery_preview', 'all_images_preview')
    
    actions = ['sync_categories_from_courses', 'bulk_add_engineering_category', 'clear_categories']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('college_name', 'short_name')
        }),
        ('Images', {
            'fields': ('banner_image', 'image_preview', 'college_images', 'campus_images', 'gallery_preview'),
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
    
    # ... rest of the methods (image_preview, gallery_preview, etc.) remain the same ...


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