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

    COURSE_CODE_CHOICES = [
        ('AD', 'Artificial Intelligence and Data Science'),
        ('AE', 'Aeronautical Engineering'),
        ('AG', 'Agriculture Engineering'),
        ('AI', 'Agricultural and Irrigation Engineering (SS)'),
        ('AIML', 'Computer Science and Engineering (AI and Machine Learning)'),
        ('AS', 'Aerospace Engineering'),
        ('CS', 'Computer Science and Engineering'),
        ('EC', 'Electronics and Communication Engineering'),
        ('EE', 'Electrical and Electronics Engineering'),
        ('ME', 'Mechanical Engineering'),
        ('CE', 'Civil Engineering'),
        ('IT', 'Information Technology'),
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
    
    category = models.CharField(
        max_length=50, 
        choices=College.COURSE_CATEGORY_CHOICES,
        default='engineering',
        help_text="Course category (e.g., Engineering, Medical, etc.)"
    )
    
    course_code = models.CharField(max_length=20, choices=COURSE_CODE_CHOICES, help_text="Select course code")
    course_name = models.CharField(max_length=200, choices=COURSE_NAME_CHOICES, help_text="Select course name")
    
    degree_type = models.CharField(max_length=20, choices=DEGREE_TYPE_CHOICES)
   
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_course_code_display()} - {self.get_course_name_display()}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.college:
            self.college.sync_courses_offered()
    
    def delete(self, *args, **kwargs):
        college = self.college
        super().delete(*args, **kwargs)
        if college:
            college.sync_courses_offered()
    
    def get_course_code_display(self):
        return dict(self.COURSE_CODE_CHOICES).get(self.course_code, self.course_code)
    
    def get_course_name_display(self):
        return self.course_name
    
    def get_degree_type_display(self):
        return dict(self.DEGREE_TYPE_CHOICES).get(self.degree_type, self.degree_type)
    
    @property
    def category_display(self):
        return dict(College.COURSE_CATEGORY_CHOICES).get(self.category, self.category)

    class Meta:
        ordering = ['college__college_name', 'course_code']
        unique_together = ['college', 'course_code']


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


# ==================== STUDENT APPLICATION MODEL ====================
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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True)
    course_name = models.CharField(max_length=255, null=True, blank=True)
    department_name = models.CharField(max_length=255, null=True, blank=True)
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
    diploma_marks_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # UG details
    has_ug = models.BooleanField(default=False)
    ug_marks_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # File uploads
    photo = models.ImageField(upload_to=student_applications_directory_path, null=True, blank=True)
    aadhar_card = models.FileField(upload_to=student_applications_directory_path, null=True, blank=True)

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