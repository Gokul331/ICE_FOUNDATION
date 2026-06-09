from django.contrib import admin
from django.db.models import Count, Q
from django.db import models
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.contrib.admin.widgets import AdminTextareaWidget
from django import forms
from django.http import JsonResponse
from django.urls import path
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
        super().save_model(request, obj, form, change)
        if obj.college:
            obj.college.sync_courses_offered()
    
    # ==================== AJAX ENDPOINTS ====================
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('load-categories/', self.load_categories, name='load_categories'),
            path('load-degree-types/', self.load_degree_types, name='load_degree_types'),
            path('load-courses/', self.load_courses, name='load_courses'),
        ]
        return custom_urls + urls
    
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
                if dt_code[0] in degree_types or True:  # Show all degree types
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
            # Get existing courses
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


# ==================== CUSTOM CSS FOR COURSE ADMIN ====================
# Create a file at: static/admin/css/course_admin.css
"""
.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.field-category .help, 
.field-degree_type .help,
.field-course_code .help {
    color: #666;
    font-size: 12px;
    margin-top: 5px;
}

.field-category select:disabled,
.field-degree_type select:disabled,
.field-course_code select:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
}

.form-row {
    margin-bottom: 15px;
    padding: 10px;
    border-bottom: 1px solid #eee;
}

.form-row:last-child {
    border-bottom: none;
}
"""

# ==================== JAVASCRIPT FOR COURSE ADMIN ====================
# Create a file at: static/admin/js/course_admin.js
"""
(function($) {
    'use strict';
    
    // Wait for the DOM to be ready
    $(document).ready(function() {
        var collegeSelect = $('#id_college');
        var categorySelect = $('#id_category');
        var degreeTypeSelect = $('#id_degree_type');
        var courseCodeSelect = $('#id_course_code');
        var loadingSpinner = null;
        
        // Create loading spinner
        function showLoading(selectElement) {
            var spinner = $('<span class="loading-spinner"></span>');
            selectElement.after(spinner);
            selectElement.prop('disabled', true);
            return spinner;
        }
        
        function hideLoading(spinner, selectElement) {
            if (spinner) spinner.remove();
            selectElement.prop('disabled', false);
        }
        
        // Load categories when college changes
        function loadCategories() {
            var collegeId = collegeSelect.val();
            
            if (!collegeId) {
                categorySelect.empty().append('<option value="">-- Select College First --</option>');
                categorySelect.prop('disabled', true);
                degreeTypeSelect.empty().append('<option value="">-- Select Category First --</option>');
                degreeTypeSelect.prop('disabled', true);
                courseCodeSelect.empty().append('<option value="">-- Select Degree Type First --</option>');
                courseCodeSelect.prop('disabled', true);
                return;
            }
            
            var spinner = showLoading(categorySelect);
            
            $.ajax({
                url: '/admin/colleges/course/load-categories/',
                data: { college_id: collegeId },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        categorySelect.empty();
                        categorySelect.append('<option value="">-- Select Category --</option>');
                        
                        $.each(response.categories, function(i, category) {
                            categorySelect.append(
                                $('<option></option>').val(category.value).html(category.display)
                            );
                        });
                        
                        categorySelect.prop('disabled', false);
                        categorySelect.trigger('change');
                        
                        // Show help text
                        if (response.has_categories) {
                            categorySelect.closest('.form-row').find('.help').remove();
                            categorySelect.after('<div class="help">✓ Categories loaded successfully. Select a category to continue.</div>');
                        } else {
                            categorySelect.after('<div class="help">⚠ No categories found for this college. Please add categories in the College admin.</div>');
                        }
                    } else {
                        categorySelect.empty().append('<option value="">-- Error loading categories --</option>');
                        categorySelect.prop('disabled', true);
                    }
                    hideLoading(spinner, categorySelect);
                },
                error: function() {
                    categorySelect.empty().append('<option value="">-- Error loading categories --</option>');
                    categorySelect.prop('disabled', true);
                    hideLoading(spinner, categorySelect);
                }
            });
        }
        
        // Load degree types when category changes
        function loadDegreeTypes() {
            var collegeId = collegeSelect.val();
            var category = categorySelect.val();
            
            if (!collegeId || !category) {
                degreeTypeSelect.empty().append('<option value="">-- Select Category First --</option>');
                degreeTypeSelect.prop('disabled', true);
                courseCodeSelect.empty().append('<option value="">-- Select Degree Type First --</option>');
                courseCodeSelect.prop('disabled', true);
                return;
            }
            
            var spinner = showLoading(degreeTypeSelect);
            
            $.ajax({
                url: '/admin/colleges/course/load-degree-types/',
                data: { 
                    college_id: collegeId,
                    category: category
                },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        degreeTypeSelect.empty();
                        degreeTypeSelect.append('<option value="">-- Select Degree Type --</option>');
                        
                        $.each(response.degree_types, function(i, degreeType) {
                            var optionText = degreeType.display;
                            if (degreeType.has_existing) {
                                optionText += ' ✓ (exists)';
                            }
                            degreeTypeSelect.append(
                                $('<option></option>').val(degreeType.value).html(optionText)
                            );
                        });
                        
                        degreeTypeSelect.prop('disabled', false);
                        degreeTypeSelect.trigger('change');
                        
                        degreeTypeSelect.closest('.form-row').find('.help').remove();
                        degreeTypeSelect.after('<div class="help">✓ Select the degree type for this course.</div>');
                    } else {
                        degreeTypeSelect.empty().append('<option value="">-- Error loading degree types --</option>');
                        degreeTypeSelect.prop('disabled', true);
                    }
                    hideLoading(spinner, degreeTypeSelect);
                },
                error: function() {
                    degreeTypeSelect.empty().append('<option value="">-- Error loading degree types --</option>');
                    degreeTypeSelect.prop('disabled', true);
                    hideLoading(spinner, degreeTypeSelect);
                }
            });
        }
        
        // Load courses when degree type changes
        function loadCourses() {
            var collegeId = collegeSelect.val();
            var category = categorySelect.val();
            var degreeType = degreeTypeSelect.val();
            
            if (!collegeId || !category || !degreeType) {
                courseCodeSelect.empty().append('<option value="">-- Select Degree Type First --</option>');
                courseCodeSelect.prop('disabled', true);
                return;
            }
            
            var spinner = showLoading(courseCodeSelect);
            
            $.ajax({
                url: '/admin/colleges/course/load-courses/',
                data: {
                    college_id: collegeId,
                    category: category,
                    degree_type: degreeType
                },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        courseCodeSelect.empty();
                        courseCodeSelect.append('<option value="">-- Select Course --</option>');
                        
                        var hasAvailableCourses = false;
                        $.each(response.courses, function(i, course) {
                            if (!course.exists) {
                                hasAvailableCourses = true;
                                courseCodeSelect.append(
                                    $('<option></option>').val(course.value).html(course.display)
                                );
                            }
                        });
                        
                        if (!hasAvailableCourses) {
                            courseCodeSelect.append('<option value="">-- No new courses available for this combination --</option>');
                            courseCodeSelect.prop('disabled', true);
                            courseCodeSelect.closest('.form-row').find('.help').remove();
                            courseCodeSelect.after('<div class="help">⚠ All courses for this combination already exist.</div>');
                        } else {
                            courseCodeSelect.prop('disabled', false);
                            courseCodeSelect.closest('.form-row').find('.help').remove();
                            courseCodeSelect.after('<div class="help">✓ Select a course from the list above.</div>');
                        }
                    } else {
                        courseCodeSelect.empty().append('<option value="">-- Error loading courses --</option>');
                        courseCodeSelect.prop('disabled', true);
                    }
                    hideLoading(spinner, courseCodeSelect);
                },
                error: function() {
                    courseCodeSelect.empty().append('<option value="">-- Error loading courses --</option>');
                    courseCodeSelect.prop('disabled', true);
                    hideLoading(spinner, courseCodeSelect);
                }
            });
        }
        
        // Attach event handlers
        collegeSelect.on('change', loadCategories);
        categorySelect.on('change', loadDegreeTypes);
        degreeTypeSelect.on('change', loadCourses);
        
        // If editing an existing course, trigger initial load
        if (collegeSelect.val()) {
            loadCategories();
        }
    });
})(django.jQuery);
"""


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

# ==================== CUSTOM ADMIN SITE SETTINGS ====================
admin.site.site_header = "Vamshi EduCare Administration"
admin.site.site_title = "Vamshi EduCare Admin Portal"
admin.site.index_title = "Welcome to Vamshi EduCare Admin Dashboard"