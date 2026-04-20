from django.contrib import admin
from .models import College, Course, UserProfile, Company, TeamMember, TimelineEvent


from django.contrib import admin
from .models import College

@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = (
        'college_name',
        'short_name',
        'counselling_code',
        'location_city',
        'location_state',
        'type',
        'affiliation',
        'naac_grade',
        'nirf_rank',
        'placement_percentage',
        'median_salary',
        'hostel_available',
        'created_at'
    )
    
    search_fields = (
        'college_name',
        'short_name',
        'counselling_code',
        'location_city',
        'location_state',
        'type',
        'affiliation',
        'naac_grade'
    )
    
    list_filter = (
        'location_state',
        'type',
        'affiliation',
        'naac_grade',
        'hostel_available',
        'established_year'
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('college_name', 'short_name', 'counselling_code', 'logo_url', 'type', 'affiliation')
        }),
        ('Location', {
            'fields': ('location_city', 'location_state', 'location_pincode', 'address')
        }),
        ('Campus Details', {
            'fields': ('established_year', 'total_campus_area', 'hostel_available')
        }),
        ('Rankings & Accreditation', {
            'fields': ('naac_grade', 'nirf_rank')
        }),
        ('Placement', {
            'fields': ('placement_percentage', 'median_salary', 'highest_salary', 'avg_salary')
        }),
        ('Contact & Web', {
            'fields': ('website_url', 'email_domain', 'contact_phone')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def __str__(self):
        return self.college_name

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'college', 'stream', 'cutoff_oc', 'cutoff_bc', 'cutoff_sc', 'intake', 'fees', 'created_at')
    search_fields = ('name', 'college__name')
    list_filter = ('college__state', 'stream')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'gender', 'community', 'cutoff_mark', 'preferred_district', 'preferred_stream', 'created_at')
    search_fields = ('user__username', 'user__email', 'community', 'preferred_district')
    list_filter = ('gender', 'community', 'preferred_stream')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'website', 'created_at')
    search_fields = ('name', 'industry')
    list_filter = ('industry',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'designation', 'is_active', 'joined_at')
    search_fields = ('user__username', 'user__email', 'designation')
    list_filter = ('role', 'is_active')
    readonly_fields = ('joined_at',)


@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'college', 'company', 'start_date', 'end_date', 'is_active', 'created_at')
    search_fields = ('title', 'description', 'college__name', 'company__name')
    list_filter = ('event_type', 'is_active', 'college__state')
    readonly_fields = ('created_at', 'updated_at')
