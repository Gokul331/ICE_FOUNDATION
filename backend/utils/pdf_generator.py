# utils/pdf_generator.py
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from django.conf import settings
from django.core.files.base import ContentFile
import os
from datetime import datetime

def generate_application_pdf(application):
    """Generate PDF for student application"""
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a2e'),
        alignment=TA_CENTER,
        spaceAfter=30
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#4f46e5'),
        spaceAfter=12,
        spaceBefore=20
    )
    
    normal_style = styles['Normal']
    
    # Build PDF content
    story = []
    
    # Title
    story.append(Paragraph("Student Application Form", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Application Info
    story.append(Paragraph(f"Application ID: {application.application_id}", heading_style))
    story.append(Paragraph(f"Submitted Date: {application.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}", normal_style))
    story.append(Paragraph(f"Status: {application.get_status_display()}", normal_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Personal Information Section
    story.append(Paragraph("1. Personal Information", heading_style))
    personal_data = [
        ["Full Name:", f"{application.first_name} {application.last_name}"],
        ["Gender:", application.get_gender_display() or "N/A"],
        ["Date of Birth:", application.date_of_birth.strftime('%Y-%m-%d') if application.date_of_birth else "N/A"],
        ["Mobile Number:", application.mobile_number or "N/A"],
        ["Email ID:", application.email_id or "N/A"],
        ["Blood Group:", application.blood_group or "N/A"],
        ["Nationality:", application.nationality or "N/A"],
        ["Community:", application.get_community_display() or "N/A"],
        ["Sub Caste:", application.sub_caste or "N/A"],
        ["Marital Status:", application.get_marital_status_display() or "N/A"],
        ["Mother Tongue:", application.mother_tongue or "N/A"],
        ["Aadhar Number:", application.aadhar_number or "N/A"],
        ["First Graduation:", application.first_graduation or "N/A"],
    ]
    
    personal_table = Table(personal_data, colWidths=[2*inch, 4*inch])
    personal_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(personal_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Parent Information
    story.append(Paragraph("2. Parent Information", heading_style))
    parent_data = [
        ["Father's Name:", application.father_name or "N/A"],
        ["Father's Mobile:", application.father_mobile or "N/A"],
        ["Father's Occupation:", application.father_occupation or "N/A"],
        ["Mother's Name:", application.mother_name or "N/A"],
        ["Mother's Mobile:", application.mother_mobile or "N/A"],
        ["Mother's Occupation:", application.mother_occupation or "N/A"],
        ["Family Annual Income:", f"₹{application.family_annual_income:,}" if application.family_annual_income else "N/A"],
    ]
    
    parent_table = Table(parent_data, colWidths=[2*inch, 4*inch])
    parent_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(parent_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Address Information
    story.append(Paragraph("3. Address Information", heading_style))
    address_data = [
        ["Address Line 1:", application.address_line1 or "N/A"],
        ["Address Line 2:", application.address_line2 or "N/A"],
        ["City:", application.city or "N/A"],
        ["State:", application.state or "N/A"],
        ["Pincode:", application.pincode or "N/A"],
    ]
    
    address_table = Table(address_data, colWidths=[2*inch, 4*inch])
    address_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(address_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Education Information
    story.append(Paragraph("4. Education Information", heading_style))
    story.append(Paragraph("<b>10th Standard</b>", normal_style))
    tenth_data = [
        ["School Name:", application.tenth_school_name or "N/A"],
        ["Board:", application.tenth_board or "N/A"],
        ["Year of Passing:", str(application.tenth_year_of_passing) if application.tenth_year_of_passing else "N/A"],
        ["Result Status:", application.get_tenth_result_status_display() or "N/A"],
        ["Marks Percentage:", f"{application.tenth_marks_percentage}%" if application.tenth_marks_percentage else "N/A"],
    ]
    
    tenth_table = Table(tenth_data, colWidths=[2*inch, 4*inch])
    tenth_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(tenth_table)
    story.append(Spacer(1, 0.1*inch))
    
    story.append(Paragraph("<b>12th Standard</b>", normal_style))
    twelfth_data = [
        ["School Name:", application.twelfth_school_name or "N/A"],
        ["Board:", application.twelfth_board or "N/A"],
        ["Year of Passing:", str(application.twelfth_year_of_passing) if application.twelfth_year_of_passing else "N/A"],
        ["Result Status:", application.get_twelfth_result_status_display() or "N/A"],
        ["Marks Percentage:", f"{application.twelfth_marks_percentage}%" if application.twelfth_marks_percentage else "N/A"],
    ]
    
    twelfth_table = Table(twelfth_data, colWidths=[2*inch, 4*inch])
    twelfth_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(twelfth_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Course Information
    story.append(Paragraph("5. Course Information", heading_style))
    course_data = [
        ["College Name:", application.college.college_name if application.college else "N/A"],
        ["Course ID:", str(application.course_id) if application.course_id else "N/A"],
        ["Quota Type:", application.get_quota_type_display() if application.quota_type else "N/A"],
    ]
    
    course_table = Table(course_data, colWidths=[2*inch, 4*inch])
    course_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(course_table)
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    return buffer