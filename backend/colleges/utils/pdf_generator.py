# colleges/utils/pdf_generator.py
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from datetime import datetime

def get_value(value):
    """Return empty string if value is None or empty, otherwise return value"""
    if value is None or value == '':
        return ''
    return str(value)

def generate_application_pdf(application):
    """Generate professional PDF for student application"""
    
    buffer = BytesIO()
    
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=landscape(A4), 
        rightMargin=36, 
        leftMargin=36, 
        topMargin=36, 
        bottomMargin=36
    )
    
    # Custom Styles
    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor('#000000'),
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=6
    )
    
    college_style = ParagraphStyle(
        'CollegeStyle',
        parent=styles['Normal'],
        fontSize=16,
        textColor=colors.HexColor('#000000'),
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=10
    )
    
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#000000'),
        fontName='Helvetica-Bold',
        spaceAfter=6,
        spaceBefore=10
    )
    
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#000000'),
        fontName='Helvetica-Bold'
    )
    
    story = []
    
    # ==================== HEADER ====================
    college_name = application.college.college_name if application.college else "ICE FOUNDATION"
    story.append(Paragraph(college_name.upper(), college_style))
    story.append(Paragraph("STUDENT APPLICATION FORM", header_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Application Info Row
    info_data = [
        [Paragraph(f"Application ID: {get_value(application.application_id)}", label_style),
         Paragraph(f"Date: {application.submitted_at.strftime('%d-%m-%Y') if application.submitted_at else ''}", label_style)]
    ]
    info_table = Table(info_data, colWidths=[4*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.2*inch))
    
    # ==================== SECTION 1: BASIC DETAILS ====================
    story.append(Paragraph("BASIC DETAILS", section_style))
    
    # Calculate age
    age_text = ''
    if application.date_of_birth:
        today = datetime.now().date()
        age = today.year - application.date_of_birth.year
        if today.month < application.date_of_birth.month or (today.month == application.date_of_birth.month and today.day < application.date_of_birth.day):
            age -= 1
        age_text = f"{age} YEARS"
    
    # Build basic details rows (only include non-empty values)
    basic_rows = []
    
    row1 = []
    if get_value(application.first_name) or get_value(application.last_name):
        row1.extend(["First Name", get_value(application.first_name), "Last Name", get_value(application.last_name)])
    if get_value(application.gender):
        row1.extend(["Gender", get_value(application.gender).upper()])
    if row1:
        basic_rows.append(row1)
    
    row2 = []
    if get_value(application.email_id):
        row2.extend(["Email", get_value(application.email_id)])
    if get_value(application.mobile_number):
        row2.extend(["Mobile", get_value(application.mobile_number)])
    if row2:
        basic_rows.append(row2)
    
    row3 = []
    if get_value(application.date_of_birth):
        row3.extend(["Date of Birth", application.date_of_birth.strftime('%d/%m/%Y') if application.date_of_birth else ''])
    if age_text:
        row3.extend(["Age", age_text])
    if row3:
        basic_rows.append(row3)
    
    row4 = []
    if get_value(application.blood_group):
        row4.extend(["Blood Group", get_value(application.blood_group)])
    if get_value(application.marital_status):
        row4.extend(["Marital Status", get_value(application.marital_status).upper()])
    if row4:
        basic_rows.append(row4)
    
    row5 = []
    if get_value(application.nationality):
        row5.extend(["Nationality", get_value(application.nationality)])
    if get_value(application.community):
        row5.extend(["Community", get_value(application.community)])
    if row5:
        basic_rows.append(row5)
    
    row6 = []
    if get_value(application.sub_caste):
        row6.extend(["Sub Caste", get_value(application.sub_caste)])
    if get_value(application.mother_tongue):
        row6.extend(["Mother Tongue", get_value(application.mother_tongue)])
    if row6:
        basic_rows.append(row6)
    
    row7 = []
    if get_value(application.aadhar_number):
        row7.extend(["Aadhar Number", get_value(application.aadhar_number)])
    if get_value(application.first_graduation):
        row7.extend(["First Graduation", get_value(application.first_graduation)])
    if row7:
        basic_rows.append(row7)
    
    # Create basic details table
    if basic_rows:
        # Determine max columns (2, 4, or 6)
        max_cols = max(len(row) for row in basic_rows)
        col_width = 1.2 * inch
        basic_table = Table(basic_rows, colWidths=[col_width] * max_cols)
        basic_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f5f5f5')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ]))
        story.append(basic_table)
        story.append(Spacer(1, 0.1*inch))
    
    # ==================== SECTION 2: PARENT DETAILS ====================
    story.append(Paragraph("PARENT DETAILS", section_style))
    
    parent_rows = []
    
    row1 = []
    if get_value(application.father_name):
        row1.extend(["Father's Name", get_value(application.father_name)])
    if get_value(application.father_mobile):
        row1.extend(["Father's Mobile", get_value(application.father_mobile)])
    if row1:
        parent_rows.append(row1)
    
    row2 = []
    if get_value(application.father_occupation):
        row2.extend(["Father's Occupation", get_value(application.father_occupation)])
    if row2:
        parent_rows.append(row2)
    
    row3 = []
    if get_value(application.mother_name):
        row3.extend(["Mother's Name", get_value(application.mother_name)])
    if get_value(application.mother_mobile):
        row3.extend(["Mother's Mobile", get_value(application.mother_mobile)])
    if row3:
        parent_rows.append(row3)
    
    row4 = []
    if get_value(application.mother_occupation):
        row4.extend(["Mother's Occupation", get_value(application.mother_occupation)])
    if row4:
        parent_rows.append(row4)
    
    row5 = []
    if get_value(application.family_annual_income):
        row5.extend(["Family Annual Income", f"₹{application.family_annual_income:,}"])
    if row5:
        parent_rows.append(row5)
    
    if parent_rows:
        max_cols = max(len(row) for row in parent_rows)
        col_width = 2 * inch
        parent_table = Table(parent_rows, colWidths=[col_width] * max_cols)
        parent_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f5f5f5')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ]))
        story.append(parent_table)
        story.append(Spacer(1, 0.1*inch))
    
    # ==================== SECTION 3: ADDRESS DETAILS ====================
    address_rows = []
    
    row1 = []
    if get_value(application.address_line1):
        row1.extend(["Address Line 1", get_value(application.address_line1)])
    if get_value(application.address_line2):
        row1.extend(["Address Line 2", get_value(application.address_line2)])
    if row1:
        address_rows.append(row1)
    
    row2 = []
    if get_value(application.city):
        row2.extend(["City", get_value(application.city)])
    if get_value(application.state):
        row2.extend(["State", get_value(application.state)])
    if row2:
        address_rows.append(row2)
    
    row3 = []
    if get_value(application.pincode):
        row3.extend(["Pincode", get_value(application.pincode)])
    if row3:
        address_rows.append(row3)
    
    if address_rows:
        story.append(Paragraph("ADDRESS DETAILS", section_style))
        max_cols = max(len(row) for row in address_rows)
        col_width = 2.5 * inch
        address_table = Table(address_rows, colWidths=[col_width] * max_cols)
        address_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f5f5f5')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ]))
        story.append(address_table)
        story.append(Spacer(1, 0.1*inch))
    
    # ==================== SECTION 4: EDUCATION DETAILS ====================
    story.append(Paragraph("EDUCATION DETAILS", section_style))
    
    # 10th Details
    tenth_rows = []
    if get_value(application.tenth_school_name):
        tenth_rows.append(["School Name", get_value(application.tenth_school_name)])
    if get_value(application.tenth_board):
        tenth_rows.append(["Board", get_value(application.tenth_board)])
    if get_value(application.tenth_year_of_passing):
        tenth_rows.append(["Year of Passing", str(application.tenth_year_of_passing)])
    if get_value(application.tenth_marks_percentage):
        tenth_rows.append(["Percentage", f"{application.tenth_marks_percentage}%"])
    
    if tenth_rows:
        story.append(Paragraph("<b>10th Standard</b>", label_style))
        tenth_table = Table(tenth_rows, colWidths=[2*inch, 4*inch])
        tenth_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0e0e0')),
            ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#ffffff')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ]))
        story.append(tenth_table)
        story.append(Spacer(1, 0.05*inch))
    
    # 12th Details
    twelfth_rows = []
    if get_value(application.twelfth_school_name):
        twelfth_rows.append(["School Name", get_value(application.twelfth_school_name)])
    if get_value(application.twelfth_board):
        twelfth_rows.append(["Board", get_value(application.twelfth_board)])
    if get_value(application.twelfth_year_of_passing):
        twelfth_rows.append(["Year of Passing", str(application.twelfth_year_of_passing)])
    if get_value(application.twelfth_marks_percentage):
        twelfth_rows.append(["Percentage", f"{application.twelfth_marks_percentage}%"])
    
    if twelfth_rows:
        story.append(Paragraph("<b>12th Standard</b>", label_style))
        twelfth_table = Table(twelfth_rows, colWidths=[2*inch, 4*inch])
        twelfth_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0e0e0')),
            ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#ffffff')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ]))
        story.append(twelfth_table)
        story.append(Spacer(1, 0.05*inch))
    
    # Diploma Details (only if has_diploma is True)
    if application.has_diploma:
        diploma_rows = []
        if get_value(application.diploma_college_name):
            diploma_rows.append(["College Name", get_value(application.diploma_college_name)])
        if get_value(application.diploma_board_university):
            diploma_rows.append(["Board/University", get_value(application.diploma_board_university)])
        if get_value(application.diploma_year_of_passing):
            diploma_rows.append(["Year of Passing", str(application.diploma_year_of_passing)])
        if get_value(application.diploma_marks_percentage):
            diploma_rows.append(["Percentage", f"{application.diploma_marks_percentage}%"])
        
        if diploma_rows:
            story.append(Paragraph("<b>Diploma</b>", label_style))
            diploma_table = Table(diploma_rows, colWidths=[2*inch, 4*inch])
            diploma_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0e0e0')),
                ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#ffffff')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
            ]))
            story.append(diploma_table)
            story.append(Spacer(1, 0.05*inch))
    
    # UG Details (only if has_ug is True)
    if application.has_ug:
        ug_rows = []
        if get_value(application.ug_college_name):
            ug_rows.append(["College Name", get_value(application.ug_college_name)])
        if get_value(application.ug_board_university):
            ug_rows.append(["Board/University", get_value(application.ug_board_university)])
        if get_value(application.ug_year_of_passing):
            ug_rows.append(["Year of Passing", str(application.ug_year_of_passing)])
        if get_value(application.ug_marks_percentage):
            ug_rows.append(["Percentage", f"{application.ug_marks_percentage}%"])
        
        if ug_rows:
            story.append(Paragraph("<b>Undergraduate</b>", label_style))
            ug_table = Table(ug_rows, colWidths=[2*inch, 4*inch])
            ug_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0e0e0')),
                ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#ffffff')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
            ]))
            story.append(ug_table)
            story.append(Spacer(1, 0.05*inch))
    
    # ==================== SECTION 5: COURSE DETAILS ====================
    course_rows = []
    college_name_value = application.college.college_name if application.college and application.college.college_name else ''
    if college_name_value:
        course_rows.append(["College Name", college_name_value])
    if get_value(application.course_id):
        course_rows.append(["Course ID", str(application.course_id)])
    if get_value(application.quota_type):
        course_rows.append(["Quota Type", application.quota_type.upper()])
    
    if course_rows:
        story.append(Paragraph("COURSE DETAILS", section_style))
        course_table = Table(course_rows, colWidths=[2*inch, 4*inch])
        course_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0e0e0')),
            ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#ffffff')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ]))
        story.append(course_table)
        story.append(Spacer(1, 0.1*inch))
    
    # ==================== DECLARATION ====================
    if application.declaration_accepted:
        story.append(Paragraph("DECLARATION", section_style))
        story.append(Paragraph(
            "I hereby declare that all the information provided by me in this application form is true and "
            "correct to the best of my knowledge. I understand that any false information or suppression of "
            "facts will lead to rejection of my application or cancellation of admission at any stage.",
            label_style
        ))
        story.append(Spacer(1, 0.1*inch))
        
        # Signature fields
        sig_data = [
            [f"Applicant's Name: {get_value(application.first_name)} {get_value(application.last_name)}", 
             f"Parent's Name: {get_value(application.father_name)}"],
            [f"Date: {datetime.now().strftime('%d/%m/%Y')}", "Signature: ___________________"],
        ]
        sig_table = Table(sig_data, colWidths=[3.5*inch, 3.5*inch])
        sig_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(sig_table)
    
    doc.build(story)
    buffer.seek(0)
    
    return buffer