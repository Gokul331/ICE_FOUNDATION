#!/usr/bin/env python
import os
import django
import sys

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from colleges.models import College, Course

def test_suggestion():
    print(f"Colleges: {College.objects.count()}")
    print(f"Courses: {Course.objects.count()}")

    # Test suggestion logic
    cutoff = 196  # Higher cutoff to match Anna University CS
    community = 'oc'
    course_name = 'Computer Science and Engineering'
    district = 'Chennai'

    cutoff_field = f'cutoff_{community.lower()}'
    courses = Course.objects.filter(**{cutoff_field + '__lte': cutoff})
    print(f'Courses with cutoff <= {cutoff} for {community}: {courses.count()}')

    if course_name:
        courses = courses.filter(course_name__icontains=course_name)
        print(f'Courses matching "{course_name}": {courses.count()}')

    college_ids = courses.values_list('college_id', flat=True).distinct()
    colleges = College.objects.filter(college_id__in=college_ids)
    print(f'Matching colleges: {colleges.count()}')

    if district:
        colleges = colleges.filter(location_city__icontains=district)
        print(f'Colleges in {district}: {colleges.count()}')

    colleges = colleges.order_by('-placement_percentage', 'nirf_rank')[:20]
    print('Suggested colleges:')
    for college in colleges:
        print(f'- {college.college_name} ({college.location_city})')

if __name__ == '__main__':
    test_suggestion()