# utils/local_save.py
import os
import shutil
from django.conf import settings
from datetime import datetime
import zipfile
from io import BytesIO

def save_application_locally(application):
    """Save application files to local folder"""
    
    # Create base directory for applications
    base_dir = settings.BASE_DIR
    applications_dir = os.path.join(base_dir, 'saved_applications')
    
    # Create folder with application name and ID
    folder_name = f"{application.application_id}_{application.first_name}_{application.last_name}"
    folder_name = folder_name.replace(' ', '_')
    app_folder = os.path.join(applications_dir, folder_name)
    
    # Create the folder
    os.makedirs(app_folder, exist_ok=True)
    
    saved_files = []
    
    # 1. Save PDF if exists
    if application.pdf_copy and application.pdf_copy.path:
        pdf_dest = os.path.join(app_folder, f"{application.application_id}_application.pdf")
        shutil.copy2(application.pdf_copy.path, pdf_dest)
        saved_files.append(pdf_dest)
        print(f"PDF saved: {pdf_dest}")
    
    # 2. Save all uploaded files
    file_fields = {
        'photo': 'photo',
        'aadhar_card': 'aadhar_card',
        'tenth_marksheet': '10th_marksheet',
        'twelfth_marksheet': '12th_marksheet',
        'diploma_marksheet': 'diploma_marksheet',
        'ug_marksheet': 'ug_marksheet',
        'community_marksheet': 'community_certificate'
    }
    
    for field, display_name in file_fields.items():
        file_obj = getattr(application, field)
        if file_obj and file_obj.name:
            # Get original filename
            original_filename = os.path.basename(file_obj.name)
            # Create new filename with field name
            file_extension = os.path.splitext(original_filename)[1]
            new_filename = f"{display_name}{file_extension}"
            file_dest = os.path.join(app_folder, new_filename)
            
            # Copy file
            if hasattr(file_obj, 'path') and file_obj.path:
                shutil.copy2(file_obj.path, file_dest)
                saved_files.append(file_dest)
                print(f"File saved: {file_dest}")
    
    # 3. Create a summary text file
    summary_path = os.path.join(app_folder, "application_summary.txt")
    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write("=" * 60 + "\n")
        f.write("STUDENT APPLICATION SUMMARY\n")
        f.write("=" * 60 + "\n\n")
        
        f.write(f"Application ID: {application.application_id}\n")
        f.write(f"Submitted Date: {application.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Status: {application.get_status_display()}\n\n")
        
        f.write("Personal Information:\n")
        f.write(f"  Name: {application.first_name} {application.last_name}\n")
        f.write(f"  Email: {application.email_id}\n")
        f.write(f"  Mobile: {application.mobile_number}\n")
        f.write(f"  College: {application.college.college_name if application.college else 'N/A'}\n")
        f.write(f"  Course ID: {application.course_id}\n")
        f.write(f"  Quota: {application.get_quota_type_display()}\n\n")
        
        f.write("Files Included:\n")
        for file_path in saved_files:
            f.write(f"  - {os.path.basename(file_path)}\n")
    
    saved_files.append(summary_path)
    print(f"Summary saved: {summary_path}")
    
    # 4. Create ZIP archive of all files
    zip_path = os.path.join(applications_dir, f"{folder_name}.zip")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in saved_files:
            arcname = os.path.relpath(file_path, app_folder)
            zipf.write(file_path, arcname)
    
    print(f"ZIP archive created: {zip_path}")
    
    return {
        'folder_path': app_folder,
        'zip_path': zip_path,
        'files_count': len(saved_files)
    }

def save_application_media_files(application, request):
    """Save media files from request to local folder"""
    
    # Create applications directory in project root
    base_dir = settings.BASE_DIR
    applications_dir = os.path.join(base_dir, 'saved_applications')
    os.makedirs(applications_dir, exist_ok=True)
    
    # Create folder for this application
    folder_name = f"{application.application_id}_{application.first_name}_{application.last_name}"
    folder_name = folder_name.replace(' ', '_')
    app_folder = os.path.join(applications_dir, folder_name)
    os.makedirs(app_folder, exist_ok=True)
    
    saved_files = []
    
    # Generate and save PDF
    from .pdf_generator import generate_application_pdf
    pdf_buffer = generate_application_pdf(application)
    pdf_path = os.path.join(app_folder, f"{application.application_id}_application.pdf")
    with open(pdf_path, 'wb') as f:
        f.write(pdf_buffer.getvalue())
    saved_files.append(pdf_path)
    
    # Save uploaded files
    file_fields = ['photo', 'aadhar_card', 'tenth_marksheet', 'twelfth_marksheet',
                   'diploma_marksheet', 'ug_marksheet', 'community_marksheet']
    
    for field in file_fields:
        if field in request.FILES:
            uploaded_file = request.FILES[field]
            file_path = os.path.join(app_folder, f"{field}_{uploaded_file.name}")
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)
            saved_files.append(file_path)
    
    # Create summary file
    summary_path = os.path.join(app_folder, "application_summary.txt")
    with open(summary_path, 'w') as f:
        f.write(f"Application ID: {application.application_id}\n")
        f.write(f"Student Name: {application.first_name} {application.last_name}\n")
        f.write(f"Email: {application.email_id}\n")
        f.write(f"Mobile: {application.mobile_number}\n")
        f.write(f"College: {application.college.college_name if application.college else 'N/A'}\n")
        f.write(f"Course ID: {application.course_id}\n")
        f.write(f"Quota: {application.get_quota_type_display()}\n")
        f.write(f"Submitted: {application.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("Files saved:\n")
        for file_path in saved_files:
            f.write(f"  - {os.path.basename(file_path)}\n")
    
    saved_files.append(summary_path)
    
    return {
        'folder_path': app_folder,
        'files': saved_files,
        'file_count': len(saved_files)
    }