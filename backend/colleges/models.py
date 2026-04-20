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
        ('autonomous', 'Autonomous'),
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

    course_id = models.AutoField(primary_key=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='courses')
    course_name = models.CharField(max_length=150)
    course_code = models.CharField(max_length=20, null=True, blank=True)
    degree_type = models.CharField(max_length=20, choices=DEGREE_TYPE_CHOICES)
    degree_name = models.CharField(max_length=50)
    duration_years = models.DecimalField(max_digits=3, decimal_places=1)
    specialization = models.CharField(max_length=100, null=True, blank=True)
    intake_seats = models.IntegerField(null=True, blank=True)
    
    cutoff_oc = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Cutoff mark for OC")
    cutoff_bc = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Cutoff mark for BC")
    cutoff_bcm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Cutoff mark for BCM")
    cutoff_mbc = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Cutoff mark for MBC")
    cutoff_sc = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Cutoff mark for SC")
    cutoff_sca = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Cutoff mark for SCA")
    cutoff_st = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Cutoff mark for ST")
    
    scholarship_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Scholarship amount in INR per year")
    scholarship_criteria = models.TextField(null=True, blank=True, help_text="Eligibility criteria for scholarship")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course_name} - {self.degree_name} ({self.college.college_name})"

    def get_cutoff_by_community(self, community):
        community_field_map = {
            'OC': 'cutoff_oc', 'BC': 'cutoff_bc', 'BCM': 'cutoff_bcm',
            'MBC': 'cutoff_mbc', 'SC': 'cutoff_sc', 'SCA': 'cutoff_sca', 'ST': 'cutoff_st',
        }
        field_name = community_field_map.get(community.upper())
        return getattr(self, field_name, None) if field_name else None

    class Meta:
        ordering = ['college__college_name', 'course_name']
        unique_together = ['college', 'course_code']


# ==================== FEES MODEL ====================
class Fees(models.Model):
    PAYMENT_FREQUENCY_CHOICES = [
        ('yearly', 'Yearly'),
        ('semester', 'Semester'),
        ('quarterly', 'Quarterly'),
    ]

    fee_id = models.AutoField(primary_key=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='fees')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='fees', help_text="NULL = common for all courses")
    academic_year = models.CharField(max_length=9)
    
    tuition_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    hostel_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mess_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transport_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    admission_fee_one_time = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    payment_frequency = models.CharField(max_length=20, choices=PAYMENT_FREQUENCY_CHOICES, default='yearly')
    scholarship_available = models.BooleanField(default=False)
    scholarship_details = models.TextField(null=True, blank=True, help_text="Criteria and amount")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Fee'
        verbose_name_plural = 'Fees'
        unique_together = ['college', 'course', 'academic_year']
        ordering = ['-academic_year', 'college__college_name']
    
    @property
    def total_fee(self):
        return self.tuition_fee + self.hostel_fee + self.mess_fee + self.transport_fee + self.admission_fee_one_time
    
    def __str__(self):
        course_name = self.course.course_name if self.course else "All Courses"
        return f"{self.college.college_name} - {course_name} ({self.academic_year})"


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