from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('user/<int:user_id>/', views.user_detail, name='user_detail'),
    path('user/<int:user_id>/profile/', views.update_profile, name='update_profile'),
    path('colleges/', views.colleges_list, name='colleges_list'),
    path('colleges/<int:college_id>/', views.college_detail, name='college_detail'),
    path('college-suggestions/', views.college_suggestions, name='college_suggestions'),
    path('team-members/', views.team_members, name='team_members'),
    path('timeline-events/', views.timeline_events, name='timeline_events'),
    path('company-stats/', views.company_stats, name='company_stats'),
]