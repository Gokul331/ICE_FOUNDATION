from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import datetime

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

    fee_id = models.AutoField(primary_key=True)
    college = models.ForeignKey('College', on_delete=models.CASCADE, related_name='fees')
    academic_year = models.CharField(max_length=9)
    
    transport_fee_min = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transport_fee_max = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    admission_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="One-time admission fee")
    application_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Application fee for admission")
    book_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Book/library fee")
    exam_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Examination fee")
    lab_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Laboratory fee")
    sports_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Sports facilities fee")
    
    miscellaneous_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Other miscellaneous charges")
    miscellaneous_description = models.TextField(null=True, blank=True, help_text="Description of miscellaneous fees")
    
    additional_fees = models.JSONField(default=dict, blank=True, help_text="Additional fees like: caution_deposit, alumni_fee, etc.")
    
    payment_frequency = models.CharField(max_length=20, choices=PAYMENT_FREQUENCY_CHOICES, default='yearly')
    fee_notes = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Fee'
        verbose_name_plural = 'Fees'
        unique_together = ['college', 'academic_year']
        ordering = ['-academic_year', 'college__college_name']
    
    def __str__(self):
        return f"{self.college.college_name} - Fees ({self.academic_year})"
    
    @property
    def total_one_time_fees(self):
        return (float(self.admission_fee or 0) + float(self.application_fee or 0))
    
    @property
    def total_annual_fees(self):
        return (float(self.book_fee or 0) + float(self.exam_fee or 0) + 
                float(self.lab_fee or 0) + float(self.sports_fee or 0) +
                float(self.miscellaneous_fee or 0))
    
    @property
    def total_fee(self):
        return self.total_one_time_fees + self.total_annual_fees
    
    @property
    def total_fee_with_transport_min(self):
        return self.total_fee + float(self.transport_fee_min or 0)
    
    @property
    def total_fee_with_transport_max(self):
        return self.total_fee + float(self.transport_fee_max or 0)
    
    def get_additional_fees_list(self):
        fees_list = []
        for key, value in self.additional_fees.items():
            fee_item = {
                'name': key.replace('_', ' ').title(),
                'amount': float(value.get('amount', 0)),
                'refundable': value.get('refundable', False),
                'description': value.get('description', '')
            }
            fees_list.append(fee_item)
        return fees_list
    
    def get_fee_breakdown(self):
        return {
            'one_time_fees': {
                'admission_fee': float(self.admission_fee),
                'application_fee': float(self.application_fee),
                'total_one_time': self.total_one_time_fees
            },
            'annual_fees': {
                'book_fee': float(self.book_fee),
                'exam_fee': float(self.exam_fee),
                'lab_fee': float(self.lab_fee),
                'sports_fee': float(self.sports_fee),
                'miscellaneous_fee': float(self.miscellaneous_fee),
                'total_annual': self.total_annual_fees
            },
            'transport_fees': {
                'min': float(self.transport_fee_min),
                'max': float(self.transport_fee_max)
            },
            'additional_fees': self.get_additional_fees_list(),
            'grand_total': self.total_fee
        }


class Hostel(models.Model):
    GENDER_CHOICES = [
        ('boys', 'Boys'),
        ('girls', 'Girls'),
        ('both', 'Both'),
    ]
    
    ROOM_TYPE_CHOICES = [
        (1, 'Normal Room + Common Bathroom'),
        (2, 'Normal Room + Attached Bathroom'),
        (3, 'AC Room + Common Bathroom'),
        (4, 'AC Room + Attached Bathroom'),
    ]
    
    hostel_id = models.AutoField(primary_key=True)
    college = models.ForeignKey('College', on_delete=models.CASCADE, related_name='hostels')
    name = models.CharField(max_length=100, help_text="Hostel name (e.g., 'Boys Hostel - Block A', 'Ladies Hostel')")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='boys')
    room_type = models.IntegerField(choices=ROOM_TYPE_CHOICES, help_text="Type of room")
    
    fee_per_semester = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fee_per_year = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    caution_deposit = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Refundable caution deposit")
    
    total_rooms = models.IntegerField(default=1, help_text="Total number of rooms of this type")
    capacity_per_room = models.IntegerField(default=2, help_text="Number of students per room")
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['college__college_name', 'name', 'room_type']
        unique_together = ['college', 'name', 'room_type']
        verbose_name = 'Hostel'
        verbose_name_plural = 'Hostels'
    
    def __str__(self):
        room_type_display = dict(self.ROOM_TYPE_CHOICES).get(self.room_type, 'Unknown')
        return f"{self.college.college_name} - {self.name} ({room_type_display})"
    
    @property
    def room_type_display(self):
        return dict(self.ROOM_TYPE_CHOICES).get(self.room_type)
    
    @property
    def total_capacity(self):
        return self.total_rooms * self.capacity_per_room
    
    @property
    def total_fee_with_deposit(self):
        return self.fee_per_year + self.caution_deposit


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


# ==================== STUDENT APPLICATION MODEL ====================
def student_applications_directory_path(instance, filename):
    """Generate upload path for student application files"""
    return f'applications/{instance.application_id}/{filename}'


class StudentApplication(models.Model):
    APPLICATION_STATUS = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    QUOTA_TYPE = [
        ('management', 'Management Quota'),
        ('government', 'Government Quota'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    RESULT_STATUS = [
        ('declared', 'Declared'),
        ('awaited', 'Awaited'),
    ]

    MARITAL_STATUS = [
        ('single', 'Single'),
        ('married', 'Married')
    ]

    BLOOD_GROUP = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]

    COMMUNITY_CHOICES = [
        ('OC', 'OC'),
        ('BC', 'BC'),
        ('MBC', 'MBC'),
        ('SC', 'SC'),
        ('ST', 'ST'),
        ('SCA', 'SCA'),
        ('BCM', 'BCM'),
        ('DNC', 'DNC'),
    ]

    application_id = models.CharField(max_length=50, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True)
    course_name = models.CharField(max_length=255, null=True, blank=True)
    quota_type = models.CharField(max_length=20, choices=QUOTA_TYPE, default='management')
    status = models.CharField(max_length=20, choices=APPLICATION_STATUS, default='submitted')
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Bio-data
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    mobile_number = models.CharField(max_length=10, blank=True)
    email_id = models.EmailField()
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP, blank=True)
    nationality = models.CharField(max_length=50, default='Indian')
    community = models.CharField(max_length=10, choices=COMMUNITY_CHOICES, blank=True)
    sub_caste = models.CharField(max_length=50, blank=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS, blank=True)
    mother_tongue = models.CharField(max_length=30, blank=True)
    aadhar_number = models.CharField(max_length=14, blank=True)
    first_graduation = models.CharField(max_length=255, blank=True)

    # Parent's details
    father_name = models.CharField(max_length=100, blank=True)
    father_mobile = models.CharField(max_length=10, blank=True)
    father_occupation = models.CharField(max_length=100, blank=True)
    mother_name = models.CharField(max_length=100, blank=True)
    mother_mobile = models.CharField(max_length=10, blank=True)
    mother_occupation = models.CharField(max_length=100, blank=True)
    family_annual_income = models.CharField(max_length=100, null=True, blank=True)

    # Address details
    address_line1 = models.TextField(blank=True)
    address_line2 = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=6, blank=True)

    # 10th details
    tenth_school_name = models.CharField(max_length=255, blank=True)
    tenth_board = models.CharField(max_length=50, blank=True)
    tenth_year_of_passing = models.IntegerField(null=True, blank=True)
    tenth_result_status = models.CharField(max_length=20, choices=RESULT_STATUS, blank=True)
    tenth_marks_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # 12th details
    twelfth_school_name = models.CharField(max_length=255, blank=True)
    twelfth_board = models.CharField(max_length=50, blank=True)
    twelfth_year_of_passing = models.IntegerField(null=True, blank=True)
    twelfth_result_status = models.CharField(max_length=20, choices=RESULT_STATUS, blank=True)
    twelfth_marks_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # Diploma details
    has_diploma = models.BooleanField(default=False)
    diploma_college_name = models.CharField(max_length=255, blank=True)
    diploma_board_university = models.CharField(max_length=100, blank=True)
    diploma_year_of_passing = models.IntegerField(null=True, blank=True)
    diploma_result_status = models.CharField(max_length=20, choices=RESULT_STATUS, blank=True)
    diploma_marks_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # UG details
    has_ug = models.BooleanField(default=False)
    ug_college_name = models.CharField(max_length=255, blank=True)
    ug_board_university = models.CharField(max_length=100, blank=True)
    ug_year_of_passing = models.IntegerField(null=True, blank=True)
    ug_result_status = models.CharField(max_length=20, choices=RESULT_STATUS, blank=True)
    ug_marks_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # File uploads
    photo = models.ImageField(upload_to=student_applications_directory_path, null=True, blank=True)
    aadhar_card = models.FileField(upload_to=student_applications_directory_path, null=True, blank=True)
    tenth_marksheet = models.FileField(upload_to=student_applications_directory_path, null=True, blank=True)
    twelfth_marksheet = models.FileField(upload_to=student_applications_directory_path, null=True, blank=True)
    diploma_marksheet = models.FileField(upload_to=student_applications_directory_path, null=True, blank=True)
    ug_marksheet = models.FileField(upload_to=student_applications_directory_path, null=True, blank=True)
    community_marksheet = models.FileField(upload_to=student_applications_directory_path, null=True, blank=True)
    pdf_copy = models.FileField(upload_to='applications/pdfs/', null=True, blank=True)
    
    # Declaration
    declaration_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.application_id} - {self.first_name} {self.last_name}"

    class Meta:
        verbose_name = 'Student Application'
        verbose_name_plural = 'Student Applications'
        ordering = ['-submitted_at']
    
    def save(self, *args, **kwargs):
        if not self.application_id:
            self.application_id = f'APP-{self.user.id}-{datetime.now().strftime("%Y%m%d%H%M%S")}'
        super().save(*args, **kwargs)


# ==================== TIMELINE EVENT MODEL ====================
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