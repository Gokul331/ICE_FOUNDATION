import logging
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

logger = logging.getLogger(__name__)

# ── Colour palette ────────────────────────────────────────────────────────────
PRIMARY      = HexColor('#1a1a2e')   # deep navy
ACCENT       = HexColor('#28a745')   # green
HEADER_BG    = HexColor('#1a1a2e')   # same navy for header bar
SECTION_BG   = HexColor('#eef2f7')   # light blue-grey for section headers
BORDER       = HexColor('#c0c8d8')
LABEL_COLOR  = HexColor('#444444')
VALUE_COLOR  = HexColor('#111111')
WHITE        = white
GREY_TEXT    = HexColor('#888888')

# ── Font setup ────────────────────────────────────────────────────────────────
try:
    _font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'NotoSans-Regular.ttf')
    _bold_path = os.path.join(os.path.dirname(__file__), 'fonts', 'NotoSans-Bold.ttf')
    if os.path.exists(_font_path):
        pdfmetrics.registerFont(TTFont('NotoSans', _font_path))
        FONT       = 'NotoSans'
        FONT_BOLD  = 'NotoSans'          # fall back to same if no bold variant
    else:
        FONT       = 'Helvetica'
        FONT_BOLD  = 'Helvetica-Bold'
except Exception:
    FONT      = 'Helvetica'
    FONT_BOLD = 'Helvetica-Bold'

MARGIN   = 40
COL_W    = [130, 0]   # label width; value width is computed at render time


# ─────────────────────────────────────────────────────────────────────────────
# Public entry point
# ─────────────────────────────────────────────────────────────────────────────
def generate_application_pdf(enquiry):
    """
    Generate a professional, well-aligned PDF for the scholarship application.

    Args:
        enquiry: EnquiryForm model instance
    Returns:
        BytesIO buffer containing the PDF, or None on error
    """
    buffer = BytesIO()
    try:
        c = canvas.Canvas(buffer, pagesize=A4)
        W, H = A4

        y = _draw_header(c, W, H, enquiry)
        y = _draw_title(c, W, y)

        # ── Sections ─────────────────────────────────────────────────────────
        personal_rows = [
            ("Full Name",     f"{enquiry.first_name} {enquiry.last_name or ''}".strip()),
            ("Gender",        enquiry.get_gender_display() or enquiry.gender or "N/A"),
            ("Date of Birth", enquiry.date_of_birth.strftime('%d %b %Y') if enquiry.date_of_birth else "N/A"),
            ("Age",           f"{_age(enquiry.date_of_birth)} years" if enquiry.date_of_birth else "N/A"),
            ("Mobile Number", enquiry.mobile_number or "N/A"),
            ("Email ID",      enquiry.email_id or "N/A"),
            ("Aadhar Number", _fmt_aadhar(enquiry.aadhar_number) if enquiry.aadhar_number else "N/A"),
            ("Blood Group",   enquiry.blood_group or "N/A"),
        ]

        parent_rows = [
            ("Father's Name",   enquiry.father_name   or "N/A"),
            ("Father's Mobile", enquiry.father_mobile or "N/A"),
            ("Mother's Name",   enquiry.mother_name   or "N/A"),
            ("Mother's Mobile", enquiry.mother_mobile or "N/A"),
        ]

        academic_rows = [
            ("College",          enquiry.college.college_name if enquiry.college else "N/A"),
            ("College Location", f"{enquiry.college.location_city}, {enquiry.college.location_state}" if enquiry.college else "N/A"),
            ("Category",         enquiry.get_selected_category_display() or enquiry.selected_category or "N/A"),
            ("Degree Type",      enquiry.get_selected_degree_type_display() or enquiry.selected_degree_type or "N/A"),
            ("Course",           enquiry.course_name     or "N/A"),
            ("10th Percentage",  f"{enquiry.tenth_marks_percentage}%"   if enquiry.tenth_marks_percentage   else "N/A"),
            ("12th Percentage",  f"{enquiry.twelfth_marks_percentage}%" if enquiry.twelfth_marks_percentage else "N/A"),
        ]

        addr_parts = [
            enquiry.address_line1,
            enquiry.address_line2,
            enquiry.city,
            f"Pincode: {enquiry.pincode}" if enquiry.pincode else None,
        ]
        address_rows = [
            ("Address", "\n".join(p for p in addr_parts if p) or "N/A"),
        ]

        sections = [
            ("PERSONAL DETAILS",      personal_rows),
            ("PARENT / GUARDIAN DETAILS", parent_rows),
            ("ACADEMIC DETAILS",       academic_rows),
            ("ADDRESS DETAILS",        address_rows),
        ]

        for title, rows in sections:
            y = _maybe_new_page(c, W, H, y, needed=60)
            y = _draw_section(c, W, H, y, title, rows)

        # ── Reference ────────────────────────────────────────────────────────
        if getattr(enquiry, 'reference_name', None):
            y = _maybe_new_page(c, W, H, y, needed=30)
            c.setFont(FONT, 9)
            c.setFillColor(GREY_TEXT)
            c.drawString(MARGIN, y, f"Reference: {enquiry.reference_name}")
            y -= 20

        _draw_footer(c, W)
        c.save()

        buffer.seek(0)
        size = len(buffer.getvalue())
        logger.info(f"PDF generated for {enquiry.application_id}: {size} bytes")
        return buffer if size else None

    except Exception as e:
        logger.error(f"PDF generation failed: {e}", exc_info=True)
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _draw_header(c, W, H, enquiry):
    """
    Dark navy header bar.
    LEFT  → company name + subtitle
    RIGHT → Application ID + date
    Returns y position below the header.
    """
    BAR_H = 64
    # Background rectangle
    c.setFillColor(HEADER_BG)
    c.rect(0, H - BAR_H, W, BAR_H, fill=1, stroke=0)

    # ── Left: Company name ────────────────────────────────────────────────
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 16)
    c.drawString(MARGIN, H - 26, "VAMSHI EDUCARE")

    c.setFont(FONT, 9)
    c.setFillColor(HexColor('#aabbcc'))
    c.drawString(MARGIN, H - 42, "Career Guidance Center")

    # ── Right: App ID + date ──────────────────────────────────────────────
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 9)
    c.drawRightString(W - MARGIN, H - 24, f"Application ID:  {enquiry.application_id}")

    c.setFont(FONT, 8)
    c.setFillColor(HexColor('#aabbcc'))
    c.drawRightString(W - MARGIN, H - 38, datetime.now().strftime('%d %b %Y  %I:%M %p'))

    # ── Accent underline ──────────────────────────────────────────────────
    c.setStrokeColor(ACCENT)
    c.setLineWidth(2)
    c.line(0, H - BAR_H, W, H - BAR_H)

    return H - BAR_H - 14   # y below header


def _draw_title(c, W, y):
    """Centred page title with green underline."""
    c.setFont(FONT_BOLD, 14)
    c.setFillColor(PRIMARY)
    c.drawCentredString(W / 2, y, "SCHOLARSHIP APPLICATION FORM")

    c.setStrokeColor(ACCENT)
    c.setLineWidth(1.5)
    ul_w = 180
    c.line(W / 2 - ul_w / 2, y - 4, W / 2 + ul_w / 2, y - 4)

    return y - 22


def _draw_section(c, W, H, y, title, rows):
    """
    Draw a labelled section with a bordered table.
    Returns the y position after the section.
    """
    avail_w  = W - 2 * MARGIN
    label_w  = 140
    value_w  = avail_w - label_w

    # ── Section header bar ────────────────────────────────────────────────
    HEADER_H = 18
    c.setFillColor(SECTION_BG)
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.rect(MARGIN, y - HEADER_H + 4, avail_w, HEADER_H, fill=1, stroke=1)

    c.setFont(FONT_BOLD, 9)
    c.setFillColor(PRIMARY)
    c.drawString(MARGIN + 6, y - HEADER_H + 8, title)

    y -= HEADER_H

    # ── Data table ────────────────────────────────────────────────────────
    table_data = [[label, value] for label, value in rows]

    tbl = Table(table_data, colWidths=[label_w, value_w])
    tbl.setStyle(TableStyle([
        # Font
        ('FONTNAME',    (0, 0), (-1, -1), FONT),
        ('FONTSIZE',    (0, 0), (-1, -1), 9),

        # Label column styling
        ('FONTNAME',    (0, 0), (0, -1), FONT_BOLD),
        ('TEXTCOLOR',   (0, 0), (0, -1), LABEL_COLOR),
        ('BACKGROUND',  (0, 0), (0, -1), HexColor('#f7f9fc')),

        # Value column styling
        ('TEXTCOLOR',   (1, 0), (1, -1), VALUE_COLOR),
        ('BACKGROUND',  (1, 0), (1, -1), WHITE),

        # Alignment
        ('ALIGN',       (0, 0), (0, -1), 'LEFT'),
        ('ALIGN',       (1, 0), (1, -1), 'LEFT'),
        ('VALIGN',      (0, 0), (-1, -1), 'TOP'),

        # Padding
        ('TOPPADDING',    (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING',   (0, 0), (-1, -1), 8),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 8),

        # Borders
        ('BOX',         (0, 0), (-1, -1), 0.5, BORDER),
        ('INNERGRID',   (0, 0), (-1, -1), 0.3, BORDER),

        # Alternating row tint on value column
        *[('BACKGROUND', (1, i), (1, i), HexColor('#fafbfd') if i % 2 == 0 else WHITE)
          for i in range(len(rows))],
    ]))

    tbl_w, tbl_h = tbl.wrapOn(c, avail_w, y)
    # Check page break
    if y - tbl_h < 70:
        c.showPage()
        _draw_footer(c, W)
        y = H - 50

    tbl.drawOn(c, MARGIN, y - tbl_h)
    return y - tbl_h - 14    # gap between sections


def _draw_footer(c, W):
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(MARGIN, 48, W - MARGIN, 48)

    c.setFont(FONT_BOLD, 8)
    c.setFillColor(PRIMARY)
    c.drawCentredString(W / 2, 34, "VAMSHI EDUCARE  ·  Career Guidance Center")

    c.setFont(FONT, 7.5)
    c.setFillColor(GREY_TEXT)
    c.drawCentredString(W / 2, 22, "Computer-generated document — no signature required.")

    page_num = c.getPageNumber()
    c.drawRightString(W - MARGIN, 22, f"Page {page_num}")


def _maybe_new_page(c, W, H, y, needed=120):
    """Start a new page if there isn't enough vertical space."""
    if y < needed + 60:
        c.showPage()
        _draw_footer(c, W)
        return H - 50
    return y


def _age(dob):
    if not dob:
        return None
    today = datetime.now().date()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def _fmt_aadhar(num):
    s = str(num).replace(' ', '')
    return f"{s[:4]} {s[4:8]} {s[8:12]}" if len(s) == 12 else num