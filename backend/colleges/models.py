from django.db import models
from django.contrib.auth.models import User

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
    
    # Using TYPE_CHOICES
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, null=True, blank=True)
    
    # Using AFFILIATION_CHOICES
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
class Course(models.Model):
    STREAM_CHOICES = [
        ('engineering', 'Engineering'),
        ('management', 'Management'),
        ('science', 'Science'),
        ('arts', 'Arts'),
        ('medical', 'Medical'),
        ('law', 'Law'),
    ]

    college = models.ForeignKey(
        College,
        on_delete=models.CASCADE,
        related_name="courses"
    )
    name = models.CharField(max_length=100)
    stream = models.CharField(max_length=50, choices=STREAM_CHOICES, null=True, blank=True)
    duration_years = models.IntegerField(null=True, blank=True)
    cutoff_oc = models.IntegerField(null=True, blank=True)
    cutoff_bc = models.IntegerField(null=True, blank=True)
    cutoff_mbc = models.IntegerField(null=True, blank=True)
    cutoff_sc = models.IntegerField(null=True, blank=True)
    cutoff_st = models.IntegerField(null=True, blank=True)
    intake = models.IntegerField(null=True, blank=True)
    fees = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.college.name}"

    class Meta:
        ordering = ['name']


class UserProfile(models.Model):
    COMMUNITY_CHOICES = [
        ('oc', 'OC'),
        ('bc', 'BC'),
        ('mbc', 'MBC'),
        ('sc', 'SC'),
        ('st', 'ST'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    community = models.CharField(max_length=10, choices=COMMUNITY_CHOICES, null=True, blank=True)
    cutoff_mark = models.IntegerField(null=True, blank=True)
    preferred_district = models.CharField(max_length=100, null=True, blank=True)
    preferred_stream = models.CharField(max_length=50, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


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


class TimelineEvent(models.Model):
    EVENT_TYPES = [
        ('admission', 'Admission'),
        ('placement', 'Placement'),
        ('event', 'Event'),
        ('holiday', 'Holiday'),
        ('exam', 'Exam'),
        ('announcement', 'Announcement'),
    ]

    title = models.CharField(max_length=255)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    description = models.TextField(null=True, blank=True)
    college = models.ForeignKey(
        College,
        on_delete=models.CASCADE,
        related_name='timeline_events',
        null=True,
        blank=True
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='timeline_events',
        null=True,
        blank=True
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.event_type})"

    class Meta:
        ordering = ['-start_date']
