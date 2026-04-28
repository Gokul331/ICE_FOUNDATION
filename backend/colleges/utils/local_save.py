# utils/local_save.py
import os
import shutil
from django.conf import settings
from datetime import datetime
import zipfile
from io import BytesIO
import logging

logger = logging.getLogger(__name__)


def save_application_locally(application):
    """
    Save application files to local folder.
    Note: On Render free tier, this data will be lost on redeploy.
    For production, use cloud storage like AWS S3.
    """
    try:
        # Check if we're on Render (ephemeral filesystem)
        is_render = os.environ.get('RENDER', False)
        
        if is_render:
            logger.warning("Running on Render - local files will be lost on redeploy")
            # Still try to save, but warn
            base_dir = '/tmp/ice_applications'  # Use temp directory on Render
        else:
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
        if application.pdf_copy and application.pdf_copy.name:
            try:
                # Handle file from database storage
                pdf_content = application.pdf_copy.read()
                pdf_dest = os.path.join(app_folder, f"{application.application_id}_application.pdf")
                with open(pdf_dest, 'wb') as f:
                    f.write(pdf_content)
                saved_files.append(pdf_dest)
                logger.info(f"PDF saved: {pdf_dest}")
                # Reset file pointer
                application.pdf_copy.seek(0)
            except Exception as e:
                logger.error(f"Error saving PDF: {e}")
        
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
                try:
                    # Read file content
                    file_content = file_obj.read()
                    # Get file extension
                    original_filename = os.path.basename(file_obj.name)
                    file_extension = os.path.splitext(original_filename)[1]
                    new_filename = f"{display_name}{file_extension}"
                    file_dest = os.path.join(app_folder, new_filename)
                    
                    # Write file
                    with open(file_dest, 'wb') as f:
                        f.write(file_content)
                    saved_files.append(file_dest)
                    logger.info(f"File saved: {file_dest}")
                    # Reset file pointer
                    file_obj.seek(0)
                except Exception as e:
                    logger.error(f"Error saving {field}: {e}")
        
        # 3. Create a summary text file
        summary_path = os.path.join(app_folder, "application_summary.txt")
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("STUDENT APPLICATION SUMMARY\n")
            f.write("=" * 60 + "\n\n")
            
            f.write(f"Application ID: {application.application_id}\n")
            f.write(f"Submitted Date: {application.submitted_at.strftime('%Y-%m-%d %H:%M:%S') if application.submitted_at else 'N/A'}\n")
            f.write(f"Status: {application.get_status_display() if hasattr(application, 'get_status_display') else application.status}\n\n")
            
            f.write("Personal Information:\n")
            f.write(f"  Name: {application.first_name} {application.last_name}\n")
            f.write(f"  Email: {application.email_id}\n")
            f.write(f"  Mobile: {application.mobile_number}\n")
            f.write(f"  College: {application.college.college_name if application.college else 'N/A'}\n")
            f.write(f"  Course Name: {application.course_name if application.course_name else 'N/A'}\n")
            f.write(f"  Quota: {application.quota_type.upper() if application.quota_type else 'MANAGEMENT'}\n\n")
            
            f.write("Files Included:\n")
            for file_path in saved_files:
                f.write(f"  - {os.path.basename(file_path)}\n")
        
        saved_files.append(summary_path)
        logger.info(f"Summary saved: {summary_path}")
        
        # 4. Create ZIP archive of all files
        zip_path = os.path.join(applications_dir, f"{folder_name}.zip")
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in saved_files:
                arcname = os.path.relpath(file_path, app_folder)
                zipf.write(file_path, arcname)
        
        logger.info(f"ZIP archive created: {zip_path}")
        
        # On Render, also save to a known location for easy download
        if is_render:
            download_path = f"/tmp/ice_applications/{folder_name}.zip"
            shutil.copy2(zip_path, download_path)
            logger.info(f"Also saved to: {download_path}")
        
        return {
            'success': True,
            'folder_path': app_folder,
            'zip_path': zip_path,
            'files_count': len(saved_files)
        }
        
    except Exception as e:
        logger.error(f"Error in save_application_locally: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': str(e),
            'folder_path': None,
            'zip_path': None,
            'files_count': 0
        }


def save_application_media_files(application, request):
    """
    Save media files from request to local folder.
    This function is called during submission to save files as they come.
    """
    try:
        is_render = os.environ.get('RENDER', False)
        
        if is_render:
            base_dir = '/tmp/ice_applications'
        else:
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
        try:
            from .pdf_generator import generate_application_pdf
            pdf_buffer = generate_application_pdf(application)
            pdf_path = os.path.join(app_folder, f"{application.application_id}_application.pdf")
            with open(pdf_path, 'wb') as f:
                f.write(pdf_buffer.getvalue())
            saved_files.append(pdf_path)
            logger.info(f"PDF saved to: {pdf_path}")
        except Exception as e:
            logger.error(f"Error generating/saving PDF: {e}")
        
        # Save uploaded files from request
        file_fields = ['photo', 'aadhar_card', 'tenth_marksheet', 'twelfth_marksheet',
                       'diploma_marksheet', 'ug_marksheet', 'community_marksheet']
        
        for field in file_fields:
            if field in request.FILES:
                uploaded_file = request.FILES[field]
                try:
                    # Get file extension
                    original_name = uploaded_file.name
                    ext = os.path.splitext(original_name)[1]
                    new_filename = f"{field}{ext}"
                    file_path = os.path.join(app_folder, new_filename)
                    
                    # Save file
                    with open(file_path, 'wb+') as destination:
                        for chunk in uploaded_file.chunks():
                            destination.write(chunk)
                    saved_files.append(file_path)
                    logger.info(f"Saved {field}: {file_path}")
                except Exception as e:
                    logger.error(f"Error saving {field}: {e}")
        
        # Create summary file
        summary_path = os.path.join(app_folder, "application_summary.txt")
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("STUDENT APPLICATION SUMMARY\n")
            f.write("=" * 60 + "\n\n")
            
            f.write(f"Application ID: {application.application_id}\n")
            f.write(f"Student Name: {application.first_name} {application.last_name}\n")
            f.write(f"Email: {application.email_id}\n")
            f.write(f"Mobile: {application.mobile_number}\n")
            f.write(f"College: {application.college.college_name if application.college else 'N/A'}\n")
            f.write(f"Course Name: {application.course_name if application.course_name else 'N/A'}\n")
            f.write(f"Quota: {application.quota_type.upper() if application.quota_type else 'MANAGEMENT'}\n")
            f.write(f"Submitted: {application.submitted_at.strftime('%Y-%m-%d %H:%M:%S') if application.submitted_at else 'N/A'}\n\n")
            f.write("Files saved:\n")
            for file_path in saved_files:
                f.write(f"  - {os.path.basename(file_path)}\n")
        
        saved_files.append(summary_path)
        
        # Create ZIP backup
        zip_path = os.path.join(applications_dir, f"{folder_name}.zip")
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in saved_files:
                arcname = os.path.relpath(file_path, app_folder)
                zipf.write(file_path, arcname)
        
        logger.info(f"ZIP backup created: {zip_path}")
        
        return {
            'success': True,
            'folder_path': app_folder,
            'files': saved_files,
            'file_count': len(saved_files),
            'zip_path': zip_path
        }
        
    except Exception as e:
        logger.error(f"Error in save_application_media_files: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': str(e),
            'folder_path': None,
            'files': [],
            'file_count': 0,
            'zip_path': None
        }


def cleanup_old_backups(days=30):
    """
    Clean up backup folders older than specified days.
    Useful for managing disk space on Render.
    """
    try:
        is_render = os.environ.get('RENDER', False)
        
        if is_render:
            base_dir = '/tmp/ice_applications'
        else:
            base_dir = settings.BASE_DIR
        
        applications_dir = os.path.join(base_dir, 'saved_applications')
        
        if not os.path.exists(applications_dir):
            return
        
        current_time = datetime.now()
        deleted_count = 0
        
        for item in os.listdir(applications_dir):
            item_path = os.path.join(applications_dir, item)
            if os.path.isdir(item_path):
                # Check folder modification time
                mod_time = datetime.fromtimestamp(os.path.getmtime(item_path))
                age_days = (current_time - mod_time).days
                
                if age_days > days:
                    shutil.rmtree(item_path)
                    deleted_count += 1
                    logger.info(f"Deleted old backup: {item_path}")
            elif item.endswith('.zip'):
                # Check zip file modification time
                mod_time = datetime.fromtimestamp(os.path.getmtime(item_path))
                age_days = (current_time - mod_time).days
                
                if age_days > days:
                    os.remove(item_path)
                    deleted_count += 1
                    logger.info(f"Deleted old zip: {item_path}")
        
        logger.info(f"Cleanup complete. Deleted {deleted_count} old items.")
        return deleted_count
        
    except Exception as e:
        logger.error(f"Error in cleanup_old_backups: {str(e)}")
        return 0