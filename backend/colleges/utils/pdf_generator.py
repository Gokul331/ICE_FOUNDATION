# colleges/utils/pdf_generator.py
# ICE Foundation – Student Application PDF Generator
# Matches the exact fields from ApplicationForm component

from io import BytesIO
from datetime import datetime
import os
import tempfile

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
)

try:
    from PIL import Image as PILImage
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


# ─── Black & White Theme ───────────────────────────────────────────────────
BLACK       = colors.HexColor('#000000')
WHITE       = colors.HexColor('#FFFFFF')
GREY_DARK   = colors.HexColor('#333333')
GREY_MID    = colors.HexColor('#666666')
GREY_LIGHT  = colors.HexColor('#F5F5F5')
BORDER      = colors.HexColor('#CCCCCC')
HEADER_BG   = colors.HexColor('#000000')
LABEL_BG    = colors.HexColor('#F0F0F0')
VALUE_BG    = colors.HexColor('#FFFFFF')

# ─── Page geometry ────────────────────────────────────────────────────────
PAGE_W, PAGE_H = A4
LM = RM = 28
TM = BM = 30
CONTENT_W = PAGE_W - LM - RM


# ═══════════════════════════════════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════════════════════════════════

def _v(value):
    if value is None or value == '':
        return ''
    return str(value)


def _format_percentage(value):
    """Safely format a percentage value"""
    if value is None:
        return ''
    try:
        return f"{float(value)}%"
    except (ValueError, TypeError):
        return str(value)
    return str(value)


def _age(dob):
    if not dob:
        return ''
    today = datetime.now().date()
    years = today.year - dob.year
    months = today.month - dob.month
    if today.day < dob.day:
        months -= 1
    if months < 0:
        years -= 1
        months += 12
    return f"{years} YEARS, {months} MONTH{'S' if months != 1 else ''}"


def _resize_photo(file_field, max_w=90, max_h=110):
    if not PIL_AVAILABLE or not file_field or not file_field.name:
        return None
    try:
        path = file_field.path if hasattr(file_field, 'path') else None
        if not path or not os.path.exists(path):
            return None
        with PILImage.open(path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                bg = PILImage.new('RGB', img.size, (255, 255, 255))
                mask = img.split()[-1] if img.mode == 'RGBA' else None
                bg.paste(img.convert('RGBA'), mask=mask)
                img = bg
            img.thumbnail((max_w, max_h), PILImage.Resampling.LANCZOS)
            tmp = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
            img.save(tmp.name, 'JPEG', quality=85)
            return tmp.name
    except Exception as e:
        return None


def _get_display_name(value):
    """Convert enum values to display names"""
    if value == 'Yes':
        return 'YES'
    if value == 'No':
        return 'NO'
    if value == 'single':
        return 'SINGLE'
    if value == 'married':
        return 'MARRIED'
    if value == 'male':
        return 'MALE'
    if value == 'female':
        return 'FEMALE'
    if value == 'other':
        return 'OTHER'
    if value == 'declared':
        return 'DECLARED'
    if value == 'awaited':
        return 'AWAITED'
    return _v(value)


# ═══════════════════════════════════════════════════════════════════════════
# Style helpers
# ═══════════════════════════════════════════════════════════════════════════

_base_styles = getSampleStyleSheet()


def _ps(name, **kw):
    return ParagraphStyle(name, parent=_base_styles['Normal'], **kw)


S_NORMAL  = _ps('ice_n',  fontSize=8,  textColor=BLACK, fontName='Helvetica', leading=11)
S_BOLD    = _ps('ice_b',  fontSize=8,  textColor=BLACK, fontName='Helvetica-Bold', leading=11)
S_LABEL   = _ps('ice_lb', fontSize=8,  textColor=BLACK, fontName='Helvetica-Bold', leading=11)
S_SEC     = _ps('ice_sh', fontSize=10, textColor=WHITE, fontName='Helvetica-Bold', alignment=TA_LEFT, leading=13)
S_TITLE   = _ps('ice_t1', fontSize=14, textColor=WHITE, fontName='Helvetica-Bold', alignment=TA_CENTER, leading=20)
S_SUBTTL  = _ps('ice_t2', fontSize=9,  textColor=WHITE, fontName='Helvetica', alignment=TA_CENTER, leading=13)
S_APPID   = _ps('ice_ai', fontSize=8,  textColor=WHITE, fontName='Helvetica-Bold', alignment=TA_RIGHT, leading=12)


def P(text, style=S_NORMAL):
    return Paragraph(_v(text), style)


def _section_bar(title):
    t = Table([[P(title, S_SEC)]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HEADER_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t


def _sub_bar(title):
    t = Table([[P(title, S_BOLD)]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LABEL_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
    ]))
    return t


def _grid(rows, col_widths):
    t = Table(rows, colWidths=col_widths)
    styles = [
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('GRID', (0, 0), (-1, -1), 0.4, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]
    for r in range(len(rows)):
        for c in range(len(col_widths)):
            if c % 2 == 0:
                styles.append(('BACKGROUND', (c, r), (c, r), LABEL_BG))
                styles.append(('FONTNAME', (c, r), (c, r), 'Helvetica-Bold'))
            else:
                styles.append(('BACKGROUND', (c, r), (c, r), VALUE_BG))
    t.setStyle(TableStyle(styles))
    return t


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(GREY_MID)
    canvas.drawString(LM, 16, "ICE Foundation | Student Application Form")
    canvas.drawRightString(PAGE_W - RM, 16, f"Page {doc.page}")
    canvas.restoreState()


# ═══════════════════════════════════════════════════════════════════════════
# Main generator - Matches ApplicationForm fields exactly
# ═══════════════════════════════════════════════════════════════════════════

def generate_application_pdf(application):
    """Generate PDF matching the ApplicationForm component fields"""

    # Column widths
    CW2 = [CONTENT_W * 0.30, CONTENT_W * 0.70]
    CW4 = [CONTENT_W * 0.25, CONTENT_W * 0.25, CONTENT_W * 0.25, CONTENT_W * 0.25]
    CW6 = [CONTENT_W * 0.155, CONTENT_W * 0.18, CONTENT_W * 0.155, CONTENT_W * 0.18, CONTENT_W * 0.155, CONTENT_W * 0.175]

    story = []

    # Header
    college_name = application.college.college_name.upper() if application.college and application.college.college_name else "ICE FOUNDATION"
    app_id = _v(application.application_id)
    sub_date = application.submitted_at.strftime('%d/%m/%Y') if application.submitted_at else datetime.now().strftime('%d/%m/%Y')

    header_rows = [[P(college_name, S_TITLE), P(f"Application ID: {app_id}\nDate: {sub_date}", S_APPID)]]
    hdr_t = Table(header_rows, colWidths=[CONTENT_W * 0.70, CONTENT_W * 0.30])
    hdr_t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HEADER_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(hdr_t)
    story.append(Spacer(1, 2))

    # ==================== BASIC DETAILS ====================
    story.append(_section_bar("Basic Details"))

    # Personal Details (Bio-data)
    story.append(_sub_bar("Bio-data Details"))
    dob = application.date_of_birth
    per_rows = [
        [P("First Name", S_LABEL), P(application.first_name),
         P("Last Name", S_LABEL), P(application.last_name),
         P("Gender", S_LABEL), P(_get_display_name(application.gender))],
        [P("Date of Birth", S_LABEL), P(dob.strftime('%d/%m/%Y') if dob else ''),
         P("Mobile Number", S_LABEL), P(application.mobile_number),
         P("Email ID", S_LABEL), P(application.email_id)],
        [P("Blood Group", S_LABEL), P(application.blood_group or ''),
         P("Nationality", S_LABEL), P(application.nationality or 'Indian'),
         P("Community", S_LABEL), P(application.community or '')],
        [P("Sub-Caste", S_LABEL), P(application.sub_caste or ''),
         P("Marital Status", S_LABEL), P(_get_display_name(application.marital_status)),
         P("Mother Tongue", S_LABEL), P(application.mother_tongue or '')],
        [P("Aadhar Number", S_LABEL), P(application.aadhar_number or ''),
         P("First Graduation", S_LABEL), P(_get_display_name(application.first_graduation)),
         P("Age", S_LABEL), P(_age(dob))],
    ]
    story.append(_grid(per_rows, CW6))
    story.append(Spacer(1, 4))

    # ==================== PARENT'S DETAILS ====================
    story.append(_section_bar("Parent's Details"))

    story.append(_sub_bar("Father's Details"))
    fat_rows = [
        [P("Father's Name", S_LABEL), P(application.father_name or ''),
         P("Father's Mobile Number", S_LABEL), P(application.father_mobile or ''),
         P("Father's Occupation", S_LABEL), P(application.father_occupation or '')],
    ]
    story.append(_grid(fat_rows, CW6))

    story.append(_sub_bar("Mother's Details"))
    mot_rows = [
        [P("Mother's Name", S_LABEL), P(application.mother_name or ''),
         P("Mother's Mobile Number", S_LABEL), P(application.mother_mobile or ''),
         P("Mother's Occupation", S_LABEL), P(application.mother_occupation or '')],
    ]
    story.append(_grid(mot_rows, CW6))

    story.append(_sub_bar("Family Details"))
    income = application.family_annual_income
    income_str = f"₹{income:,}" if income else ''
    fam_rows = [
        [P("Family Annual Income (INR)", S_LABEL), P(income_str),
         P("", S_LABEL), P(""),
         P("", S_LABEL), P("")],
    ]
    story.append(_grid(fam_rows, CW6))
    story.append(Spacer(1, 4))

    # ==================== ADDRESS DETAILS ====================
    story.append(_section_bar("Address Details"))

    addr_rows = [
        [P("Address Line 1", S_LABEL), P(application.address_line1 or ''),
         P("Address Line 2", S_LABEL), P(application.address_line2 or ''),
         P("City", S_LABEL), P(application.city or '')],
        [P("State", S_LABEL), P(application.state or ''),
         P("Pincode", S_LABEL), P(application.pincode or ''),
         P("", S_LABEL), P("")],
    ]
    story.append(_grid(addr_rows, CW6))
    story.append(Spacer(1, 4))

    # ==================== EDUCATION DETAILS ====================
    story.append(_section_bar("Education Details"))

    # 10th Standard
    story.append(_sub_bar("10th Standard"))
    tenth_rows = [
        [P("School Name", S_LABEL), P(application.tenth_school_name or ''),
         P("Board", S_LABEL), P(application.tenth_board or ''),
         P("Year of Passing", S_LABEL), P(_v(application.tenth_year_of_passing))],
        [P("Result Status", S_LABEL), P(_get_display_name(application.tenth_result_status)),
         P("Marks Scored (%)", S_LABEL), P(_format_percentage(application.tenth_marks_percentage)),
         P("", S_LABEL), P("")],
    ]
    story.append(_grid(tenth_rows, CW6))
    story.append(Spacer(1, 2))

    # 12th Standard
    story.append(_sub_bar("12th Standard"))
    twelfth_rows = [
        [P("School Name", S_LABEL), P(application.twelfth_school_name or ''),
         P("Board", S_LABEL), P(application.twelfth_board or ''),
         P("Year of Passing", S_LABEL), P(_v(application.twelfth_year_of_passing))],
        [P("Result Status", S_LABEL), P(_get_display_name(application.twelfth_result_status)),
         P("Marks Scored (%)", S_LABEL), P(_format_percentage(application.twelfth_marks_percentage)),
         P("", S_LABEL), P("")],
    ]
    story.append(_grid(twelfth_rows, CW6))
    story.append(Spacer(1, 2))

    # Diploma Details (conditional)
    if application.has_diploma:
        story.append(_sub_bar("Diploma Details"))
        diploma_rows = [
            [P("College Name", S_LABEL), P(application.diploma_college_name or ''),
             P("Board / University", S_LABEL), P(application.diploma_board_university or ''),
             P("Year of Passing", S_LABEL), P(_v(application.diploma_year_of_passing))],
            [P("Result Status", S_LABEL), P(_get_display_name(application.diploma_result_status)),
             P("Marks Scored (%)", S_LABEL), P(_format_percentage(application.diploma_marks_percentage)),
             P("", S_LABEL), P("")],
        ]
        story.append(_grid(diploma_rows, CW6))
        story.append(Spacer(1, 2))

    # UG Details (conditional)
    if application.has_ug:
        story.append(_sub_bar("Undergraduate (UG) Details"))
        ug_rows = [
            [P("College Name", S_LABEL), P(application.ug_college_name or ''),
             P("Board / University", S_LABEL), P(application.ug_board_university or ''),
             P("Year of Passing", S_LABEL), P(_v(application.ug_year_of_passing))],
            [P("Result Status", S_LABEL), P(_get_display_name(application.ug_result_status)),
             P("Marks Scored (%)", S_LABEL), P(_format_percentage(application.ug_marks_percentage)),
             P("", S_LABEL), P("")],
        ]
        story.append(_grid(ug_rows, CW6))
        story.append(Spacer(1, 2))

    # ==================== COURSE DETAILS ====================
    story.append(_section_bar("Course Details"))
    course_rows = [
        [P("College Name", S_LABEL), P(application.college.college_name if application.college and application.college.college_name else ''),
         P("Course Name", S_LABEL), P(_v(application.course_name)),
         P("Quota Type", S_LABEL), P(application.quota_type.upper() if application.quota_type else 'MANAGEMENT')],
    ]
    story.append(_grid(course_rows, CW6))
    story.append(Spacer(1, 4))

    # ==================== DOCUMENT UPLOADS ====================
    story.append(_section_bar("Document Uploads"))

    doc_fields = [
        ('photo', 'Photo'),
        ('aadhar_card', 'Aadhar Card'),
        ('tenth_marksheet', '10th Marksheet'),
        ('twelfth_marksheet', '12th Marksheet'),
        ('diploma_marksheet', 'Diploma Marksheet'),
        ('ug_marksheet', 'UG Marksheet'),
        ('community_marksheet', 'Community Certificate'),
    ]

    doc_rows = []
    current_row = []
    for field_name, display_name in doc_fields:
        file_obj = getattr(application, field_name, None)
        uploaded = "✓ Uploaded" if file_obj and file_obj.name else "✗ Not Uploaded"
        current_row.append(P(display_name, S_LABEL))
        current_row.append(P(uploaded, S_BOLD if uploaded == "✓ Uploaded" else S_NORMAL))
        if len(current_row) == 4:
            doc_rows.append(current_row)
            current_row = []
    if current_row:
        while len(current_row) < 4:
            current_row.append(P(""))
            current_row.append(P(""))
        doc_rows.append(current_row)

    doc_table = Table(doc_rows, colWidths=[CONTENT_W * 0.25, CONTENT_W * 0.25, CONTENT_W * 0.25, CONTENT_W * 0.25])
    doc_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('GRID', (0, 0), (-1, -1), 0.4, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(doc_table)
    story.append(Spacer(1, 4))

    # ==================== DECLARATION ====================
    story.append(_section_bar("Declaration"))
    story.append(_sub_bar("Declaration"))

    decl_text = "I hereby declare that all the information provided by me in this application form is true and correct to the best of my knowledge. I understand that any false information or suppression of facts will lead to rejection of my application or cancellation of admission at any stage."
    decl_t = Table([[P(decl_text, S_NORMAL)]], colWidths=[CONTENT_W])
    decl_t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GREY_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
    ]))
    story.append(decl_t)
    story.append(Spacer(1, 6))

    # Signature
    sig_rows = [[
        P(f"Applicant's Name: {application.first_name} {application.last_name}", S_BOLD),
        P(f"Date: {datetime.now().strftime('%d/%m/%Y')}", S_NORMAL),
    ]]
    sig_table = Table(sig_rows, colWidths=[CONTENT_W * 0.5, CONTENT_W * 0.5])
    sig_table.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(sig_table)
    story.append(Spacer(1, 2))

    note_text = "Note: The fee paid at the time of admission process shall not be refunded in case of admission cancellation."
    note_t = Table([[P(note_text, S_NORMAL)]], colWidths=[CONTENT_W])
    note_t.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(note_t)

    # Build PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=RM, leftMargin=LM,
        topMargin=TM, bottomMargin=30,
        title="ICE Foundation – Student Application Form",
        author="ICE Foundation",
    )
    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)

    buffer.seek(0)
    return buffer