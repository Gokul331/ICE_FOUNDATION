from django.contrib import admin
from .models import College, Course, Fees, UserProfile, TeamMember, TimelineEvent


# ==================== COLLEGE ADMIN ====================
@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ('college_name', 'short_name', 'counselling_code', 'location_city', 'location_state', 'type', 'affiliation', 'naac_grade', 'nirf_rank', 'placement_percentage', 'median_salary', 'hostel_available', 'created_at')
    search_fields = ('college_name', 'short_name', 'counselling_code', 'location_city', 'location_state')
    list_filter = ('location_state', 'type', 'affiliation', 'naac_grade', 'hostel_available', 'established_year')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {'fields': ('college_name', 'short_name', 'counselling_code', 'logo_url', 'type', 'affiliation')}),
        ('Location', {'fields': ('location_city', 'location_state', 'location_pincode', 'address')}),
        ('Campus Details', {'fields': ('established_year', 'total_campus_area', 'hostel_available')}),
        ('Rankings & Accreditation', {'fields': ('naac_grade', 'nirf_rank')}),
        ('Placement', {'fields': ('placement_percentage', 'median_salary', 'highest_salary', 'avg_salary')}),
        ('Contact & Web', {'fields': ('website_url', 'email_domain', 'contact_phone')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)})
    )


# ==================== COURSE ADMIN ====================
class CollegeStateListFilter(admin.SimpleListFilter):
    title = 'College State'
    parameter_name = 'college_state'
    def lookups(self, request, model_admin):
        states = set(college.location_state for college in College.objects.all() if college.location_state)
        return [(state, state) for state in sorted(states)]
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(college__location_state=self.value())
        return queryset

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_name', 'college', 'degree_name', 'specialization', 'cutoff_oc', 'cutoff_bc', 'cutoff_sc', 'intake_seats', 'is_active')
    search_fields = ('course_name', 'course_code', 'specialization', 'college__college_name')
    list_filter = (CollegeStateListFilter, 'degree_type', 'degree_name', 'is_active', 'college__type', 'college__affiliation')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('cutoff_oc', 'cutoff_bc', 'cutoff_sc', 'intake_seats', 'is_active')
    list_per_page = 25
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('college')


# ==================== FEES ADMIN ====================
@admin.register(Fees)
class FeesAdmin(admin.ModelAdmin):
    list_display = ('college', 'course', 'academic_year', 'tuition_fee', 'total_fee_display', 'payment_frequency', 'scholarship_available', 'created_at')
    search_fields = ('college__college_name', 'college__short_name', 'course__course_name', 'academic_year')
    list_filter = ('academic_year', 'payment_frequency', 'scholarship_available', 'college__location_state', 'college__type')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('College & Course', {'fields': ('college', 'course', 'academic_year')}),
        ('Fee Components', {'fields': ('tuition_fee', 'hostel_fee', 'mess_fee', 'transport_fee')}),
        ('One-time Fees', {'fields': ('admission_fee_one_time',)}),
        ('Payment & Scholarship', {'fields': ('payment_frequency', 'scholarship_available', 'scholarship_details')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)})
    )
    
    def total_fee_display(self, obj):
        return f"₹ {obj.total_fee:,.2f}"
    total_fee_display.short_description = 'Total Fee'
    
    def save_model(self, request, obj, form, change):
        if not obj.scholarship_available:
            obj.scholarship_details = None
        super().save_model(request, obj, form, change)


# ==================== USER PROFILE ADMIN ====================
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone_number', 'city', 'state', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'phone_number', 'city')
    list_filter = ('gender', 'state', 'city')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Personal Information', {'fields': ('first_name', 'last_name', 'date_of_birth', 'gender')}),
        ('Contact Information', {'fields': ('email', 'phone_number', 'whatsapp_number')}),
        ('Address', {'fields': ('address', 'city', 'state', 'pincode')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)})
    )


# ==================== TEAM MEMBER ADMIN ====================
@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'designation', 'is_active', 'joined_at')
    search_fields = ('user__username', 'user__email', 'designation')
    list_filter = ('role', 'is_active')
    readonly_fields = ('joined_at',)


# ==================== TIMELINE EVENT ADMIN ====================
@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'college', 'start_date', 'is_active')
    search_fields = ('title', 'description')
    list_filter = ('event_type', 'is_active')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Event Information', {'fields': ('title', 'event_type', 'description')}),
        ('College', {'fields': ('college',)}),
        ('Date & Time', {'fields': ('start_date', 'end_date')}),
        ('Status', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)})
    )