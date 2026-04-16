from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model for ICE Foundation."""
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return self.username


class UserProfile(models.Model):
    """Extended profile information for users."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    avatar = models.URLField(blank=True)
    cutoff_mark = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    community_category = models.CharField(max_length=50, blank=True)
    preferred_branch = models.CharField(max_length=100, blank=True)
    preferred_district = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username}'s profile"


class College(models.Model):
    """College model for storing college information."""
    TYPE_CHOICES = [
        ('Government', 'Government'),
        ('Private', 'Private'),
        ('Deemed', 'Deemed'),
        ('Autonomous', 'Autonomous'),
    ]

    BRANCH_CHOICES = [
        ('Engineering', 'Engineering'),
        ('Arts & Science', 'Arts & Science'),
        ('Management', 'Management'),
        ('Medical', 'Medical'),
        ('Law', 'Law'),
    ]

    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    branch = models.CharField(max_length=100, choices=BRANCH_CHOICES)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    cutoff_mark = models.DecimalField(max_digits=6, decimal_places=2)
    community_category = models.CharField(max_length=50)
    scholarship_available = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'College'
        verbose_name_plural = 'Colleges'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.branch}"


class TeamMember(models.Model):
    """Team member model for company about page."""
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    bio = models.TextField()
    avatar_initials = models.CharField(max_length=10)
    avatar_color = models.CharField(max_length=20, default='#87CEEB')
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Team Member'
        verbose_name_plural = 'Team Members'
        ordering = ['order']

    def __str__(self):
        return self.name


class TimelineEvent(models.Model):
    """Timeline event for company history."""
    year = models.IntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField()
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Timeline Event'
        verbose_name_plural = 'Timeline Events'
        ordering = ['order']

    def __str__(self):
        return f"{self.year} - {self.title}"


class CompanyStat(models.Model):
    """Company statistics for about page."""
    label = models.CharField(max_length=255)
    value = models.CharField(max_length=50)
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Company Stat'
        verbose_name_plural = 'Company Stats'
        ordering = ['order']

    def __str__(self):
        return f"{self.value} - {self.label}"