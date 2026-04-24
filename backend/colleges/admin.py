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
    # Change 'tuition_fee_display' to 'tuition_fee'
    list_display = ('course_name', 'course_code', 'college', 'degree_name', 'tuition_fee', 'cutoff_oc', 'cutoff_bc', 'cutoff_sc', 'intake_seats', 'is_active')
    search_fields = ('course_name', 'course_code', 'specialization', 'college__college_name')
    list_filter = (CollegeStateListFilter, 'degree_type', 'degree_name', 'is_active', 'college__type', 'college__affiliation')
    readonly_fields = ('created_at', 'updated_at')
    # Now tuition_fee is in both list_display and list_editable
    list_editable = ('tuition_fee', 'cutoff_oc', 'cutoff_bc', 'cutoff_sc', 'intake_seats', 'is_active')
    list_per_page = 25
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('college', 'course_code', 'course_name', 'degree_type', 'degree_name', 'duration_years')
        }),
        ('Fee Information', {
            'fields': ('tuition_fee',),
            'description': 'Annual tuition fee for this course'
        }),
        ('Seats & Cutoff Marks', {
            'fields': ('intake_seats', 'cutoff_oc', 'cutoff_bc', 'cutoff_bcm', 'cutoff_mbc', 
                      'cutoff_sc', 'cutoff_sca', 'cutoff_st'),
            'classes': ('wide',)
        }),
        ('Scholarship Information', {
            'fields': ('scholarship_amount', 'scholarship_criteria'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def tuition_fee_display(self, obj):
        return f"₹ {obj.tuition_fee:,.2f}/year" if obj.tuition_fee else "Not Set"
    tuition_fee_display.short_description = 'Tuition Fee'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('college')


# ==================== FEES ADMIN (UPDATED - tuition_fee removed) ====================
@admin.register(Fees)
class FeesAdmin(admin.ModelAdmin):
    list_display = ('college', 'course', 'academic_year', 'admission_fee_display', 
                    'hostel_fees_summary', 'transport_fee_range_display', 
                    'payment_frequency', 'created_at')
    search_fields = ('college__college_name', 'college__short_name', 'course__course_name', 'academic_year')
    list_filter = ('academic_year', 'payment_frequency', 'college__location_state', 'college__type')
    readonly_fields = ('created_at', 'updated_at', 'total_fee_calculated')
    
    fieldsets = (
        ('College & Course Information', {
            'fields': ('college', 'course', 'academic_year')
        }),
        ('Basic Fee Components', {
            'fields': ('admission_fee',),
            'description': '<div style="background: #e8f5e9; padding: 8px 12px; border-radius: 6px; margin-bottom: 10px;">📘 <strong>Note:</strong> Tuition fee is now managed in the Course model. This allows each course to have a base tuition fee that applies across all academic years.</div>'
        }),
        ('Hostel Accommodation (JSON Format)', {
            'fields': ('hostel_fees',),
            'description': '''
                <div style="background: #f8fafc; padding: 12px; border-radius: 6px;">
                    <strong>📘 Hostel Fees Format:</strong><br>
                    Enter hostel fees as JSON with room type keys:<br><br>
                    <code>
                    {
                        "1": {"fee": 45000, "available_seats": 100},
                        "2": {"fee": 55000, "available_seats": 80},
                        "3": {"fee": 75000, "available_seats": 50},
                        "4": {"fee": 90000, "available_seats": 40}
                    }
                    </code><br><br>
                    <strong>Room Types:</strong><br>
                    1 = Normal Room + Common Bathroom<br>
                    2 = Normal Room + Attached Bathroom<br>
                    3 = AC Room + Common Bathroom<br>
                    4 = AC Room + Attached Bathroom
                </div>
            ''',
            'classes': ('wide',)
        }),
        ('Transport Facility', {
            'fields': ('transport_fee_min', 'transport_fee_max'),
            'description': 'Transport fee range based on distance (min to max) - Example: 5000 to 30000'
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
    
    def admission_fee_display(self, obj):
        return f"₹ {obj.admission_fee:,.2f}" if obj.admission_fee else "Not Set"
    admission_fee_display.short_description = 'Admission Fee'
    
    def hostel_fees_summary(self, obj):
        """Display hostel fees summary in admin list view"""
        if not obj.hostel_fees:
            return "Not Available"
        
        room_names = {
            '1': 'Normal+Common',
            '2': 'Normal+Attached',
            '3': 'AC+Common',
            '4': 'AC+Attached'
        }
        
        summary = []
        for room_type, data in obj.hostel_fees.items():
            fee = data.get('fee', 0)
            if fee > 0:
                room_name = room_names.get(room_type, f'Room {room_type}')
                summary.append(f"{room_name}: ₹{fee:,.0f}")
        
        return ", ".join(summary) if summary else "Not Available"
    hostel_fees_summary.short_description = 'Hostel Fees'
    
    def transport_fee_range_display(self, obj):
        if obj.transport_fee_min == obj.transport_fee_max:
            if obj.transport_fee_min == 0:
                return "Not Available"
            return f"₹ {obj.transport_fee_min:,.2f}"
        return f"₹ {obj.transport_fee_min:,.2f} - ₹ {obj.transport_fee_max:,.2f}"
    transport_fee_range_display.short_description = 'Transport Fee Range'
    
    def total_fee_calculated(self, obj):
        """Display detailed fee breakdown in admin panel using tuition_fee from Course model"""
        tuition = obj.course.tuition_fee if obj.course else 0
        
        html = '<div style="background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #3AAAD4;">'
        html += '<strong style="font-size: 14px;">📊 Fee Breakdown</strong><br/><br/>'
        html += '• <strong>Tuition Fee (from Course):</strong> ₹ {:,.2f}<small style="color: #666;">/year</small><br/>'.format(tuition)
        html += '• <strong>Admission Fee:</strong> ₹ {:,.2f}<br/>'.format(obj.admission_fee)
        
        # Hostel fees breakdown
        if obj.hostel_fees:
            room_names = {
                1: 'Normal + Common Bathroom',
                2: 'Normal + Attached Bathroom',
                3: 'AC + Common Bathroom',
                4: 'AC + Attached Bathroom'
            }
            html += '<br/><strong>🏠 Hostel Options:</strong><br/>'
            for room_type, data in obj.hostel_fees.items():
                fee = data.get('fee', 0)
                seats = data.get('available_seats', 0)
                room_name = room_names.get(int(room_type), f'Room {room_type}')
                html += '&nbsp;&nbsp;• {}: ₹ {:,.2f}'.format(room_name, fee)
                if seats:
                    html += ' ({} seats)'.format(seats)
                html += '<br/>'
        else:
            html += '• <strong>Hostel Fee:</strong> Not Available<br/>'
        
        # Transport fees
        if obj.transport_fee_min == obj.transport_fee_max:
            transport_text = f"₹ {obj.transport_fee_min:,.2f}" if obj.transport_fee_min > 0 else "Not Available"
        else:
            transport_text = f"₹ {obj.transport_fee_min:,.2f} - ₹ {obj.transport_fee_max:,.2f}"
        html += '<br/>• <strong>Transport Fee:</strong> {}<br/>'.format(transport_text)
        
        # Total calculation
        base_total = tuition + obj.admission_fee
        html += '<hr style="margin: 10px 0; border-color: #e2e8f0;">'
        html += '<strong>💰 Total Amount (without hostel):</strong> ₹ {:,.2f}<small style="color: #666;">/year</small><br/>'.format(base_total)
        
        if obj.transport_fee_min > 0:
            html += '<strong>💰 Total with Min Transport:</strong> ₹ {:,.2f}<br/>'.format(base_total + obj.transport_fee_min)
            if obj.transport_fee_max != obj.transport_fee_min:
                html += '<strong>💰 Total with Max Transport:</strong> ₹ {:,.2f}<br/>'.format(base_total + obj.transport_fee_max)
        
        html += '</div>'
        return html
    total_fee_calculated.short_description = 'Fee Calculator'
    total_fee_calculated.allow_tags = True
    
    def save_model(self, request, obj, form, change):
        # Ensure transport_fee_max is not less than transport_fee_min
        if obj.transport_fee_max < obj.transport_fee_min:
            obj.transport_fee_max = obj.transport_fee_min
        
        # Set default values if empty
        if obj.transport_fee_min is None:
            obj.transport_fee_min = 0
        if obj.transport_fee_max is None:
            obj.transport_fee_max = 0
        
        # Ensure hostel_fees is a dict
        if obj.hostel_fees is None:
            obj.hostel_fees = {}
        
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
    list_filter = ('event_type', 'is_active', 'college')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Event Information', {'fields': ('title', 'event_type', 'description')}),
        ('College', {'fields': ('college',)}),
        ('Date & Time', {'fields': ('start_date', 'end_date')}),
        ('Status', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)})
    )