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

    name = models.CharField(max_length=255, unique=True)
    district = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, default="Tamil Nadu", null=True, blank=True)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, null=True, blank=True)
    affiliation = models.CharField(max_length=100, choices=AFFILIATION_CHOICES, null=True, blank=True)
    fees = models.IntegerField(null=True, blank=True)
    scholarship_available = models.BooleanField(default=False)
    placement_percentage = models.IntegerField(null=True, blank=True)
    highest_package = models.IntegerField(null=True, blank=True)
    average_package = models.IntegerField(null=True, blank=True)
    top_recruiters = models.JSONField(null=True, blank=True)
    naac_grade = models.CharField(max_length=10, null=True, blank=True)
    nirf_ranking = models.IntegerField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    image = models.ImageField(upload_to='colleges/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


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
