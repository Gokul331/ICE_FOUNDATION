from django.contrib import admin
from django.db.models import Avg
from .models import College, Course, Fees, Hostel, UserProfile, TeamMember, TimelineEvent, StudentApplication


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


# ==================== HOSTEL ADMIN ====================
@admin.register(Hostel)
class HostelAdmin(admin.ModelAdmin):
    list_display = ('name', 'college', 'gender', 'room_type_display', 
                    'fee_per_year', 'total_rooms', 'total_capacity', 'is_active')
    list_filter = ('gender', 'room_type', 'is_active', 'college')
    search_fields = ('name', 'college__college_name')
    readonly_fields = ('created_at', 'updated_at', 'total_capacity', 'total_fee_with_deposit')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('college', 'name', 'gender')
        }),
        ('Room Details', {
            'fields': ('room_type', 'total_rooms', 'capacity_per_room')
        }),
        ('Fee Structure', {
            'fields': ('fee_per_semester', 'fee_per_year', 'caution_deposit'),
            'description': 'Hostel fees per student (per year or per semester)'
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at', 'total_capacity', 'total_fee_with_deposit'),
            'classes': ('collapse',)
        })
    )
    
    def room_type_display(self, obj):
        return obj.room_type_display
    room_type_display.short_description = 'Room Type'
    room_type_display.admin_order_field = 'room_type'
    
    def total_capacity(self, obj):
        return obj.total_capacity
    total_capacity.short_description = 'Total Capacity'
    
    def total_fee_with_deposit(self, obj):
        return f"₹{obj.total_fee_with_deposit:,.2f}/year"
    total_fee_with_deposit.short_description = 'Total with Deposit'


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
    list_display = ('course_name', 'course_code', 'college', 'degree_name', 
                    'tuition_fee_management', 'tuition_fee_government', 
                    'cutoff_oc', 'cutoff_bc', 'cutoff_sc', 'intake_seats', 'is_active')
    search_fields = ('course_name', 'course_code', 'college__college_name')
    list_filter = (CollegeStateListFilter, 'college', 'degree_type', 'degree_name', 'is_active', 'college__type', 'college__affiliation')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('tuition_fee_management', 'tuition_fee_government', 'cutoff_oc', 'cutoff_bc', 'cutoff_sc', 'intake_seats', 'is_active')
    list_per_page = 25
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('college', 'course_code', 'course_name', 'degree_type', 'degree_name', 'duration_years')
        }),
        ('Fee Information', {
            'fields': ('tuition_fee_management', 'tuition_fee_government'),
            'description': '''
                <div style="background: #e8f5e9; padding: 8px 12px; border-radius: 6px;">
                    <strong>📘 Fee Structure:</strong><br>
                    • <strong>Management Quota Fee:</strong> Annual fee for students admitted through management quota<br>
                    • <strong>Government Quota Fee:</strong> Annual fee for students admitted through government counselling
                </div>
            '''
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
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('college')


# ==================== FEES ADMIN (UPDATED) ====================
@admin.register(Fees)
class FeesAdmin(admin.ModelAdmin):
    list_display = ('college', 'academic_year', 'admission_fee_display', 
                    'total_fee_display', 'transport_fee_range_display', 
                    'payment_frequency', 'created_at')
    search_fields = ('college__college_name', 'college__short_name', 'academic_year')
    list_filter = ('academic_year', 'payment_frequency', 'college__location_state', 'college__type')
    readonly_fields = ('created_at', 'updated_at', 'total_fee_calculated')
    
    fieldsets = (
        ('College Information', {
            'fields': ('college', 'academic_year')
        }),
        ('Application & Admission Fees', {
            'fields': ('application_fee', 'admission_fee'),
            'description': 'One-time fees paid during application and admission process'
        }),
        ('Academic Fees', {
            'fields': ('book_fee', 'exam_fee', 'lab_fee', 'sports_fee'),
            'description': 'Annual academic and facility fees'
        }),
        ('Miscellaneous Fees', {
            'fields': ('miscellaneous_fee', 'miscellaneous_description'),
            'description': 'Other miscellaneous charges'
        }),
        ('Additional Fees (JSON Format)', {
            'fields': ('additional_fees',),
            'description': '''
                <div style="background: #f8fafc; padding: 12px; border-radius: 6px;">
                    <strong>📘 Additional Fees Format:</strong><br>
                    Enter additional fees as JSON:<br><br>
                    <code>
                    {
                        "caution_deposit": {"amount": 5000, "refundable": true, "description": "Library caution deposit"},
                        "alumni_fee": {"amount": 1000, "description": "Alumni association fee"},
                        "medical_fee": {"amount": 2000, "description": "Medical insurance"}
                    }
                    </code>
                </div>
            ''',
            'classes': ('wide',)
        }),
        ('Transport Facility', {
            'fields': ('transport_fee_min', 'transport_fee_max'),
            'description': 'Transport fee range based on distance (min to max)'
        }),
        ('Payment Settings', {
            'fields': ('payment_frequency', 'fee_notes'),
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at', 'total_fee_calculated'),
            'classes': ('collapse',)
        })
    )
    
    def admission_fee_display(self, obj):
        return f"₹ {obj.admission_fee:,.2f}" if obj.admission_fee else "Not Set"
    admission_fee_display.short_description = 'Admission Fee'
    
    def total_fee_display(self, obj):
        return f"₹ {obj.total_fee:,.2f}"
    total_fee_display.short_description = 'Total Fee'
    
    def transport_fee_range_display(self, obj):
        if obj.transport_fee_min == obj.transport_fee_max:
            if obj.transport_fee_min == 0:
                return "Not Available"
            return f"₹ {obj.transport_fee_min:,.2f}"
        return f"₹ {obj.transport_fee_min:,.2f} - ₹ {obj.transport_fee_max:,.2f}"
    transport_fee_range_display.short_description = 'Transport Fee Range'
    
    def total_fee_calculated(self, obj):
        """Display detailed fee breakdown in admin panel"""
        # Get all courses for this college
        courses = Course.objects.filter(college=obj.college, is_active=True)
        breakdown = obj.get_fee_breakdown()
        
        html = '<div style="background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #3AAAD4;">'
        html += '<strong style="font-size: 14px;">📊 Fee Breakdown (Academic Year: {})</strong><br/><br/>'.format(obj.academic_year)
        
        # One-time fees
        html += '<strong>💰 One-time Fees:</strong><br/>'
        html += '• Application Fee: ₹ {:,.2f}<br/>'.format(breakdown['one_time_fees']['application_fee'])
        html += '• Admission Fee: ₹ {:,.2f}<br/>'.format(breakdown['one_time_fees']['admission_fee'])
        html += '<strong>Total One-time: ₹ {:,.2f}</strong><br/><br/>'.format(breakdown['one_time_fees']['total_one_time'])
        
        # Annual fees
        html += '<strong>📚 Annual Fees:</strong><br/>'
        html += '• Book Fee: ₹ {:,.2f}<br/>'.format(breakdown['annual_fees']['book_fee'])
        html += '• Exam Fee: ₹ {:,.2f}<br/>'.format(breakdown['annual_fees']['exam_fee'])
        html += '• Lab Fee: ₹ {:,.2f}<br/>'.format(breakdown['annual_fees']['lab_fee'])
        html += '• Sports Fee: ₹ {:,.2f}<br/>'.format(breakdown['annual_fees']['sports_fee'])
        if breakdown['annual_fees']['miscellaneous_fee'] > 0:
            html += '• Miscellaneous: ₹ {:,.2f}<br/>'.format(breakdown['annual_fees']['miscellaneous_fee'])
        html += '<strong>Total Annual: ₹ {:,.2f}</strong><br/><br/>'.format(breakdown['annual_fees']['total_annual'])
        
        # Additional fees
        if breakdown['additional_fees']:
            html += '<strong>📝 Additional Fees:</strong><br/>'
            for fee in breakdown['additional_fees']:
                refundable = " (Refundable)" if fee['refundable'] else ""
                html += '• {}: ₹ {:,.2f}{}<br/>'.format(fee['name'], fee['amount'], refundable)
            html += '<br/>'
        
        # Transport fees
        if obj.transport_fee_min == obj.transport_fee_max:
            transport_text = f"₹ {obj.transport_fee_min:,.2f}" if obj.transport_fee_min > 0 else "Not Available"
        else:
            transport_text = f"₹ {obj.transport_fee_min:,.2f} - ₹ {obj.transport_fee_max:,.2f}"
        html += '• <strong>Transport Fee Range:</strong> {}<br/><br/>'.format(transport_text)
        
        # Grand total
        html += '<hr style="margin: 10px 0; border-color: #e2e8f0;">'
        html += '<strong>🎯 Grand Total: ₹ {:,.2f}</strong><br/>'.format(breakdown['grand_total'])
        
        # Hostel information note
        hostel_count = Hostel.objects.filter(college=obj.college, is_active=True).count()
        if hostel_count > 0:
            html += '<br/><div style="background: #e3f2fd; padding: 8px; border-radius: 4px; margin-top: 8px;">'
            html += '🏠 <strong>Note:</strong> Hostel fees are managed separately. '
            html += 'This college has {} hostel option(s) with different room types.'.format(hostel_count)
            html += '</div>'
        
        # Courses information
        if courses.exists():
            html += '<br/><div style="background: #f1f5f9; padding: 8px; border-radius: 4px; margin-top: 8px;">'
            html += '📚 <strong>Note:</strong> Tuition fees are course-specific. '
            html += 'This college offers {} active course(s) with their own tuition fee structures.'.format(courses.count())
            html += '</div>'
        
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
        
        # Ensure additional_fees is a dict
        if obj.additional_fees is None:
            obj.additional_fees = {}
        
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('college')


# ==================== USER PROFILE ADMIN ====================
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone_number', 'city', 'state', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'phone_number', 'city')
    list_filter = ('gender', 'state', 'city')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Personal Information', {'fields': ('user', 'first_name', 'last_name', 'date_of_birth', 'gender')}),
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


# ==================== STUDENT APPLICATION ADMIN ====================
@admin.register(StudentApplication)
class StudentApplicationAdmin(admin.ModelAdmin):
    list_display = ('application_id', 'user', 'college', 'quota_type', 'status',
                   'first_name', 'last_name', 'email_id', 'mobile_number', 'submitted_at')
    search_fields = ('application_id', 'user__username', 'user__email', 'first_name',
                    'last_name', 'email_id', 'mobile_number', 'college__college_name')
    list_filter = ('status', 'quota_type', 'community', 'gender', 'college__location_state')
    readonly_fields = ('application_id', 'submitted_at', 'updated_at')
    date_hierarchy = 'submitted_at'

    fieldsets = (
        ('Application Info', {
            'fields': ('application_id', 'user', 'college', 'course_name', 'quota_type', 'status')
        }),
        ('Bio-data', {
            'fields': ('first_name', 'last_name', 'gender', 'date_of_birth', 'mobile_number',
                      'email_id', 'blood_group', 'nationality', 'community', 'sub_caste',
                      'marital_status', 'mother_tongue', 'aadhar_number', 'first_graduation')
        }),
        ("Parent's Details", {
            'fields': ('father_name', 'father_mobile', 'father_occupation',
                      'mother_name', 'mother_mobile', 'mother_occupation', 'family_annual_income')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'city', 'state', 'pincode')
        }),
        ('10th Details', {
            'fields': ('tenth_school_name', 'tenth_board', 'tenth_year_of_passing',
                      'tenth_result_status', 'tenth_marks_percentage')
        }),
        ('12th Details', {
            'fields': ('twelfth_school_name', 'twelfth_board', 'twelfth_year_of_passing',
                      'twelfth_result_status', 'twelfth_marks_percentage')
        }),
        ('Diploma Details', {
            'fields': ('has_diploma', 'diploma_college_name', 'diploma_board_university',
                      'diploma_year_of_passing', 'diploma_result_status', 'diploma_marks_percentage')
        }),
        ('UG Details', {
            'fields': ('has_ug', 'ug_college_name', 'ug_board_university',
                      'ug_year_of_passing', 'ug_result_status', 'ug_marks_percentage')
        }),
        ('Document Uploads', {
            'fields': ('photo', 'aadhar_card', 'tenth_marksheet', 'twelfth_marksheet',
                      'diploma_marksheet', 'ug_marksheet', 'community_marksheet')
        }),
        ('Declaration', {
            'fields': ('declaration_accepted',)
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'college')