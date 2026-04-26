#!/usr/bin/env python
import os
import django
import sys

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from colleges.models import College, Course

def create_test_data():
    print("Creating test colleges and courses...")

    # Create colleges
    college1 = College.objects.create(
        college_name="Anna University",
        short_name="AU",
        location_city="Chennai",
        location_state="Tamil Nadu",
        type="government",
        affiliation="anna_university",
        naac_grade="A+",
        nirf_rank=10,
        placement_percentage=85.0
    )

    college2 = College.objects.create(
        college_name="IIT Madras",
        short_name="IITM",
        location_city="Chennai",
        location_state="Tamil Nadu",
        type="government",
        affiliation="deemed_university",
        naac_grade="A++",
        nirf_rank=1,
        placement_percentage=95.0
    )

    college3 = College.objects.create(
        college_name="PSG College of Technology",
        short_name="PSG",
        location_city="Coimbatore",
        location_state="Tamil Nadu",
        type="private",
        affiliation="anna_university_affiliated",
        naac_grade="A",
        nirf_rank=50,
        placement_percentage=80.0
    )

    # Create courses
    course1 = Course.objects.create(
        college=college1,
        course_code="CS",
        course_name="Computer Science and Engineering",
        degree_type="ug",
        degree_name="B.E.",
        duration_years=4.0,
        intake_seats=120,
        tuition_fee_management=50000,
        tuition_fee_government=25000,
        cutoff_oc=195.5,
        cutoff_bc=190.0,
        cutoff_bcm=185.0,
        cutoff_mbc=180.0,
        cutoff_sc=175.0,
        cutoff_sca=170.0,
        cutoff_st=165.0
    )

    course2 = Course.objects.create(
        college=college1,
        course_code="EC",
        course_name="Electronics and Communication Engineering",
        degree_type="ug",
        degree_name="B.E.",
        duration_years=4.0,
        intake_seats=120,
        tuition_fee_management=50000,
        tuition_fee_government=25000,
        cutoff_oc=192.0,
        cutoff_bc=187.0,
        cutoff_bcm=182.0,
        cutoff_mbc=177.0,
        cutoff_sc=172.0,
        cutoff_sca=167.0,
        cutoff_st=162.0
    )

    course3 = Course.objects.create(
        college=college2,
        course_code="CS",
        course_name="Computer Science and Engineering",
        degree_type="ug",
        degree_name="B.Tech",
        duration_years=4.0,
        intake_seats=60,
        tuition_fee_management=200000,
        tuition_fee_government=0,
        cutoff_oc=199.0,
        cutoff_bc=195.0,
        cutoff_bcm=190.0,
        cutoff_mbc=185.0,
        cutoff_sc=180.0,
        cutoff_sca=175.0,
        cutoff_st=170.0
    )

    course4 = Course.objects.create(
        college=college3,
        course_code="ME",
        course_name="Mechanical Engineering",
        degree_type="ug",
        degree_name="B.E.",
        duration_years=4.0,
        intake_seats=180,
        tuition_fee_management=75000,
        tuition_fee_government=35000,
        cutoff_oc=185.0,
        cutoff_bc=180.0,
        cutoff_bcm=175.0,
        cutoff_mbc=170.0,
        cutoff_sc=165.0,
        cutoff_sca=160.0,
        cutoff_st=155.0
    )

    print(f"Created {College.objects.count()} colleges and {Course.objects.count()} courses")

if __name__ == '__main__':
    create_test_data()