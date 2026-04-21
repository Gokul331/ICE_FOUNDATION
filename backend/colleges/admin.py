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


# ==================== FEES ADMIN (FIXED) ====================
@admin.register(Fees)
class FeesAdmin(admin.ModelAdmin):
    list_display = ('college', 'course', 'academic_year', 'tuition_fee_display', 
                    'hostel_fee_display', 'transport_fee_range_display', 
                    'total_fee_display', 'payment_frequency', 'created_at')
    search_fields = ('college__college_name', 'college__short_name', 'course__course_name', 'academic_year')
    
    # FIX: Remove 'hostel_room_type' from list_filter if it doesn't exist yet
    # Only include fields that definitely exist in the database
    list_filter = ('academic_year', 'payment_frequency', 'college__location_state', 'college__type')
    
    readonly_fields = ('created_at', 'updated_at', 'total_fee_calculated')
    
    fieldsets = (
        ('College & Course Information', {
            'fields': ('college', 'course', 'academic_year')
        }),
        ('Basic Fee Components', {
            'fields': ('tuition_fee', 'admission_fee'),
            'description': 'Basic fees required for admission'
        }),
        ('Hostel Accommodation', {
            'fields': ('hostel_room_type', 'hostel_fee'),
            'description': 'Hostel fees including mess charges (select room type from choices)',
            'classes': ('wide',)
        }),
        ('Transport Facility', {
            'fields': ('transport_fee_min', 'transport_fee_max'),
            'description': 'Transport fee range based on distance (min to max) - Example: 3000 to 8000'
        }),
        ('Payment Settings', {
            'fields': ('payment_frequency', 'fee_notes'),
            'classes': ('wide',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at', 'total_fee_calculated'),
            'classes': ('collapse',)
        })
    )
    
    def tuition_fee_display(self, obj):
        return f"₹ {obj.tuition_fee:,.2f}"
    tuition_fee_display.short_description = 'Tuition Fee'
    
    def hostel_fee_display(self, obj):
        if hasattr(obj, 'hostel_fee') and obj.hostel_fee and obj.hostel_fee > 0:
            room_display = self.get_hostel_room_display(obj)
            return f"₹ {obj.hostel_fee:,.2f} ({room_display})"
        return "Not Applicable"
    hostel_fee_display.short_description = 'Hostel Fee (incl. Mess)'
    
    def get_hostel_room_display(self, obj):
        """Safe method to get hostel room display"""
        if hasattr(obj, 'get_hostel_room_display'):
            return obj.get_hostel_room_display()
        room_types = {
            1: 'Normal + Common Bathroom',
            2: 'Normal + Attached Bathroom',
            3: 'AC + Common Bathroom',
            4: 'AC + Attached Bathroom'
        }
        return room_types.get(obj.hostel_room_type, 'Not Selected')
    
    def transport_fee_range_display(self, obj):
        if hasattr(obj, 'transport_fee_min') and hasattr(obj, 'transport_fee_max'):
            if obj.transport_fee_min == obj.transport_fee_max:
                if obj.transport_fee_min == 0:
                    return "Not Available"
                return f"₹ {obj.transport_fee_min:,.2f}"
            return f"₹ {obj.transport_fee_min:,.2f} - ₹ {obj.transport_fee_max:,.2f}"
        return "Not Available"
    transport_fee_range_display.short_description = 'Transport Fee Range'
    
    def total_fee_display(self, obj):
        """Display total fee with transport range"""
        if hasattr(obj, 'total_fee_with_transport_min'):
            if obj.transport_fee_min == obj.transport_fee_max:
                if obj.transport_fee_min == 0:
                    return f"₹ {obj.total_fee:,.2f}"
                return f"₹ {obj.total_fee_with_transport_min:,.2f}"
            return f"₹ {obj.total_fee_with_transport_min:,.2f} - ₹ {obj.total_fee_with_transport_max:,.2f}"
        return f"₹ {obj.total_fee:,.2f}"
    total_fee_display.short_description = 'Total Fee (with Transport)'
    
    def total_fee_calculated(self, obj):
        """Display detailed fee breakdown in admin panel"""
        html = '<div style="background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #3AAAD4;">'
        html += '<strong style="font-size: 14px;">📊 Fee Breakdown</strong><br/><br/>'
        html += '• <strong>Tuition Fee:</strong> ₹ {:,.2f}<br/>'.format(obj.tuition_fee)
        html += '• <strong>Admission Fee:</strong> ₹ {:,.2f}<br/>'.format(obj.admission_fee)
        if hasattr(obj, 'hostel_fee') and obj.hostel_fee:
            room_display = self.get_hostel_room_display(obj)
            html += '• <strong>Hostel Fee ({}):</strong> ₹ {:,.2f}<br/>'.format(room_display, obj.hostel_fee)
        else:
            html += '• <strong>Hostel Fee:</strong> Not Applicable<br/>'
        
        if hasattr(obj, 'transport_fee_min') and hasattr(obj, 'transport_fee_max'):
            if obj.transport_fee_min == obj.transport_fee_max:
                transport_text = f"₹ {obj.transport_fee_min:,.2f}" if obj.transport_fee_min > 0 else "Not Available"
            else:
                transport_text = f"₹ {obj.transport_fee_min:,.2f} - ₹ {obj.transport_fee_max:,.2f}"
            html += '• <strong>Transport Fee:</strong> {}<br/>'.format(transport_text)
        
        html += '<hr style="margin: 10px 0; border-color: #e2e8f0;">'
        html += '<strong>💰 Total Amount:</strong><br/>'
        html += '• Without Transport: ₹ {:,.2f}<br/>'.format(obj.total_fee)
        
        if hasattr(obj, 'transport_fee_min') and obj.transport_fee_min > 0:
            html += '• With Min Transport: ₹ {:,.2f}<br/>'.format(obj.total_fee_with_transport_min)
            html += '• With Max Transport: ₹ {:,.2f}<br/>'.format(obj.total_fee_with_transport_max)
        
        html += '</div>'
        return html
    total_fee_calculated.short_description = 'Fee Calculator'
    total_fee_calculated.allow_tags = True
    
    def save_model(self, request, obj, form, change):
        # Auto-set hostel_room_type to None if hostel_fee is 0 or empty
        if not obj.hostel_fee or obj.hostel_fee == 0:
            obj.hostel_room_type = None
        
        # Ensure transport_fee_max is not less than transport_fee_min
        if obj.transport_fee_max < obj.transport_fee_min:
            obj.transport_fee_max = obj.transport_fee_min
        
        # Set default values if empty
        if obj.transport_fee_min is None:
            obj.transport_fee_min = 0
        if obj.transport_fee_max is None:
            obj.transport_fee_max = 0
        
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related('college', 'course')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Filter courses based on selected college"""
        if db_field.name == "course":
            college_id = request.GET.get('college')
            if college_id:
                kwargs["queryset"] = Course.objects.filter(college_id=college_id)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


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