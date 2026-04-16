"""Seed script to populate the database with sample colleges."""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from api.accounts.models import College, TeamMember, TimelineEvent, CompanyStat

colleges_data = [
    {
        'name': "IIT Madras",
        'city': "Chennai",
        'district': "Chennai",
        'branch': "Engineering",
        'type': "Government",
        'cutoff_mark': 198.50,
        'community_category': "OC",
        'scholarship_available': True,
        'description': "India's top ranked institution for engineering and technology, known globally for innovation, research output, and outstanding faculty.",
    },
    {
        'name': "St. Stephen's College",
        'city': "New Delhi",
        'district': "Delhi",
        'branch': "Arts & Science",
        'type': "Private",
        'cutoff_mark': 185.00,
        'community_category': "OC",
        'scholarship_available': True,
        'description': "One of India's most prestigious liberal arts institutions under the University of Delhi, known for its rich heritage in humanities and science.",
    },
    {
        'name': "Loyola College",
        'city': "Chennai",
        'district': "Chennai",
        'branch': "Arts & Science",
        'type': "Private",
        'cutoff_mark': 180.00,
        'community_category': "OC",
        'scholarship_available': True,
        'description': "A premier Jesuit institution ranked among the best colleges in South India, offering excellence in arts, science, and management studies.",
    },
    {
        'name': "SRM Institute of Science and Technology",
        'city': "Kattankulathur",
        'district': "Kanchipuram",
        'branch': "Engineering",
        'type': "Deemed",
        'cutoff_mark': 175.00,
        'community_category': "OC",
        'scholarship_available': True,
        'description': "A leading deemed university specializing in engineering and technology, globally recognized for research and industry partnerships.",
    },
    {
        'name': "Christ University",
        'city': "Bangalore",
        'district': "Bangalore",
        'branch': "Arts & Science",
        'type': "Deemed",
        'cutoff_mark': 178.00,
        'community_category': "OC",
        'scholarship_available': True,
        'description': "A prestigious deemed university renowned for its multidisciplinary approach, holistic education model, and vibrant campus culture.",
    },
    {
        'name': "VIT University",
        'city': "Vellore",
        'district': "Vellore",
        'branch': "Engineering",
        'type': "Deemed",
        'cutoff_mark': 172.00,
        'community_category': "OC",
        'scholarship_available': True,
        'description': "A top-ranked private university known for its excellent engineering programs, state-of-the-art infrastructure, and strong placement record.",
    },
    {
        'name': "Anna University",
        'city': "Chennai",
        'district': "Chennai",
        'branch': "Engineering",
        'type': "Government",
        'cutoff_mark': 195.00,
        'community_category': "OC",
        'scholarship_available': True,
        'description': "A premier government university for engineering in Tamil Nadu, with multiple campus across the state and excellent research facilities.",
    },
    {
        'name': "Madras Christian College",
        'city': "Chennai",
        'district': "Chennai",
        'branch': "Arts & Science",
        'type': "Private",
        'cutoff_mark': 170.00,
        'community_category': "OC",
        'scholarship_available': False,
        'description': "One of the oldest colleges in Asia, known for its holistic approach to education and vibrant campus life in Chennai.",
    },
    {
        'name': "PSG College of Technology",
        'city': "Coimbatore",
        'district': "Coimbatore",
        'branch': "Engineering",
        'type': "Private",
        'cutoff_mark': 185.00,
        'community_category': "OC",
        'scholarship_available': True,
        'description': "A renowned autonomous institution in Coimbatore, known for producing industry-ready engineers with excellent placement records.",
    },
    {
        'name': "Birla Institute of Technology and Science (BITS) Pilani",
        'city': "Pilani",
        'district': "Jhunjhunu",
        'branch': "Engineering",
        'type': "Deemed",
        'cutoff_mark': 188.00,
        'community_category': "OC",
        'scholarship_available': True,
        'description': "A prestigious deemed university known for its rigorous academic curriculum and excellent placement opportunities.",
    },
    # Add some BC category colleges
    {
        'name': "Government College of Technology",
        'city': "Coimbatore",
        'district': "Coimbatore",
        'branch': "Engineering",
        'type': "Government",
        'cutoff_mark': 165.00,
        'community_category': "BC",
        'scholarship_available': True,
        'description': "A top government engineering college in Coimbatore with strong industry connections and research output.",
    },
    {
        'name': "Thapar Institute of Engineering and Technology",
        'city': "Patiala",
        'district': "Patiala",
        'branch': "Engineering",
        'type': "Deemed",
        'cutoff_mark': 160.00,
        'community_category': "BC",
        'scholarship_available': True,
        'description': "A leading private engineering institute with world-class research facilities and exceptional placement record.",
    },
    # MBC category colleges
    {
        'name': "College of Engineering, Guindy",
        'city': "Chennai",
        'district': "Chennai",
        'branch': "Engineering",
        'type': "Government",
        'cutoff_mark': 175.00,
        'community_category': "MBC",
        'scholarship_available': True,
        'description': "One of the oldest and most prestigious engineering colleges in India, part of Anna University.",
    },
    # SC/ST category colleges
    {
        'name': "Periyar E.G. College of Engineering",
        'city': " Salem",
        'district': "Salem",
        'branch': "Engineering",
        'type': "Government",
        'cutoff_mark': 140.00,
        'community_category': "SC",
        'scholarship_available': True,
        'description': "A premier government engineering college focused on inclusive education and excellence in technical skills.",
    },
    {
        'name': "National Institute of Technology (NIT)",
        'city': "Trichy",
        'district': "Trichy",
        'branch': "Engineering",
        'type': "Government",
        'cutoff_mark': 180.00,
        'community_category': "OC",
        'scholarship_available': True,
        'description': "A premier national technical institution known for its rigorous academics and excellent placement opportunities.",
    },
]

team_members_data = [
    {
        'name': 'Dr. Rajesh Kumar',
        'role': 'Founder & Director',
        'bio': '20 years in education policy and student counselling across Tamil Nadu and Karnataka.',
        'avatar_initials': 'RK',
        'avatar_color': '#87CEEB',
        'order': 1,
    },
    {
        'name': 'Priya Menon',
        'role': 'Head of Counselling',
        'bio': 'Former admissions officer at Loyola College. Guided 800+ students to their dream institutions.',
        'avatar_initials': 'PM',
        'avatar_color': '#5BB8E0',
        'order': 2,
    },
    {
        'name': 'Arjun Subramaniam',
        'role': 'Scholarship Specialist',
        'bio': 'Expert in government and private scholarship programmes. Has secured ₹5 Cr+ for students.',
        'avatar_initials': 'AS',
        'avatar_color': '#3AAAD4',
        'order': 3,
    },
    {
        'name': 'Nithya Venkat',
        'role': 'College Relations Lead',
        'bio': 'Manages partnerships with 500+ colleges. Ensures students get priority consideration and early offers.',
        'avatar_initials': 'NV',
        'avatar_color': '#87CEEB',
        'order': 4,
    },
]

timeline_events_data = [
    {
        'year': 2015,
        'title': 'ICE Foundation founded',
        'description': 'Started by three educators in Chennai with a mission to demystify college admissions for Tamil Nadu students.',
        'order': 1,
    },
    {
        'year': 2017,
        'title': '100 colleges onboarded',
        'description': 'Built partnerships with top colleges across South India, expanding our reach to Karnataka and Andhra Pradesh.',
        'order': 2,
    },
    {
        'year': 2019,
        'title': 'Scholarship programme launched',
        'description': 'Introduced our dedicated scholarship discovery service, securing over ₹2 Cr for students in the first year alone.',
        'order': 3,
    },
    {
        'year': 2022,
        'title': 'Digital platform goes live',
        'description': 'Launched our online counselling portal, making expert guidance accessible to students across India.',
        'order': 4,
    },
    {
        'year': 2025,
        'title': '3,000+ students served',
        'description': 'Milestone reached with 500+ partner colleges and ₹12 Cr in total scholarships secured for our students.',
        'order': 5,
    },
]

company_stats_data = [
    {
        'label': 'Years in market',
        'value': '2+',
        'order': 1,
    },
    {
        'label': 'Students onboarded',
        'value': '1k+',
        'order': 2,
    },
    {
        'label': 'College partners',
        'value': '200+',
        'order': 3,
    },
    {
        'label': 'Scholarship value matched',
        'value': '₹6Cr',
        'order': 4,
    },
]

def seed_colleges():
    created_count = 0
    for college_data in colleges_data:
        college, created = College.objects.get_or_create(
            name=college_data['name'],
            branch=college_data['branch'],
            defaults=college_data
        )
        if created:
            created_count += 1
            print(f"Created: {college.name}")
        else:
            print(f"Already exists: {college.name}")

    print(f"\nSeeding complete! Created {created_count} new colleges out of {len(colleges_data)} total.")

def seed_team_members():
    created_count = 0
    for member_data in team_members_data:
        member, created = TeamMember.objects.get_or_create(
            name=member_data['name'],
            defaults=member_data
        )
        if created:
            created_count += 1
            print(f"Created team member: {member.name}")
        else:
            print(f"Already exists: {member.name}")

    print(f"\nSeeding complete! Created {created_count} new team members out of {len(team_members_data)} total.")

def seed_timeline_events():
    created_count = 0
    for event_data in timeline_events_data:
        event, created = TimelineEvent.objects.get_or_create(
            year=event_data['year'],
            title=event_data['title'],
            defaults=event_data
        )
        if created:
            created_count += 1
            print(f"Created timeline event: {event.title}")
        else:
            print(f"Already exists: {event.title}")

    print(f"\nSeeding complete! Created {created_count} new timeline events out of {len(timeline_events_data)} total.")

def seed_company_stats():
    created_count = 0
    for stat_data in company_stats_data:
        stat, created = CompanyStat.objects.get_or_create(
            label=stat_data['label'],
            defaults=stat_data
        )
        if created:
            created_count += 1
            print(f"Created company stat: {stat.label}")
        else:
            print(f"Already exists: {stat.label}")

    print(f"\nSeeding complete! Created {created_count} new company stats out of {len(company_stats_data)} total.")

if __name__ == '__main__':
    seed_colleges()
    seed_team_members()
    seed_timeline_events()
    seed_company_stats()