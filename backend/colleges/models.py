from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import datetime
from django.core.exceptions import ValidationError

# ==================== COLLEGE MODEL ====================
class College(models.Model):
    
    COURSE_CATEGORY_CHOICES = [
        ('engineering', 'Engineering and Technology'),
        ('arts_science', 'Arts and Science'),
        ('polytechnic', 'Polytechnic'),
        ('allied_health_science', 'Allied Health Science'),
        ('medical', 'Medical'),
        ('law', 'Law'),
        ('nursing', 'Nursing'),
        ('management', 'Management'),
        ('computer_applications', 'Computer Applications'),
        ('pharmacy', 'Pharmacy'),
        ('agriculture', 'Agricultural Science'),
        ('physiotherapy', 'Physiotherapy'),
        ('occupational_therapy', 'Occupational Therapy'),
        ('architecture', 'Architecture'),
        ('education', 'Education'),
        ('physical_education', 'Physical Education'),
    ]
    
    college_id = models.AutoField(primary_key=True)
    college_name = models.CharField(max_length=200, unique=True)
    short_name = models.CharField(max_length=50, null=True, blank=True)
    
    courses_offered = models.JSONField(
        default=list, 
        blank=True, 
        help_text='List of course categories offered by the college. Format: ["engineering", "pharmacy", "law"]'
    )
    
    # ========== IMAGE FIELDS =========
    college_images = models.JSONField(
        default=list,
        blank=True,
        help_text='Array of image URLs for college campus, facilities, etc. Format: ["https://example.com/image1.jpg"]'
    )
    
    banner_image = models.URLField(max_length=500, null=True, blank=True, help_text="Banner image for college page")
    campus_images = models.JSONField(
        default=list,
        blank=True,
        help_text='Array of campus photos. Format: ["https://example.com/campus1.jpg"]'
    )
    
    location_city = models.CharField(max_length=100)
    location_state = models.CharField(max_length=100)
    location_pincode = models.CharField(max_length=10, null=True, blank=True)
    
    address = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.college_name
    
    def clean(self):
        """Validate courses_offered contains valid categories"""
        if self.courses_offered:
            valid_categories = [choice[0] for choice in self.COURSE_CATEGORY_CHOICES]
            for course in self.courses_offered:
                if course not in valid_categories:
                    raise ValidationError(
                        f"'{course}' is not a valid course category. "
                        f"Valid options: {valid_categories}"
                    )
    
    def save(self, *args, **kwargs):
        # Only validate, don't auto-sync
        self.full_clean()
        super().save(*args, **kwargs)
    
    def sync_courses_offered(self):
        """Manually synchronize courses_offered JSONField with actual Course objects"""
        if hasattr(self, 'courses'):
            # Get unique categories from actual courses
            actual_categories = list(set(
                self.courses.filter(is_active=True)
                .values_list('category', flat=True)
                .distinct()
            ))
            # Update if changed
            if set(self.courses_offered or []) != set(actual_categories):
                # Use update to avoid recursion
                College.objects.filter(pk=self.pk).update(courses_offered=actual_categories)
                # Update the instance's attribute
                self.courses_offered = actual_categories
                return True
        return False
    
    def get_available_categories(self):
        """Get categories that are offered by this college"""
        if self.courses_offered:
            return [(cat, dict(self.COURSE_CATEGORY_CHOICES).get(cat, cat)) 
                    for cat in self.courses_offered]
        return []
    
    def get_courses_by_category(self, category=None):
        """Get all courses, optionally filtered by category"""
        queryset = self.courses.filter(is_active=True)
        if category:
            queryset = queryset.filter(category=category)
        return queryset
    
    def get_degree_types_for_category(self, category):
        """Get unique degree types for a specific category"""
        if category:
            return self.courses.filter(
                is_active=True,
                category=category
            ).values_list('degree_type', flat=True).distinct()
        return []
    
    def get_courses_by_category_and_degree(self, category, degree_type):
        """Get courses filtered by category and degree type"""
        if category and degree_type:
            return self.courses.filter(
                is_active=True,
                category=category,
                degree_type=degree_type
            )
        return self.courses.none()
    
    @property
    def courses_count(self):
        """Total number of active courses"""
        return self.courses.filter(is_active=True).count()
    
    @property
    def unique_course_categories(self):
        """Get unique course categories with counts"""
        from django.db.models import Count
        return self.courses.filter(is_active=True)\
            .values('category')\
            .annotate(count=Count('category'))\
            .order_by('category')
    
    # ========== IMAGE HELPER METHODS ==========
    
    @property
    def all_images(self):
        """Get all college images as a single list"""
        images = []
        if self.college_images:
            images.extend(self.college_images)
        if self.campus_images:
            images.extend(self.campus_images)
        return images
    
    @property
    def has_gallery(self):
        """Check if college has any gallery images"""
        return bool(self.all_images)
    
    @property
    def primary_image(self):
        """Get the primary/cover image for the college"""
        if self.banner_image:
            return self.banner_image
        if self.college_images and len(self.college_images) > 0:
            return self.college_images[0]
        if self.campus_images and len(self.campus_images) > 0:
            return self.campus_images[0]
        return None
    
    def add_image(self, image_url, category='general'):
        """Add an image to the specified category"""
        if category == 'general':
            if not self.college_images:
                self.college_images = []
            if image_url not in self.college_images:
                self.college_images.append(image_url)
                self.save()
        elif category == 'campus':
            if not self.campus_images:
                self.campus_images = []
            if image_url not in self.campus_images:
                self.campus_images.append(image_url)
                self.save()
    
    def remove_image(self, image_url, category='general'):
        """Remove an image from the specified category"""
        if category == 'general' and self.college_images:
            if image_url in self.college_images:
                self.college_images.remove(image_url)
                self.save()
        elif category == 'campus' and self.campus_images:
            if image_url in self.campus_images:
                self.campus_images.remove(image_url)
                self.save()
    
    def get_images_by_category(self, category):
        """Get images by specific category"""
        category_map = {
            'general': self.college_images,
            'campus': self.campus_images,
        }
        return category_map.get(category, [])
    
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

    # ==================== ENGINEERING COURSES ====================
    ENGINEERING_COURSE_CHOICES = [
        ('AD', 'Artificial Intelligence and Data Science'),
        ('CS', 'Computer Science and Engineering'),
        ('CS_CYBER', 'Computer Science and Engineering (Cyber Security)'),
        ('IT', 'Information Technology'),
        ('AIML', 'Artificial Intelligence and Machine Learning'),
        ('EC', 'Electronics and Communication Engineering'),
        ('CS_IOT', 'Computer Science Engineering with IOT'),
        ('BT', 'Bio Technology'),
        ('BME', 'Biomedical Engineering'),
        ('EEE', 'Electrical and Electronics Engineering'),
        ('ME', 'Mechanical Engineering'),
        ('AE', 'Aeronautical Engineering'),
        ('CE', 'Civil Engineering'),
        ('FT', 'Food Technology'),
        ('AG', 'Agriculture Engineering'),
        ('ROBO_AI', 'Robotics and Artificial Intelligence'),
        ('MECHATRONICS', 'Mechatronics Engineering'),
        ('ENV', 'Environmental Science and Technology'),
        ('ECE', 'Electrical and Computer Engineering'),
        ('MCA', 'Master of Computer Applications'),
        ('MBA', 'Master of Business Administration'),
        ('ME_CADCAM', 'M.E - CAD/CAM'),
        ('ME_CSE', 'M.E - Computer Science and Engineering'),
        ('ME_CS', 'M.E - Communication Systems'),
        ('ME_PED', 'M.E - Power Electronics and Drives'),
    ]

    # ==================== ARTS & SCIENCE COURSES ====================
    ARTS_SCIENCE_COURSE_CHOICES = [
        ('BCOM', 'B.Com'),
        ('BCOM_CA', 'B.Com - Computer Applications'),
        ('BCOM_PA', 'B.Com - Professional Accounting'),
        ('BCA', 'B.C.A'),
        ('BSC_CS', 'B.Sc - Computer Science'),
        ('BSC_AI_DS', 'B.Sc - Artificial Intelligence & Data Science'),
        ('BSC_IT', 'B.Sc - Information Technology'),
        ('BSC_CYBER', 'B.Sc - Cyber Security & Ethical Hacking'),
        ('BBA', 'B.B.A'),
        ('BBA_LOGISTICS', 'B.B.A - Logistic & Supply Chain Management'),
        ('BSC_DATA_SCIENCE', 'B.Sc - Data Science & Analytics'),
        ('BSC_IOT', 'B.Sc Internet of Things (IoT)'),
        ('BSC_DEFENCE', 'B.Sc - Defence and Strategic Studies'),
        ('BSC_VISUAL_COMM', 'B.Sc - Visual Communication'),
        ('BSC_FORENSIC', 'B.Sc - Forensic Science'),
        ('BBA_AVIATION', 'B.B.A - Aviation Management'),
        ('BA_ENGLISH', 'B.A English'),
        ('BA_PUBLIC_ADMIN', 'B.A Public Administration'),
        ('BA_SOCIAL_WORK', 'B.A Social Work'),
        ('BSC_HOTEL_MGT', 'B.Sc - Hotel Management & Catering Science'),
        ('BSC_AIML', 'B.Sc - Artificial Intelligence and Machine Learning'),
        ('BSC_BC', 'B.Sc - Biochemistry'),
        ('BSC_BT', 'B.Sc - Biotechnology'),
        ('BSC_MB', 'B.Sc - Microbiology'),
        ('BSC_MATHS', 'B.Sc - Mathematics'),
        ('BSC_FTCD', 'B.Sc - Fashion Technology and Costume Designing'),
        ('MA_TAMIL', 'M.A Tamil'),
        ('MA_ENGLISH', 'M.A English'),
        ('MSC_CS', 'M.Sc Computer Science'),
        ('MSC_IT', 'M.Sc Information Technology'),
        ('MCOM', 'M.Com'),
        ('MCOM_CA', 'M.Com (CA)'),
        ('MCA', 'M.C.A'),
        ('MSC_BIOCHEM', 'MSc Biochemistry'),
        ('MSC_BIO_TECH', 'M.Sc Biotechnology'),
        ('MSC_MATHS', 'M.Sc Mathematics'),
        ('MSC_MICRO', 'M.Sc Microbiology'),
        ('MSC_PHYSICS', 'M.Sc Physics'),
        ('MSC_CHEMISTRY', 'M.Sc Chemistry'),
    ]

    # ==================== ALLIED HEALTH SCIENCE COURSES ====================
    ALLIED_HEALTH_COURSE_CHOICES = [
        ('BSC_AECT', 'B.Sc - Accident and Emergency Care Technology'),
        ('BSC_CPPT', 'B.Sc - Cardio Pulmonary and Perfusion Technology'),
        ('BSC_CVT', 'B.Sc - Cardio Vascular Technology'),
        ('BSC_CCT', 'B.Sc - Critical Care Technology'),
        ('BSC_DT', 'B.Sc - Dialysis Technology'),
        ('BSC_MLT', 'B.Sc - Medical Laboratory Technology'),
        ('BSC_OTAT', 'B.Sc - Operation Theatre and Anaesthesia Technology'),
        ('BSC_APBH', 'B.Sc - Applied Psychology and Behavioural Health'),
        ('BSC_CND', 'B.Sc - Nutrition and Dietetics'),
        ('BSC_NEP', 'B.Sc - Neuro Electro Physiology'),
        ('BOPTOM', 'B.Optometry'),
        ('BSC_PA', 'B.Sc - Physician Assistant'),
        ('BSC_RIT', 'B.Sc - Radiography and Imaging Technology'),
        ('MSC_AT', 'M.Sc - Anaesthesia Tech'),
        ('MSC_DT', 'M.Sc - Dialysis Technology'),
        ('MSC_MM', 'M.Sc - Medical Microbiology'),
        ('MSC_MB', 'M.Sc - Medical Biochemistry'),
        ('MSC_RIT', 'M.Sc - Radiography and Imaging Tech'),
        ('MSC_AECT', 'M.Sc - Accident and Emergency Care'),
    ]

    # ==================== PHARMACY COURSES ====================
    PHARMACY_COURSE_CHOICES = [
        ('BPHARM', 'B.Pharm - Bachelor of Pharmacy'),
        ('DPHARM', 'D.Pharm - Diploma in Pharmacy'),
        ('MPHARM_PHARM', 'M.Pharm - Pharmaceuticals'),
        ('MPHARM_ANALYSIS', 'M.Pharm - Pharmaceutical Analysis'),
        ('MPHARM_PCOG', 'M.Pharm - Pharmacognosy'),
        ('PHARMD', 'Pharm.D'),
    ]

    # ==================== NURSING COURSES ====================
    NURSING_COURSE_CHOICES = [
        ('BSC_NURSING', 'B.Sc - Nursing'),
        ('GNM', 'GNM - General Nursing and Midwifery'),
        ('PB_BSC_NURSING', 'Post Basic B.Sc - Nursing'),
        ('MSC_NURSING', 'M.Sc - Nursing'),
    ]

    # ==================== PHYSIOTHERAPY COURSES ====================
    PHYSIOTHERAPY_COURSE_CHOICES = [
        ('BPT', 'B.P.T - Bachelor of Physiotherapy'),
        ('MPT_MUSCULOSKELETAL', 'M.P.T - Musculoskeletal Science'),
        ('MPT_ORTHO', 'M.P.T - Orthopaedics'),
        ('MPT_NEURO', 'M.P.T - Neurology'),
        ('MPT_SPORTS', 'M.P.T - Sports & Fitness'),
    ]

    # ==================== OCCUPATIONAL THERAPY COURSES ====================
    OCCUPATIONAL_THERAPY_COURSE_CHOICES = [
        ('BOT', 'B.O.T - Bachelor of Occupational Therapy'),
    ]

    # ==================== AGRICULTURE COURSES ====================
    AGRICULTURE_COURSE_CHOICES = [
        ('BSC_AGRI_HONS', 'B.Sc (Hons) Agriculture'),
        ('BSC_HORT_HONS', 'B.Sc (Hons) Horticulture'),
    ]

    # ==================== ARCHITECTURE COURSES ====================
    ARCHITECTURE_COURSE_CHOICES = [
        ('BARCH', 'B.Arch - Bachelor of Architecture'),
        ('BDES_INTERIOR', 'B.Des - Interior Design'),
    ]

    # ==================== LAW COURSES ====================
    LAW_COURSE_CHOICES = [
        ('BA_LLB', 'B.A. LLB (Hons.)'),
        ('BBA_LLB', 'B.B.A. LLB (Hons.)'),
        ('BCOM_LLB', 'B.Com. LLB (Hons.)')
    ]

    # ==================== MANAGEMENT COURSES ====================
    MANAGEMENT_COURSE_CHOICES = [
        ('MBA', 'M.B.A - Master of Business Administration'),
    ]

    # ==================== COMPUTER APPLICATIONS COURSES ====================
    COMPUTER_APPLICATIONS_COURSE_CHOICES = [
        ('MCA', 'M.C.A - Master of Computer Applications'),
    ]

    # ==================== POLYTECHNIC COURSES ====================
    POLYTECHNIC_COURSE_CHOICES = [
        ('DIP_CE', 'Diploma in Computer Engineering'),
        ('DIP_EEE', 'Diploma in Electrical & Electronics Engineering'),
        ('DIP_ME', 'Diploma in Mechanical Engineering'),
    ]

    # ==================== EDUCATION COURSES ====================
    EDUCATION_COURSE_CHOICES = [
        ('BED', 'B.Ed - Bachelor of Education'),
        ('MED', 'M.Ed - Master of Education'),
        ('BPED', 'B.P.Ed - Bachelor of Physical Education'),
        ('BPES', 'B.P.E.S - Bachelor of Physical Education and Sports'),
    ]

    # Combined course name choices based on category
    COURSE_NAME_CHOICES = (
        # Engineering
        *[(code, name) for code, name in ENGINEERING_COURSE_CHOICES],
        # Arts & Science
        *[(code, name) for code, name in ARTS_SCIENCE_COURSE_CHOICES],
        # Allied Health
        *[(code, name) for code, name in ALLIED_HEALTH_COURSE_CHOICES],
        # Pharmacy
        *[(code, name) for code, name in PHARMACY_COURSE_CHOICES],
        # Nursing
        *[(code, name) for code, name in NURSING_COURSE_CHOICES],
        # Physiotherapy
        *[(code, name) for code, name in PHYSIOTHERAPY_COURSE_CHOICES],
        # Occupational Therapy
        *[(code, name) for code, name in OCCUPATIONAL_THERAPY_COURSE_CHOICES],
        # Agriculture
        *[(code, name) for code, name in AGRICULTURE_COURSE_CHOICES],
        # Architecture
        *[(code, name) for code, name in ARCHITECTURE_COURSE_CHOICES],
        # Law
        *[(code, name) for code, name in LAW_COURSE_CHOICES],
        # Management
        *[(code, name) for code, name in MANAGEMENT_COURSE_CHOICES],
        # Computer Applications
        *[(code, name) for code, name in COMPUTER_APPLICATIONS_COURSE_CHOICES],
        # Polytechnic
        *[(code, name) for code, name in POLYTECHNIC_COURSE_CHOICES],
        # Education
        *[(code, name) for code, name in EDUCATION_COURSE_CHOICES],
    )

    course_id = models.AutoField(primary_key=True)
    college = models.ForeignKey('College', on_delete=models.CASCADE, related_name='courses')
    
    category = models.CharField(
        max_length=50, 
        choices=College.COURSE_CATEGORY_CHOICES,
        default='engineering',
        help_text="Course category (e.g., Engineering, Medical, etc.)"
    )
    
    course_code = models.CharField(
        max_length=100,
        choices=COURSE_NAME_CHOICES, 
        help_text="Select course"
    )
    course_name = models.CharField(max_length=200, help_text="Course name")
    
    degree_type = models.CharField(max_length=20, choices=DEGREE_TYPE_CHOICES)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_course_code_display()} - {self.college.college_name}"

    def clean(self):
        """Validate that course_code is a valid choice"""
        super().clean()
        
        valid_codes = [code for code, name in self.COURSE_NAME_CHOICES]
        
        if self.course_code and self.course_code not in valid_codes:
            valid_names = [name for code, name in self.COURSE_NAME_CHOICES]
            if self.course_code in valid_names:
                for code, name in self.COURSE_NAME_CHOICES:
                    if name == self.course_code:
                        self.course_code = code
                        break
            else:
                raise ValidationError({
                    'course_code': f"'{self.course_code}' is not a valid course code. Please select from the dropdown."
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        
        if self.course_code:
            course_dict = dict(self.COURSE_NAME_CHOICES)
            self.course_name = course_dict.get(self.course_code, self.course_code)
        
        super().save(*args, **kwargs)
        
        if self.college:
            self.college.sync_courses_offered()
    
    def delete(self, *args, **kwargs):
        college = self.college
        super().delete(*args, **kwargs)
        if college:
            college.sync_courses_offered()
    
    def get_course_code_display(self):
        return dict(self.COURSE_NAME_CHOICES).get(self.course_code, self.course_code)
    
    def get_course_name_display(self):
        return self.course_name
    
    def get_degree_type_display(self):
        return dict(self.DEGREE_TYPE_CHOICES).get(self.degree_type, self.degree_type)
    
    @property
    def category_display(self):
        return dict(College.COURSE_CATEGORY_CHOICES).get(self.category, self.category)
    
    @property
    def full_course_display(self):
        return f"{self.get_course_code_display()} - {self.course_name}"

    class Meta:
        ordering = ['college__college_name', 'category', 'course_name']
        unique_together = ['college', 'course_code']


# Helper function to get courses by category
def get_courses_by_category(category):
    """Returns list of course choices based on category"""
    category_mapping = {
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
    return category_mapping.get(category, [])


# ==================== USER PROFILE MODEL ====================
class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, default='')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=10, validators=[RegexValidator(regex=r'^\d{10}$')], unique=True)
    whatsapp_number = models.CharField(max_length=10, validators=[RegexValidator(regex=r'^\d{10}$')], null=True, blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6, validators=[RegexValidator(regex=r'^\d{6}$')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        ordering = ['-created_at']


# ==================== STUDENT APPLICATION MODEL WITH NO LOGIN REQUIRED ====================
def student_applications_directory_path(instance, filename):
    """Generate upload path for student application files"""
    return f'applications/{instance.application_id}/{filename}'


class EnquiryForm(models.Model):
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
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
    # IMPORTANT: user field is now optional (null=True, blank=True) for anonymous submissions
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Direct relationship to Course
    selected_course = models.ForeignKey(
        Course, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='enquiries',
        help_text="The selected course from the Course model"
    )
    
    # Keep these for backward compatibility and display purposes
    course_name = models.CharField(max_length=255, null=True, blank=True)
    department_name = models.CharField(max_length=255, null=True, blank=True)
    
    # Store the selection path for reference
    selected_category = models.CharField(
        max_length=50, 
        choices=College.COURSE_CATEGORY_CHOICES,
        null=True, 
        blank=True,
        help_text="Selected course category"
    )
    selected_degree_type = models.CharField(
        max_length=20, 
        choices=Course.DEGREE_TYPE_CHOICES,
        null=True, 
        blank=True,
        help_text="Selected degree type"
    )
    
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
    community = models.CharField(max_length=10, choices=COMMUNITY_CHOICES, blank=True)
    aadhar_number = models.CharField(max_length=14, blank=True)

    # Parent's details
    father_name = models.CharField(max_length=100, blank=True)
    father_mobile = models.CharField(max_length=10, blank=True)
    mother_name = models.CharField(max_length=100, blank=True)
    mother_mobile = models.CharField(max_length=10, blank=True)

    # Address details
    address_line1 = models.TextField(blank=True)
    address_line2 = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=6, blank=True)

    # Education details
    tenth_marks_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    twelfth_marks_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # Diploma details
    has_diploma = models.BooleanField(default=False)
    diploma_marks_percentage = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)

    # UG details
    has_ug = models.BooleanField(default=False)
    ug_marks_percentage = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)

    # Reference field - who referred the student
    reference_name = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text="Name of the person who referred the student (optional)"
    )

    # File uploads
    photo = models.ImageField(upload_to=student_applications_directory_path, null=True, blank=True)
    aadhar_card = models.FileField(upload_to=student_applications_directory_path, null=True, blank=True)

    def __str__(self):
        course_info = f" - {self.course_name}" if self.course_name else ""
        reference_info = f" (Referred by: {self.reference_name})" if self.reference_name else ""
        return f"{self.application_id} - {self.first_name} {self.last_name}{course_info}{reference_info}"

    class Meta:
        verbose_name = 'Student Application'
        verbose_name_plural = 'Student Applications'
        ordering = ['-submitted_at']
    
    def save(self, *args, **kwargs):
        if not self.application_id:
            if self.user and self.user.id:
                self.application_id = f'APP-{self.user.id}-{datetime.now().strftime("%Y%m%d%H%M%S")}'
            else:
                # For anonymous users, use email or mobile to generate ID
                identifier = self.email_id or self.mobile_number or 'anonymous'
                # Clean the identifier to remove special characters
                clean_identifier = ''.join(c for c in identifier if c.isalnum())[:30]
                self.application_id = f'APP-{clean_identifier}-{datetime.now().strftime("%Y%m%d%H%M%S")}'
        
        # Auto-populate course_name and department_name from selected_course
        if self.selected_course:
            self.course_name = self.selected_course.course_name
            self.department_name = self.selected_course.get_course_code_display()
            self.selected_category = self.selected_course.category
            self.selected_degree_type = self.selected_course.degree_type
            if not self.college:
                self.college = self.selected_course.college
        
        super().save(*args, **kwargs)
    
    @property
    def selection_completed(self):
        """Check if all selection steps are completed"""
        return all([
            self.college,
            self.selected_category,
            self.selected_degree_type,
            self.selected_course
        ])
    
    @property
    def selection_path_display(self):
        """Display the full selection path"""
        if self.selection_completed:
            return f"{self.college.college_name} → {self.get_selected_category_display()} → {self.get_selected_degree_type_display()} → {self.course_name}"
        return "Selection incomplete"
    
    def get_selected_category_display(self):
        """Get display name for selected category"""
        return dict(College.COURSE_CATEGORY_CHOICES).get(self.selected_category, self.selected_category)
    
    def get_selected_degree_type_display(self):
        """Get display name for selected degree type"""
        return dict(Course.DEGREE_TYPE_CHOICES).get(self.selected_degree_type, self.selected_degree_type)