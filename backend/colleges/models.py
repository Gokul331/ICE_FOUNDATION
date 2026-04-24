from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator

# ==================== COLLEGE MODEL ====================
class College(models.Model):
    TYPE_CHOICES = [
        ('government', 'Government'),
        ('private', 'Private'),
        ('aided', 'Aided'),
        ('autonomous', 'Autonomous'),
    ]

    AFFILIATION_CHOICES = [
        ('anna_university', 'Anna University'),
        ('anna_university_affiliated', 'Anna University Affiliated'),
        ('deemed_university', 'Deemed University'),
    ]

    college_id = models.AutoField(primary_key=True)
    college_name = models.CharField(max_length=200, unique=True)
    short_name = models.CharField(max_length=50, null=True, blank=True)
    counselling_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    logo_url = models.URLField(max_length=500, null=True, blank=True)
    location_city = models.CharField(max_length=100)
    location_state = models.CharField(max_length=100)
    location_pincode = models.CharField(max_length=10, null=True, blank=True)
    established_year = models.IntegerField(null=True, blank=True)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, null=True, blank=True)
    affiliation = models.CharField(max_length=100, choices=AFFILIATION_CHOICES, null=True, blank=True)
    naac_grade = models.CharField(max_length=5, null=True, blank=True)
    nirf_rank = models.IntegerField(null=True, blank=True)
    website_url = models.URLField(max_length=255, null=True, blank=True)
    email_domain = models.CharField(max_length=100, null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    total_campus_area = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hostel_available = models.BooleanField(default=True)
    placement_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    median_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    highest_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    avg_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.college_name

    class Meta:
        ordering = ['college_name']


# ==================== COURSE MODEL ====================
class Course(models.Model):
    DEGREE_TYPE_CHOICES = [
        ('ug', 'UG'),
        ('pg', 'PG'),
        ('diploma', 'Diploma'),
        ('phd', 'PhD'),
        ('integrated', 'Integrated'),
    ]

    # Course Code Choices (only the code)
    COURSE_CODE_CHOICES = [
        ('AD', 'AD'), ('AE', 'AE'), ('AG', 'AG'), ('AI', 'AI'),
        ('AM', 'AM'), ('AO', 'AO'), ('AP', 'AP'), ('AR', 'AR'),
        ('AS', 'AS'), ('AU', 'AU'), ('BD', 'BD'), ('BM', 'BM'),
        ('BR', 'BR'), ('BS', 'BS'), ('BT', 'BT'), ('BY', 'BY'),
        ('CA', 'CA'), ('CB', 'CB'), ('CC', 'CC'), ('CE', 'CE'),
        ('CH', 'CH'), ('CL', 'CL'), ('CM', 'CM'), ('CN', 'CN'),
        ('CO', 'CO'), ('CP', 'CP'), ('CR', 'CR'), ('CS', 'CS'),
        ('CT', 'CT'), ('CW', 'CW'), ('CY', 'CY'), ('EC', 'EC'),
        ('EE', 'EE'), ('EI', 'EI'), ('EM', 'EM'), ('EN', 'EN'),
        ('ES', 'ES'), ('ET', 'ET'), ('EX', 'EX'), ('EY', 'EY'),
        ('FD', 'FD'), ('FS', 'FS'), ('FT', 'FT'), ('FY', 'FY'),
        ('GI', 'GI'), ('HT', 'HT'), ('IB', 'IB'), ('IC', 'IC'),
        ('IE', 'IE'), ('IG', 'IG'), ('IM', 'IM'), ('IN', 'IN'),
        ('IS', 'IS'), ('IT', 'IT'), ('IY', 'IY'), ('LE', 'LE'),
        ('MA', 'MA'), ('MC', 'MC'), ('MD', 'MD'), ('ME', 'ME'),
        ('MF', 'MF'), ('MG', 'MG'), ('MH', 'MH'), ('MI', 'MI'),
        ('MN', 'MN'), ('MO', 'MO'), ('MR', 'MR'), ('MS', 'MS'),
        ('MT', 'MT'), ('MU', 'MU'), ('MY', 'MY'), ('MZ', 'MZ'),
        ('NS', 'NS'), ('PA', 'PA'), ('PC', 'PC'), ('PD', 'PD'),
        ('PE', 'PE'), ('PH', 'PH'), ('PL', 'PL'), ('PM', 'PM'),
        ('PN', 'PN'), ('PP', 'PP'), ('PR', 'PR'), ('PS', 'PS'),
        ('PT', 'PT'), ('RA', 'RA'), ('RM', 'RM'), ('RP', 'RP'),
        ('SB', 'SB'), ('SC', 'SC'), ('TC', 'TC'), ('TS', 'TS'), 
        ('TT', 'TT'), ('TX', 'TX'), ('XC', 'XC'), ('XM', 'XM'), 
    ]

    # Course Name Choices (full names)
    COURSE_NAME_CHOICES = [
        ('Artificial Intelligence and Data Science', 'Artificial Intelligence and Data Science'),
        ('Aeronautical Engineering', 'Aeronautical Engineering'),
        ('Agriculture Engineering', 'Agriculture Engineering'),
        ('Agricultural and Irrigation Engineering (SS)', 'Agricultural and Irrigation Engineering (SS)'),
        ('Computer Science and Engineering (AI and Machine Learning)', 'Computer Science and Engineering (AI and Machine Learning)'),
        ('Aerospace Engineering', 'Aerospace Engineering'),
        ('Apparel Technology (SS)', 'Apparel Technology (SS)'),
        ('Architecture', 'Architecture'),
        ('Automobile Engineering (SS)', 'Automobile Engineering (SS)'),
        ('Automobile Engineering', 'Automobile Engineering'),
        ('Computer Science and Engineering (Big Data Analytics)', 'Computer Science and Engineering (Big Data Analytics)'),
        ('Bio-Medical Engineering', 'Bio-Medical Engineering'),
        ('Architecture (SS)', 'Architecture (SS)'),
        ('Bio Technology (SS)', 'Bio Technology (SS)'),
        ('Bio Technology', 'Bio Technology'),
        ('Bio-Medical Engineering (SS)', 'Bio-Medical Engineering (SS)'),
        ('Civil and Structural Engineering', 'Civil and Structural Engineering'),
        ('Computer Science and Business System', 'Computer Science and Business System'),
        ('Chemical and Electro Chemical Engineering (SS)', 'Chemical and Electro Chemical Engineering (SS)'),
        ('Civil Engineering', 'Civil Engineering'),
        ('Chemical Engineering', 'Chemical Engineering'),
        ('Chemical Engineering (SS)', 'Chemical Engineering (SS)'),
        ('Computer Science and Engineering (SS)', 'Computer Science and Engineering (SS)'),
        ('Civil Engineering (SS)', 'Civil Engineering (SS)'),
        ('Computer and Communication Engineering', 'Computer and Communication Engineering'),
        ('Civil Engg. and Planning', 'Civil Engg. and Planning'),
        ('Ceramic Technology (SS)', 'Ceramic Technology (SS)'),
        ('Computer Science and Engineering', 'Computer Science and Engineering'),
        ('Computer Technology', 'Computer Technology'),
        ('Computer Science and Business System (SS)', 'Computer Science and Business System (SS)'),
        ('Cyber Security', 'Cyber Security'),
        ('Electronics and Communication Engineering', 'Electronics and Communication Engineering'),
        ('Electrical and Electronics Engineering', 'Electrical and Electronics Engineering'),
        ('Electronics and Instrumentation Engineering', 'Electronics and Instrumentation Engineering'),
        ('Electronics and Communication Engg. (SS)', 'Electronics and Communication Engg. (SS)'),
        ('Environmental Engg.', 'Environmental Engg.'),
        ('Electrical and Electronics (Sandwich) (SS)', 'Electrical and Electronics (Sandwich) (SS)'),
        ('Electronics and Telecommunication Engg.', 'Electronics and Telecommunication Engg.'),
        ('Electronics and Instrumentation Engg. (SS)', 'Electronics and Instrumentation Engg. (SS)'),
        ('Elec. And Electronics Engg (SS)', 'Elec. And Electronics Engg (SS)'),
        ('Food Technology', 'Food Technology'),
        ('Food Technology (SS)', 'Food Technology (SS)'),
        ('Fashion Technology', 'Fashion Technology'),
        ('Fashion Technology (SS)', 'Fashion Technology (SS)'),
        ('Geo-Informatics', 'Geo-Informatics'),
        ('Handloom and Textile Technology', 'Handloom and Textile Technology'),
        ('Industrial Bio-Technology', 'Industrial Bio-Technology'),
        ('Instrumentation and Control Engineering', 'Instrumentation and Control Engineering'),
        ('Industrial Engineering', 'Industrial Engineering'),
        ('Information Science and Engineering', 'Information Science and Engineering'),
        ('Information Tech. (SS)', 'Information Tech. (SS)'),
        ('Industrial Engineering and Management', 'Industrial Engineering and Management'),
        ('Industrial Bio-Tech. (SS)', 'Industrial Bio-Tech. (SS)'),
        ('Information Technology', 'Information Technology'),
        ('Instrumentation and Control Engineering (SS)', 'Instrumentation and Control Engineering (SS)'),
        ('Leather Technology', 'Leather Technology'),
        ('Material Science and Engineering (SS)', 'Material Science and Engineering (SS)'),
        ('Mechatronics', 'Mechatronics'),
        ('Medical Electronics Engg.', 'Medical Electronics Engg.'),
        ('Mechanical Engineering', 'Mechanical Engineering'),
        ('Mechanical (Manufacturing)', 'Mechanical (Manufacturing)'),
        ('Mechatronics (SS)', 'Mechatronics (SS)'),
        ('Mechanical Engineering (Sandwich)', 'Mechanical Engineering (Sandwich)'),
        ('Mining Engineering', 'Mining Engineering'),
        ('Manufacturing Engineering', 'Manufacturing Engineering'),
        ('Mechanical and Mechatronics Engineering (Additive Manufacturing)', 'Mechanical and Mechatronics Engineering (Additive Manufacturing)'),
        ('Marine Engineering', 'Marine Engineering'),
        ('Mechanical Engineering (Sandwich) (SS)', 'Mechanical Engineering (Sandwich) (SS)'),
        ('Metallurgical Engineering', 'Metallurgical Engineering'),
        ('Mechanical and Automation Engineering', 'Mechanical and Automation Engineering'),
        ('Metallurgical Engg. (SS)', 'Metallurgical Engg. (SS)'),
        ('Nano Science and Technology', 'Nano Science and Technology'),
        ('Plastic Technology', 'Plastic Technology'),
        ('Petro Chemical Technology', 'Petro Chemical Technology'),
        ('Petrochemical Engineering', 'Petrochemical Engineering'),
        ('Petroleum Engineering', 'Petroleum Engineering'),
        ('Pharmaceutical Technology', 'Pharmaceutical Technology'),
        ('Polymer Technology', 'Polymer Technology'),
        ('Pharmaceutical Tech (SS)', 'Pharmaceutical Tech (SS)'),
        ('Production Engineering (SS)', 'Production Engineering (SS)'),
        ('Petroleum Engineering and Technology (SS)', 'Petroleum Engineering and Technology (SS)'),
        ('Production Engineering', 'Production Engineering'),
        ('Production Engineering (Sandwich) (SS)', 'Production Engineering (Sandwich) (SS)'),
        ('Printing and Packaging Technology', 'Printing and Packaging Technology'),
        ('Robotics and Automation (SS)', 'Robotics and Automation (SS)'),
        ('Robotics and Automation', 'Robotics and Automation'),
        ('Rubber and Plastic Tech.', 'Rubber and Plastic Tech.'),
        ('Computer Science and Engineering (Internet of Things and Cyber Security including Block Chain Technology)', 'Computer Science and Engineering (Internet of Things and Cyber Security including Block Chain Technology)'),
        ('Textile Chemistry', 'Textile Chemistry'),
        ('Computer science and Technology', 'Computer science and Technology'),
        ('Textile Technology (SS)', 'Textile Technology (SS)'),
        ('Textile Technology', 'Textile Technology'),
        ('Civil Engineering (Tamil Medium)', 'Civil Engineering (Tamil Medium)'),
        ('Mechanical Engineering (Tamil Medium)', 'Mechanical Engineering (Tamil Medium)'),
        ('Computer Science and Engineering (Cyber Security)', 'Computer Science and Engineering (Cyber Security)'),
    ]

    course_id = models.AutoField(primary_key=True)
    college = models.ForeignKey('College', on_delete=models.CASCADE, related_name='courses')
    
    course_code = models.CharField(max_length=20, choices=COURSE_CODE_CHOICES, help_text="Select course code")
    course_name = models.CharField(max_length=200, choices=COURSE_NAME_CHOICES, help_text="Select course name")
    
    degree_type = models.CharField(max_length=20, choices=DEGREE_TYPE_CHOICES)
    degree_name = models.CharField(max_length=50)
    duration_years = models.DecimalField(max_digits=3, decimal_places=1)
    
    intake_seats = models.IntegerField(null=True, blank=True)
    
    # Tuition Fee - MOVED FROM FEES MODEL
    tuition_fee_management = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Annual tuition fee for this course")
    tuition_fee_government = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Annual tuition fee for government quota")
    
    cutoff_oc = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    cutoff_bc = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    cutoff_bcm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    cutoff_mbc = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    cutoff_sc = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    cutoff_sca = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    cutoff_st = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    scholarship_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    scholarship_criteria = models.TextField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course_code} - {self.course_name}"

    class Meta:
        ordering = ['college__college_name', 'course_code']
        unique_together = ['college', 'course_code']
        
class Fees(models.Model):
    PAYMENT_FREQUENCY_CHOICES = [
        ('yearly', 'Yearly'),
        ('semester', 'Semester'),
        ('quarterly', 'Quarterly'),
    ]
    
    HOSTEL_ROOM_TYPE_CHOICES = [
        (1, 'Normal Room + Common Bathroom'),
        (2, 'Normal Room + Attached Bathroom'),
        (3, 'AC Room + Common Bathroom'),
        (4, 'AC Room + Attached Bathroom'),
    ]

    fee_id = models.AutoField(primary_key=True)
    college = models.ForeignKey('College', on_delete=models.CASCADE, related_name='fees')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='fees')
    academic_year = models.CharField(max_length=9)
    
    # Tuition Fee - REMOVED (now in Course model)
    
    # Hostel Fees - Store as JSON for multiple room types
    hostel_fees = models.JSONField(default=dict, blank=True, help_text="Hostel fees for different room types")
    # Example format:
    # {
    #     "1": {"fee": 45000, "available_seats": 100},  # Normal + Common
    #     "2": {"fee": 55000, "available_seats": 80},   # Normal + Attached
    #     "3": {"fee": 75000, "available_seats": 50},   # AC + Common
    #     "4": {"fee": 90000, "available_seats": 40}    # AC + Attached
    # }
    
    # Transport Fee Range
    transport_fee_min = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transport_fee_max = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # One-time fees
    admission_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Payment settings
    payment_frequency = models.CharField(max_length=20, choices=PAYMENT_FREQUENCY_CHOICES, default='yearly')
    
    # Additional notes
    fee_notes = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Fee'
        verbose_name_plural = 'Fees'
        unique_together = ['college', 'course', 'academic_year']
        ordering = ['-academic_year', 'college__college_name']
    
    @property
    def hostel_room_display(self):
        """Get display name for hostel room type"""
        return dict(self.HOSTEL_ROOM_TYPE_CHOICES)
    
    def get_hostel_fee(self, room_type):
        """Get hostel fee for specific room type"""
        return self.hostel_fees.get(str(room_type), {}).get('fee', 0)
    
    def get_all_hostel_options(self):
        """Get all hostel options with fees"""
        options = []
        for room_type, display_name in self.HOSTEL_ROOM_TYPE_CHOICES:
            fee_data = self.hostel_fees.get(str(room_type), {})
            options.append({
                'room_type': room_type,
                'room_type_display': display_name,
                'hostel_fee': float(fee_data.get('fee', 0)),
                'available_seats': fee_data.get('available_seats', 0)
            })
        return options
    
    def get_fee_summary(self):
        """Get fee summary for API response"""
        return {
            'fee_id': self.fee_id,
            'academic_year': self.academic_year,
            'admission_fee': float(self.admission_fee),
            'hostel_options': self.get_all_hostel_options(),
            'transport_fee_min': float(self.transport_fee_min),
            'transport_fee_max': float(self.transport_fee_max),
            'payment_frequency': self.payment_frequency,
            'fee_notes': self.fee_notes,
        }
    
    def __str__(self):
        course_name = self.course.course_name if self.course else "All Courses"
        return f"{self.college.college_name} - {course_name} ({self.academic_year})"

    @property
    def total_fee(self):
        """Calculate total fee without transport (uses tuition_fee from Course model)"""
        tuition = self.course.tuition_fee if self.course else 0
        return (tuition or 0) + (self.admission_fee or 0)
    
    @property
    def total_fee_with_transport_min(self):
        """Calculate total fee with minimum transport fee"""
        return self.total_fee + (self.transport_fee_min or 0)
    
    @property
    def total_fee_with_transport_max(self):
        """Calculate total fee with maximum transport fee"""
        return self.total_fee + (self.transport_fee_max or 0)
    
    @property
    def transport_fee_range(self):
        """Get transport fee range as string"""
        if self.transport_fee_min == self.transport_fee_max:
            if self.transport_fee_min == 0:
                return "Not Available"
            return f"₹ {self.transport_fee_min:,.2f}"
        return f"₹ {self.transport_fee_min:,.2f} - ₹ {self.transport_fee_max:,.2f}"

    def get_payment_frequency_display(self):
        """Get display name for payment frequency"""
        return dict(self.PAYMENT_FREQUENCY_CHOICES).get(self.payment_frequency, self.payment_frequency)
# ==================== USER PROFILE MODEL ====================
class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=10, validators=[RegexValidator(regex=r'^\d{10}$')], unique=True)
    whatsapp_number = models.CharField(max_length=10, validators=[RegexValidator(regex=r'^\d{10}$')], null=True, blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, default='Tamil Nadu')
    pincode = models.CharField(max_length=6, validators=[RegexValidator(regex=r'^\d{6}$')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        ordering = ['-created_at']


# ==================== TEAM MEMBER MODEL ====================
class TeamMember(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
        ('counselor', 'Counselor'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='team_member')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    designation = models.CharField(max_length=100, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    linkedin = models.URLField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# ==================== TIMELINE EVENT MODEL (Company Removed) ====================
class TimelineEvent(models.Model):
    EVENT_TYPES = [
        ('admission', 'Admission'),
        ('exam', 'Exam'),
        ('result', 'Result'),
        ('event', 'Event'),
        ('holiday', 'Holiday'),
        ('placement', 'Placement'),
        ('workshop', 'Workshop'),
        ('seminar', 'Seminar'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    description = models.TextField(null=True, blank=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='timeline_events', null=True, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.event_type})"

    class Meta:
        ordering = ['-start_date']