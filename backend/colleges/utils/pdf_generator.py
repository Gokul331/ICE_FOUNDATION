# utils/pdf_generator.py
import logging
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from reportlab.lib.fonts import addMapping
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

logger = logging.getLogger(__name__)

# Colors
PRIMARY_COLOR = HexColor('#000000')  # Black
SECONDARY_COLOR = HexColor('#333333')  # Dark Gray
ACCENT_COLOR = HexColor('#28a745')  # Green for success
BORDER_COLOR = HexColor('#dddddd')
HEADER_BG = HexColor('#f5f5f5')

# Try to register a Unicode font (optional, falls back to Helvetica if not available)
try:
    # For better Unicode support (Devanagari, Tamil, etc.)
    font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'NotoSans-Regular.ttf')
    if os.path.exists(font_path):
        pdfmetrics.registerFont(TTFont('NotoSans', font_path))
        DEFAULT_FONT = 'NotoSans'
    else:
        DEFAULT_FONT = 'Helvetica'
except:
    DEFAULT_FONT = 'Helvetica'


def generate_application_pdf(enquiry):
    """
    Generate a professional PDF for the scholarship application
    
    Args:
        enquiry: EnquiryForm object instance
    
    Returns:
        BytesIO buffer containing the PDF
    """
    buffer = BytesIO()
    
    try:
        # Create PDF canvas
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        p.setFont(DEFAULT_FONT, 10)
        
        # ==================== HEADER SECTION ====================
        # Top border line
        p.setStrokeColor(PRIMARY_COLOR)
        p.setLineWidth(2)
        p.line(50, height - 50, width - 50, height - 50)
        
        # Logo placeholder / Title
        p.setFont(DEFAULT_FONT, 20)
        p.setFillColor(PRIMARY_COLOR)
        p.drawString(50, height - 40, "VAMSHI EDUCARE")
        
        p.setFont(DEFAULT_FONT, 10)
        p.setFillColor(SECONDARY_COLOR)
        p.drawString(50, height - 58, "Career Guidance Center")
        
        # Application ID on right side
        p.setFont(DEFAULT_FONT, 9)
        p.setFillColor(grey)
        p.drawRightString(width - 50, height - 40, f"Application ID: {enquiry.application_id}")
        p.drawRightString(width - 50, height - 55, f"Date: {datetime.now().strftime('%d %b %Y, %I:%M %p')}")
        
        # Title
        p.setFont(DEFAULT_FONT, 16)
        p.setFillColor(PRIMARY_COLOR)
        p.drawCentredString(width / 2, height - 90, "SCHOLARSHIP APPLICATION FORM")
        
        # Underline for title
        p.setStrokeColor(ACCENT_COLOR)
        p.setLineWidth(1)
        p.line(width / 2 - 100, height - 95, width / 2 + 100, height - 95)
        
        y_position = height - 120
        
        # ==================== COURSE SELECTION SECTION ====================
        p.setFont(DEFAULT_FONT, 12)
        p.setFillColor(PRIMARY_COLOR)
        p.drawString(50, y_position, "COURSE SELECTION DETAILS")
        y_position -= 15
        
        # Divider line
        p.setStrokeColor(BORDER_COLOR)
        p.setLineWidth(0.5)
        p.line(50, y_position + 5, width - 50, y_position + 5)
        y_position -= 10
        
        # Course selection table data
        course_data = [
            ["College:", enquiry.college.college_name if enquiry.college else "N/A"],
            ["College Location:", f"{enquiry.college.location_city}, {enquiry.college.location_state}" if enquiry.college else "N/A"],
            ["Category:", enquiry.get_selected_category_display() or enquiry.selected_category or "N/A"],
            ["Degree Type:", enquiry.get_selected_degree_type_display() or enquiry.selected_degree_type or "N/A"],
            ["Selected Course:", enquiry.course_name or "N/A"],
            ["Department:", enquiry.department_name or "N/A"],
            ["Quota/Community:", enquiry.get_community_display() or enquiry.community or "N/A"],
        ]
        
        # Create table
        course_table = Table(course_data, colWidths=[100, 350])
        course_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), DEFAULT_FONT),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), PRIMARY_COLOR),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        course_table.wrapOn(p, width - 100, y_position)
        course_table.drawOn(p, 50, y_position - 80)
        y_position -= 100
        
        # ==================== PERSONAL DETAILS SECTION ====================
        p.setFont(DEFAULT_FONT, 12)
        p.setFillColor(PRIMARY_COLOR)
        p.drawString(50, y_position, "PERSONAL DETAILS")
        y_position -= 15
        p.line(50, y_position + 5, width - 50, y_position + 5)
        y_position -= 10
        
        personal_data = [
            ["Full Name:", f"{enquiry.first_name} {enquiry.last_name or ''}".strip()],
            ["Gender:", enquiry.get_gender_display() or enquiry.gender or "N/A"],
            ["Date of Birth:", enquiry.date_of_birth.strftime('%d %b %Y') if enquiry.date_of_birth else "N/A"],
            ["Age:", f"{calculate_age(enquiry.date_of_birth)} years" if enquiry.date_of_birth else "N/A"],
            ["Mobile Number:", enquiry.mobile_number or "N/A"],
            ["Email ID:", enquiry.email_id or "N/A"],
            ["Aadhar Number:", format_aadhar(enquiry.aadhar_number) if enquiry.aadhar_number else "N/A"],
            ["Blood Group:", enquiry.blood_group or "N/A"],
        ]
        
        personal_table = Table(personal_data, colWidths=[100, 350])
        personal_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), DEFAULT_FONT),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), PRIMARY_COLOR),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        personal_table.wrapOn(p, width - 100, y_position)
        personal_table.drawOn(p, 50, y_position - 80)
        y_position -= 100
        
        # Check if we need a new page
        if y_position < 200:
            p.showPage()
            y_position = height - 50
            p.setFont(DEFAULT_FONT, 10)
        
        # ==================== PARENT DETAILS SECTION ====================
        p.setFont(DEFAULT_FONT, 12)
        p.setFillColor(PRIMARY_COLOR)
        p.drawString(50, y_position, "PARENT / GUARDIAN DETAILS")
        y_position -= 15
        p.line(50, y_position + 5, width - 50, y_position + 5)
        y_position -= 10
        
        parent_data = [
            ["Father's Name:", enquiry.father_name or "N/A"],
            ["Father's Mobile:", enquiry.father_mobile or "N/A"],
            ["Mother's Name:", enquiry.mother_name or "N/A"],
            ["Mother's Mobile:", enquiry.mother_mobile or "N/A"],
        ]
        
        parent_table = Table(parent_data, colWidths=[100, 350])
        parent_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), DEFAULT_FONT),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), PRIMARY_COLOR),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        parent_table.wrapOn(p, width - 100, y_position)
        parent_table.drawOn(p, 50, y_position - 80)
        y_position -= 100
        
        # ==================== EDUCATION DETAILS SECTION ====================
        p.setFont(DEFAULT_FONT, 12)
        p.setFillColor(PRIMARY_COLOR)
        p.drawString(50, y_position, "EDUCATION DETAILS")
        y_position -= 15
        p.line(50, y_position + 5, width - 50, y_position + 5)
        y_position -= 10
        
        education_data = [
            ["10th Percentage:", f"{enquiry.tenth_marks_percentage}%" if enquiry.tenth_marks_percentage else "N/A"],
            ["12th Percentage:", f"{enquiry.twelfth_marks_percentage}%" if enquiry.twelfth_marks_percentage else "N/A"],
        ]
        
        education_table = Table(education_data, colWidths=[100, 350])
        education_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), DEFAULT_FONT),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), PRIMARY_COLOR),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        education_table.wrapOn(p, width - 100, y_position)
        education_table.drawOn(p, 50, y_position - 50)
        y_position -= 70
        
        # ==================== ADDRESS DETAILS SECTION ====================
        p.setFont(DEFAULT_FONT, 12)
        p.setFillColor(PRIMARY_COLOR)
        p.drawString(50, y_position, "ADDRESS DETAILS")
        y_position -= 15
        p.line(50, y_position + 5, width - 50, y_position + 5)
        y_position -= 10
        
        # Format full address
        address_parts = []
        if enquiry.address_line1:
            address_parts.append(enquiry.address_line1)
        if enquiry.address_line2:
            address_parts.append(enquiry.address_line2)
        if enquiry.city:
            address_parts.append(enquiry.city)
        if enquiry.pincode:
            address_parts.append(f"Pincode: {enquiry.pincode}")
        
        address_data = [
            ["Address:", "\n".join(address_parts) if address_parts else "N/A"],
        ]
        
        address_table = Table(address_data, colWidths=[100, 350])
        address_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), DEFAULT_FONT),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), PRIMARY_COLOR),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        address_table.wrapOn(p, width - 100, y_position)
        address_table.drawOn(p, 50, y_position - 50)
        y_position -= 70
        
        # ==================== REFERENCE SECTION ====================
        if enquiry.reference_name:
            p.setFont(DEFAULT_FONT, 10)
            p.setFillColor(SECONDARY_COLOR)
            p.drawString(50, y_position, f"Reference: {enquiry.reference_name}")
            y_position -= 20
        
        # ==================== FOOTER SECTION ====================
        # Only add footer if there's space, otherwise new page
        if y_position > 100:
            draw_footer(p, width, height)
        else:
            p.showPage()
            draw_footer(p, width, height)
        
        # Save the PDF
        p.save()
        buffer.seek(0)
        
        pdf_size = len(buffer.getvalue())
        logger.info(f"PDF generated successfully for {enquiry.application_id}: {pdf_size} bytes")
        
        if pdf_size == 0:
            logger.error(f"PDF is empty for {enquiry.application_id}")
            return None
            
        return buffer
        
    except Exception as e:
        logger.error(f"Error generating PDF for {enquiry.application_id}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return None


def draw_footer(p, width, height):
    """Draw footer on the page"""
    p.setFont(DEFAULT_FONT, 8)
    p.setFillColor(grey)
    
    # Bottom border line
    p.setStrokeColor(BORDER_COLOR)
    p.setLineWidth(0.5)
    p.line(50, 50, width - 50, 50)
    
    # Footer text
    p.drawCentredString(width / 2, 35, "VAMSHI EDUCARE - Career Guidance Center")
    p.drawCentredString(width / 2, 22, "This is a computer-generated document. No signature required.")
    
    # Page number
    page_num = p.getPageNumber()
    p.drawRightString(width - 50, 22, f"Page {page_num}")


def calculate_age(date_of_birth):
    """Calculate age from date of birth"""
    if not date_of_birth:
        return None
    today = datetime.now().date()
    return today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))


def format_aadhar(aadhar_number):
    """Format Aadhar number as XXXX XXXX XXXX"""
    aadhar_str = str(aadhar_number).replace(' ', '')
    if len(aadhar_str) == 12:
        return f"{aadhar_str[:4]} {aadhar_str[4:8]} {aadhar_str[8:12]}"
    return aadhar_number