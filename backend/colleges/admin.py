from django.contrib import admin
from django.db.models import Count, Q
from django.db import models
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.contrib.admin.widgets import AdminTextareaWidget
from django import forms
from django.http import JsonResponse
from django.urls import path
from django.utils import timezone
from .models import College, Course, UserProfile, EnquiryForm


# ==================== AJAX VIEWS FOR DYNAMIC FILTERING ====================

@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ('college_name', 'short_name', 'location_city', 'location_state', 
                    'courses_offered_summary', 'image_preview', 'has_gallery_badge', 'address')
    search_fields = ('college_name', 'short_name', 'location_city', 'location_state')
    list_filter = ('location_state',)
    readonly_fields = ('courses_offered_summary', 'total_courses_count', 
                      'sync_status', 'image_preview', 'gallery_preview', 'all_images_preview')
    
    actions = ['sync_categories_from_courses', 'bulk_add_engineering_category', 'clear_categories']
    
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
        if obj.banner_image:
            return format_html('<img src="{}" width="200" style="max-height: 150px; object-fit: cover; border-radius: 4px;" />', obj.banner_image)
        return "No banner image"
    image_preview.short_description = "Banner Preview"
    
    def gallery_preview(self, obj):
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
        has_images = (obj.college_images and len(obj.college_images) > 0) or (obj.campus_images and len(obj.campus_images) > 0)
        if has_images:
            return mark_safe('<span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 12px;">📷 Has Gallery</span>')
        return mark_safe('<span style="background: #9E9E9E; color: white; padding: 2px 8px; border-radius: 12px;">No Gallery</span>')
    has_gallery_badge.short_description = "Gallery Status"
    
    def courses_offered_summary(self, obj):
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
        count = obj.courses.count()
        return format_html('<span style="background: #4CAF50; color: white; padding: 3px 10px; border-radius: 12px;">{} Courses</span>', count)
    total_courses_count.short_description = "Total Courses"
    
    # ==================== ADMIN ACTIONS ====================
    
    def sync_categories_from_courses(self, request, queryset):
        updated_count = 0
        for college in queryset:
            categories = college.courses.values_list('category', flat=True).distinct()
            college.courses_offered = list(categories)
            college.save()
            updated_count += 1
        self.message_user(request, f"Synced categories for {updated_count} college(s).")
    sync_categories_from_courses.short_description = "Sync categories from detailed courses"
    
    def bulk_add_engineering_category(self, request, queryset):
        for college in queryset:
            if not college.courses_offered:
                college.courses_offered = []
            if 'engineering' not in college.courses_offered:
                college.courses_offered.append('engineering')
                college.save()
        self.message_user(request, f"Added Engineering category to {queryset.count()} college(s).")
    bulk_add_engineering_category.short_description = "Add Engineering category to selected"
    
    def clear_categories(self, request, queryset):
        for college in queryset:
            college.courses_offered = []
            college.save()
        self.message_user(request, f"Cleared categories for {queryset.count()} college(s).")
    clear_categories.short_description = "Clear all categories from selected"
    
    def sync_status(self, obj):
        from_courses = set(obj.courses.values_list('category', flat=True).distinct())
        from_field = set(obj.courses_offered or [])
        
        if from_courses == from_field:
            return mark_safe('<span style="color: #4CAF50;">✓ Synced</span>')
        elif not from_field and from_courses:
            return mark_safe('<span style="color: #FF9800;">⚠ Needs sync</span>')
        else:
            return mark_safe('<span style="color: #F44336;">⚠ Out of sync</span>')
    sync_status.short_description = "Sync Status"


# ==================== COURSE ADMIN FORM WITH AJAX DYNAMIC FILTERING ====================
class CourseForm(forms.ModelForm):
    """Enhanced Course Form with AJAX-based dynamic filtering"""
    
    class Meta:
        model = Course
        fields = '__all__'
        widgets = {
            'college': forms.Select(attrs={
                'class': 'form-control',
                'id': 'id_college',
                'data-ajax-url': '/admin/colleges/course/load-categories/'
            }),
            'category': forms.Select(attrs={
                'class': 'form-control',
                'id': 'id_category',
                'disabled': 'disabled'
            }),
            'degree_type': forms.Select(attrs={
                'class': 'form-control',
                'id': 'id_degree_type',
                'disabled': 'disabled'
            }),
            'course_code': forms.Select(attrs={
                'class': 'form-control',
                'id': 'id_course_code',
                'disabled': 'disabled'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Make category, degree_type, and course_code not required initially
        self.fields['category'].required = False
        self.fields['degree_type'].required = False
        self.fields['course_code'].required = False

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    form = CourseForm
    list_display = ('course_code', 'course_name', 'college_link', 'category_badge', 'degree_type_badge', 'is_active', 'created_at')
    search_fields = ('course_code', 'course_name', 'college__college_name')
    list_filter = ('college', 'category', 'degree_type', 'is_active')
    readonly_fields = ('created_at', 'updated_at', 'category_badge', 'degree_type_badge')
    list_editable = ('is_active',)
    list_per_page = 25
    
    fieldsets = (
        ('Step 1: Select College', {
            'fields': ('college',),
            'description': mark_safe('<div style="background: #e3f2fd; padding: 10px; border-radius: 5px;"><strong>📌 Tip:</strong> Select a college first. Categories will load automatically.</div>')
        }),
        ('Step 2: Select Category', {
            'fields': ('category', 'category_badge'),
            'description': 'Categories offered by the selected college will appear here.'
        }),
        ('Step 3: Select Degree Type', {
            'fields': ('degree_type', 'degree_type_badge'),
            'description': 'Available degree types for the selected category.'
        }),
        ('Step 4: Select Course', {
            'fields': ('course_code', 'course_name'),
            'description': 'Available courses for the selected degree type.'
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
    
    def college_link(self, obj):
        from django.urls import reverse
        url = reverse('admin:colleges_college_change', args=[obj.college.college_id])
        return format_html('<a href="{}">{}</a>', url, obj.college.college_name)
    college_link.short_description = 'College'
    college_link.admin_order_field = 'college__college_name'
    
    def category_badge(self, obj):
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
        """Save model with duplicate checking (college, course_code, degree_type)"""
        try:
            # Check if course already exists for this college with same course_code AND degree_type
            existing = Course.objects.filter(
                college=obj.college,
                course_code=obj.course_code,
                degree_type=obj.degree_type  # Check degree_type as well
            ).exclude(pk=obj.pk if obj.pk else None).first()
            
            if existing:
                error_msg = (
                    f'❌ Duplicate Course!\n\n'
                    f'Course "{obj.course_code}" with degree type "{obj.get_degree_type_display()}" '
                    f'already exists for college "{obj.college.college_name}".\n\n'
                    f'Existing Course:\n'
                    f'  • Course Name: {existing.course_name}\n'
                    f'  • Degree Type: {existing.get_degree_type_display()}\n'
                    f'  • Category: {existing.get_category_display()}'
                )
                self.message_user(request, error_msg, level='ERROR')
                return
            
            # Also check for same course with different degree type (warning only)
            same_course_diff_degree = Course.objects.filter(
                college=obj.college,
                course_code=obj.course_code
            ).exclude(degree_type=obj.degree_type).exclude(pk=obj.pk if obj.pk else None).first()
            
            if same_course_diff_degree:
                warning_msg = (
                    f'⚠️ Warning: Course "{obj.course_code}" exists for this college '
                    f'with a DIFFERENT degree type ({same_course_diff_degree.get_degree_type_display()}). '
                    f'Are you sure you want to add it as {obj.get_degree_type_display()}?'
                )
                self.message_user(request, warning_msg, level='WARNING')
            
            super().save_model(request, obj, form, change)
            
            if obj.college:
                obj.college.sync_courses_offered()
                
            if not change:
                self.message_user(request, f'✅ Course "{obj.course_code}" ({obj.get_degree_type_display()}) added successfully!', level='SUCCESS')
                
        except Exception as e:
            self.message_user(request, f'❌ Error saving course: {str(e)}', level='ERROR')
    
    # Custom actions
    actions = ['find_duplicate_courses', 'export_courses_csv', 'merge_duplicate_courses']
    
    def find_duplicate_courses(self, request, queryset):
        """Find duplicate courses (same college, course_code, degree_type)"""
        from collections import defaultdict
        
        duplicates = defaultdict(list)
        
        for course in queryset:
            key = (course.college_id, course.course_code, course.degree_type)
            duplicates[key].append(course)
        
        duplicate_count = 0
        duplicate_list = []
        
        for key, courses in duplicates.items():
            if len(courses) > 1:
                duplicate_count += len(courses) - 1
                college_name = courses[0].college.college_name
                course_code = courses[0].course_code
                degree_type = courses[0].get_degree_type_display()
                duplicate_list.append(f'• {college_name}: {course_code} ({degree_type}) - {len(courses)} copies')
        
        if duplicate_list:
            message = f'Found {duplicate_count} duplicate(s):\n' + '\n'.join(duplicate_list)
            self.message_user(request, message, level='WARNING')
        else:
            self.message_user(request, 'No duplicate courses found in selection.', level='SUCCESS')
    find_duplicate_courses.short_description = "Find duplicate courses (college + code + degree)"
    
    def merge_duplicate_courses(self, request, queryset):
        """Merge duplicate courses (keep first, delete others)"""
        from collections import defaultdict
        from django.db import transaction
        
        duplicates = defaultdict(list)
        
        for course in queryset:
            key = (course.college_id, course.course_code, course.degree_type)
            duplicates[key].append(course)
        
        merged_count = 0
        deleted_count = 0
        
        with transaction.atomic():
            for key, courses in duplicates.items():
                if len(courses) > 1:
                    # Keep the first one, delete the rest
                    keep = courses[0]
                    for delete_course in courses[1:]:
                        delete_course.delete()
                        deleted_count += 1
                    merged_count += 1
        
        self.message_user(
            request,
            f'✅ Merged {merged_count} duplicate groups. Deleted {deleted_count} duplicate courses.',
            level='SUCCESS'
        )
    merge_duplicate_courses.short_description = "Merge duplicate courses (keep first)"
    
    def export_courses_csv(self, request, queryset):
        """Export selected courses to CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="courses_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['College', 'Course Code', 'Course Name', 'Category', 'Degree Type', 'Status'])
        
        for course in queryset:
            writer.writerow([
                course.college.college_name,
                course.course_code,
                course.course_name,
                course.get_category_display(),
                course.get_degree_type_display(),
                'Active' if course.is_active else 'Inactive'
            ])
        
        self.message_user(request, f'Exported {queryset.count()} courses to CSV.', level='SUCCESS')
        return response
    export_courses_csv.short_description = "Export selected courses to CSV"
    
    # ==================== AJAX ENDPOINTS ====================
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('load-categories/', self.load_categories, name='load_categories'),
            path('load-degree-types/', self.load_degree_types, name='load_degree_types'),
            path('load-courses/', self.load_courses, name='load_courses'),
            path('check-duplicate/', self.check_duplicate, name='check_duplicate'),
            path('check-full-duplicate/', self.check_full_duplicate, name='check_full_duplicate'),
        ]
        return custom_urls + urls
    
    def check_duplicate(self, request):
        """AJAX endpoint to check if course already exists (college + course_code only)"""
        college_id = request.GET.get('college_id')
        course_code = request.GET.get('course_code')
        
        if college_id and course_code:
            exists = Course.objects.filter(
                college_id=college_id,
                course_code=course_code
            ).exists()
            
            if exists:
                # Get details of existing courses
                existing_courses = Course.objects.filter(
                    college_id=college_id,
                    course_code=course_code
                ).values('degree_type', 'course_name')
                
                degree_types = [c['degree_type'] for c in existing_courses]
                degree_names = [dict(Course.DEGREE_TYPE_CHOICES).get(dt, dt) for dt in degree_types]
                
                return JsonResponse({
                    'exists': exists,
                    'message': f'Course already exists for this college! Existing degree types: {", ".join(degree_names)}',
                    'existing_degrees': degree_names
                })
            else:
                return JsonResponse({
                    'exists': False,
                    'message': 'Course code available'
                })
        return JsonResponse({'exists': False})
    
    def check_full_duplicate(self, request):
        """AJAX endpoint to check exact duplicate (college + course_code + degree_type)"""
        college_id = request.GET.get('college_id')
        course_code = request.GET.get('course_code')
        degree_type = request.GET.get('degree_type')
        
        if college_id and course_code and degree_type:
            exists = Course.objects.filter(
                college_id=college_id,
                course_code=course_code,
                degree_type=degree_type
            ).exists()
            
            if exists:
                course = Course.objects.filter(
                    college_id=college_id,
                    course_code=course_code,
                    degree_type=degree_type
                ).first()
                
                return JsonResponse({
                    'exists': exists,
                    'message': f'❌ EXACT DUPLICATE: Course "{course_code}" with degree type "{course.get_degree_type_display()}" already exists!',
                    'existing_course': {
                        'name': course.course_name,
                        'degree': course.get_degree_type_display(),
                        'category': course.get_category_display()
                    }
                })
            else:
                # Check if same course exists with different degree type
                same_course = Course.objects.filter(
                    college_id=college_id,
                    course_code=course_code
                ).exclude(degree_type=degree_type).first()
                
                if same_course:
                    return JsonResponse({
                        'exists': False,
                        'warning': True,
                        'message': f'⚠️ Course "{course_code}" exists with DIFFERENT degree type ({same_course.get_degree_type_display()}). You can add it as {dict(Course.DEGREE_TYPE_CHOICES).get(degree_type, degree_type)}.',
                        'existing_degree': same_course.get_degree_type_display()
                    })
                else:
                    return JsonResponse({
                        'exists': False,
                        'warning': False,
                        'message': '✓ Course code available for this degree type'
                    })
        return JsonResponse({'exists': False, 'warning': False})
    
    def load_categories(self, request):
        """AJAX endpoint to load categories based on selected college"""
        college_id = request.GET.get('college_id')
        if college_id:
            try:
                college = College.objects.get(pk=college_id)
                offered_categories = college.courses_offered or []
                
                categories = []
                for cat_code in offered_categories:
                    cat_name = dict(College.COURSE_CATEGORY_CHOICES).get(cat_code, cat_code)
                    categories.append({
                        'value': cat_code,
                        'display': cat_name
                    })
                
                return JsonResponse({
                    'success': True,
                    'categories': categories,
                    'has_categories': len(categories) > 0
                })
            except College.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'College not found'})
        return JsonResponse({'success': False, 'error': 'No college selected'})
    
    def load_degree_types(self, request):
        """AJAX endpoint to load degree types based on college and category"""
        college_id = request.GET.get('college_id')
        category = request.GET.get('category')
        
        if college_id and category:
            degree_types = Course.objects.filter(
                college_id=college_id,
                category=category,
                is_active=True
            ).values_list('degree_type', flat=True).distinct()
            
            degree_list = []
            for dt_code in Course.DEGREE_TYPE_CHOICES:
                degree_list.append({
                    'value': dt_code[0],
                    'display': dt_code[1],
                    'has_existing': dt_code[0] in degree_types
                })
            
            return JsonResponse({
                'success': True,
                'degree_types': degree_list
            })
        return JsonResponse({'success': False, 'error': 'Missing parameters'})
    
    def load_courses(self, request):
        """AJAX endpoint to load courses based on college, category, and degree type"""
        college_id = request.GET.get('college_id')
        category = request.GET.get('category')
        degree_type = request.GET.get('degree_type')
        
        if college_id and category and degree_type:
            # Get existing courses with exact match
            existing_courses = Course.objects.filter(
                college_id=college_id,
                category=category,
                degree_type=degree_type
            ).values_list('course_code', flat=True)
            
            # Get all available courses for this category
            category_courses = self.get_courses_for_category(category)
            
            courses = []
            for course_code, course_name in category_courses:
                courses.append({
                    'value': course_code,
                    'display': course_name,
                    'exists': course_code in existing_courses
                })
            
            return JsonResponse({
                'success': True,
                'courses': courses
            })
        return JsonResponse({'success': False, 'error': 'Missing parameters'})
    
    def get_courses_for_category(self, category):
        """Helper method to get courses based on category"""
        category_course_mapping = {
            'engineering': Course.ENGINEERING_COURSE_CHOICES,
            'arts_science': Course.ARTS_SCIENCE_COURSE_CHOICES,
            'allied_health_science': Course.ALLIED_HEALTH_COURSE_CHOICES,
            'pharmacy': Course.PHARMACY_COURSE_CHOICES,
            'nursing': Course.NURSING_COURSE_CHOICES,
            'physiotherapy': Course.PHYSIOTHERAPY_COURSE_CHOICES,
            'occupational_therapy': Course.OCCUPATIONAL_THERAPY_COURSE_CHOICES,
            'agriculture': Course.AGRICULTURE_COURSE_CHOICES,
            'architecture': Course.ARCHITECTURE_COURSE_CHOICES,
            'law': Course.LAW_COURSE_CHOICES,
            'management': Course.MANAGEMENT_COURSE_CHOICES,
            'computer_applications': Course.COMPUTER_APPLICATIONS_COURSE_CHOICES,
            'polytechnic': Course.POLYTECHNIC_COURSE_CHOICES,
            'education': Course.EDUCATION_COURSE_CHOICES,
        }
        return category_course_mapping.get(category, [])
    
    class Media:
        js = ['admin/js/jquery.init.js', 'admin/js/course_admin.js']
        css = {
            'all': ['admin/css/course_admin.css']
        }
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
    list_display = ('application_id', 'user_status', 'first_name', 'last_name', 'email_id', 'mobile_number', 
                    'college', 'course_name', 'reference_name', 'submitted_at')
    search_fields = ('application_id', 'first_name', 'last_name', 'email_id', 'mobile_number', 
                    'college__college_name', 'course_name', 'reference_name')
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
        ('Reference Information', {
            'fields': ('reference_name',),
            'classes': ('collapse',),
            'description': 'Name of the person who referred this student (optional)'
        }),
        ('Selection Path (Optional)', {
            'fields': ('selected_course', 'selected_category', 'selected_degree_type'),
            'classes': ('collapse',),
            'description': 'These fields are auto-populated when a course is selected'
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
    
    actions = ['export_as_csv', 'mark_as_has_diploma', 'clear_user_association']
    
    def export_as_csv(self, request, queryset):
        """Export selected applications as CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="applications.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Application ID', 'Name', 'Email', 'Mobile', 'College', 'Course', 
            'Submitted Date', '10th %', '12th %', 'Community', 'City', 'User Type', 'Referred By'
        ])
        
        for obj in queryset:
            writer.writerow([
                obj.application_id,
                f"{obj.first_name} {obj.last_name}",
                obj.email_id,
                obj.mobile_number,
                obj.college.college_name if obj.college else 'N/A',
                obj.course_name,
                obj.submitted_at.strftime('%Y-%m-%d %H:%M'),
                obj.tenth_marks_percentage or 'N/A',
                obj.twelfth_marks_percentage or 'N/A',
                obj.community or 'N/A',
                obj.city or 'N/A',
                'Registered' if obj.user else 'Guest',
                obj.reference_name or 'N/A'
            ])
        
        self.message_user(request, f"Exported {queryset.count()} applications to CSV.")
        return response
    
    export_as_csv.short_description = "Export selected applications to CSV"
    
    def mark_as_has_diploma(self, request, queryset):
        """Bulk mark applications as having diploma"""
        updated = queryset.update(has_diploma=True)
        self.message_user(request, f"Marked {updated} application(s) as having diploma.")
    mark_as_has_diploma.short_description = "Mark as has diploma"
    
    def clear_user_association(self, request, queryset):
        """Bulk remove user association (set user to NULL)"""
        updated = queryset.update(user=None)
        self.message_user(request, f"Removed user association from {updated} application(s).")
    clear_user_association.short_description = "Clear user association"
    
    def save_model(self, request, obj, form, change):
        """Handle saving with optional user field"""
        if not obj.user_id:
            obj.user = None
        super().save_model(request, obj, form, change)
    
    # FIXED: Use mark_safe instead of format_html
    def user_status(self, obj):
        """Display user status with proper formatting"""
        if obj and obj.user:
            return mark_safe(
                '<span style="background: #4CAF50; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px;">✓ Registered</span>'
            )
        elif obj and not obj.user:
            return mark_safe(
                '<span style="background: #9E9E9E; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px;">👤 Guest</span>'
            )
        return mark_safe('<span style="background: #FF9800; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px;">-</span>')
    user_status.short_description = "User Type"

# Optional: Add inline for User to show their applications
class UserEnquiryInline(admin.TabularInline):
    """Inline display of user's applications in User admin"""
    model = EnquiryForm
    fields = ('application_id', 'college', 'course_name', 'reference_name', 'submitted_at')
    readonly_fields = ('application_id', 'college', 'course_name', 'reference_name', 'submitted_at')
    extra = 0
    can_delete = False
    show_change_link = True
    
    def has_add_permission(self, request, obj=None):
        return False


# Uncomment below to add inline to User admin
# from django.contrib.auth.admin import UserAdmin
# 
# class CustomUserAdmin(UserAdmin):
#     inlines = [UserEnquiryInline]
# 
# admin.site.unregister(User)
# admin.site.register(User, CustomUserAdmin)


# ==================== CUSTOM ADMIN SITE SETTINGS ====================
admin.site.site_header = "Vamshi EduCare Administration"
admin.site.site_title = "Vamshi EduCare Admin Portal"
admin.site.index_title = "Welcome to Vamshi EduCare Admin Dashboard"