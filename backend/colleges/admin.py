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
    
    def image_preview(self, obj):
        """Display image preview in admin list"""
        if obj.banner_image:
            return mark_safe(f'<img src="{obj.banner_image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" />')
        elif obj.college_images and len(obj.college_images) > 0:
            return mark_safe(f'<img src="{obj.college_images[0]}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" />')
        elif obj.campus_images and len(obj.campus_images) > 0:
            return mark_safe(f'<img src="{obj.campus_images[0]}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" />')
        return mark_safe('<span style="color: #999;">No image</span>')
    image_preview.short_description = 'Preview'
    
    def gallery_preview(self, obj):
        """Display gallery preview in admin detail"""
        total_images = len(obj.all_images)
        if total_images == 0:
            return mark_safe('<span style="color: #999;">No gallery images</span>')
        
        output = f'<div><strong>Total Images: {total_images}</strong></div>'
        output += '<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">'
        
        # Show first 6 images as thumbnails
        for img in obj.all_images[:6]:
            output += f'<img src="{img}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" />'
        
        if total_images > 6:
            output += f'<div style="width: 80px; height: 80px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">+{total_images - 6}</div>'
        
        output += '</div>'
        return mark_safe(output)
    gallery_preview.short_description = 'Gallery Preview'
    
    def all_images_preview(self, obj):
        """Display all images by category"""
        output = '<div style="background: #f8fafc; padding: 12px; border-radius: 6px;">'
        
        # College Images
        if obj.college_images:
            output += '<strong>📸 College Images:</strong><br>'
            output += '<div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0 20px 0;">'
            for img in obj.college_images[:4]:
                output += f'<img src="{img}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" />'
            if len(obj.college_images) > 4:
                output += f'<div style="width: 100px; height: 100px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">+{len(obj.college_images) - 4}</div>'
            output += '</div>'
        
        # Campus Images
        if obj.campus_images:
            output += '<strong>🏫 Campus Images:</strong><br>'
            output += '<div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0 20px 0;">'
            for img in obj.campus_images[:4]:
                output += f'<img src="{img}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" />'
            if len(obj.campus_images) > 4:
                output += f'<div style="width: 100px; height: 100px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">+{len(obj.campus_images) - 4}</div>'
            output += '</div>'
        
        if not obj.college_images and not obj.campus_images:
            output += '<span style="color: #999;">No images uploaded</span>'
        
        output += '</div>'
        return mark_safe(output)
    all_images_preview.short_description = 'All Images Preview'
    
    def has_gallery_badge(self, obj):
        """Display badge if college has gallery images"""
        if obj.has_gallery:
            return mark_safe('<span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">✓ Has Gallery</span>')
        return mark_safe('<span style="background: #999; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">No Gallery</span>')
    has_gallery_badge.short_description = 'Gallery Status'
    
    def courses_offered_summary(self, obj):
        """Display course categories as colored badges"""
        if not obj.courses_offered:
            return mark_safe('<span style="color: #999;">No categories selected</span>')
        
        badges = []
        category_map = dict(College.COURSE_CATEGORY_CHOICES)
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
        
        for category in obj.courses_offered:
            category_name = category_map.get(category, category)
            color = color_map.get(category, '#666')
            badge_html = f'<span style="background:{color}; color:white; padding:2px 8px; border-radius:12px; margin:2px; font-size:11px; display:inline-block;">{category_name}</span>'
            badges.append(badge_html)
        
        return mark_safe(' '.join(badges))
    courses_offered_summary.short_description = 'Course Categories'
    
    def total_courses_count(self, obj):
        """Display total number of active courses"""
        count = obj.courses.filter(is_active=True).count()
        if count == 0:
            return "0 active courses"
        courses_url = f"/admin/colleges/course/?college__id__exact={obj.college_id}"
        return format_html('<a href="{}">{} active courses</a>', courses_url, count)
    total_courses_count.short_description = 'Total Courses'
    
    def sync_status(self, obj):
        """Show if categories are synced with actual courses"""
        if not obj.courses.exists():
            return mark_safe('<span style="color: #999;">No courses available</span>')
        
        try:
            actual_categories = set(obj.courses.filter(is_active=True).values_list('category', flat=True).distinct())
            current_categories = set(obj.courses_offered if obj.courses_offered else [])
            
            if actual_categories == current_categories:
                return mark_safe('<span style="color: #4CAF50;">✓ Synced</span>')
            else:
                return mark_safe('<span style="color: #FF9800;">⚠ Out of sync (Run sync action)</span>')
        except Exception:
            return mark_safe('<span style="color: #FF9800;">⚠ Category field missing in Course model</span>')
    sync_status.short_description = 'Sync Status'
    
    def sync_categories_from_courses(self, request, queryset):
        """Admin action to sync categories from courses"""
        updated_count = 0
        errors = 0
        
        for college in queryset:
            try:
                if not hasattr(college, 'courses'):
                    continue
                    
                actual_categories = set(college.courses.filter(is_active=True).values_list('category', flat=True).distinct())
                current_categories = set(college.courses_offered if college.courses_offered else [])
                
                if current_categories != actual_categories:
                    college.courses_offered = list(actual_categories)
                    college.save(update_fields=['courses_offered'])
                    updated_count += 1
            except Exception as e:
                errors += 1
                self.message_user(request, f'Error syncing {college.college_name}: {str(e)}', level='ERROR')
        
        self.message_user(request, f'Synced {updated_count} colleges successfully. Errors: {errors}')
    sync_categories_from_courses.short_description = 'Sync categories from actual courses'
    
    def bulk_add_engineering_category(self, request, queryset):
        """Admin action to add engineering category to selected colleges"""
        updated_count = 0
        for college in queryset:
            categories = list(college.courses_offered) if college.courses_offered else []
            if 'engineering' not in categories:
                categories.append('engineering')
                college.courses_offered = categories
                college.save(update_fields=['courses_offered'])
                updated_count += 1
        self.message_user(request, f'Added Engineering category to {updated_count} colleges.')
    bulk_add_engineering_category.short_description = 'Add "Engineering" category'
    
    def clear_categories(self, request, queryset):
        """Admin action to clear all categories"""
        for college in queryset:
            college.courses_offered = []
            college.save(update_fields=['courses_offered'])
        self.message_user(request, f'Cleared categories for {queryset.count()} colleges.')
    clear_categories.short_description = 'Clear all categories'
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('courses')


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_code', 'course_name', 'college', 'category_badge', 'degree_type', 'is_active')
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
        # Trigger sync on college after saving course
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