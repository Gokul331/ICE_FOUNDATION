# colleges/management/commands/save_applications_locally.py
import os
import shutil
import zipfile
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.files.storage import default_storage
from colleges.models import StudentApplication

class Command(BaseCommand):
    help = 'Save all applications to local folder'

    def handle(self, *args, **options):
        applications = StudentApplication.objects.all()
        
        if not applications.exists():
            self.stdout.write(self.style.WARNING("No applications found!"))
            return
        
        self.stdout.write(f"Found {applications.count()} applications")
        self.stdout.write("=" * 60)
        
        # Create base directory
        base_dir = settings.SAVED_APPLICATIONS_DIR
        os.makedirs(base_dir, exist_ok=True)
        
        success_count = 0
        error_count = 0
        
        for app in applications:
            try:
                self.stdout.write(f"\nProcessing: {app.application_id} - {app.first_name} {app.last_name}")
                
                # Create folder for this application
                folder_name = f"{app.application_id}_{app.first_name}_{app.last_name}".replace(' ', '_')
                app_folder = os.path.join(base_dir, folder_name)
                os.makedirs(app_folder, exist_ok=True)
                
                saved_files = []
                
                # 1. Save PDF if exists
                if app.pdf_copy and app.pdf_copy.name:
                    pdf_path = os.path.join(app_folder, f"{app.application_id}_application.pdf")
                    if default_storage.exists(app.pdf_copy.name):
                        with default_storage.open(app.pdf_copy.name, 'rb') as f:
                            with open(pdf_path, 'wb') as out_f:
                                out_f.write(f.read())
                        saved_files.append(pdf_path)
                        self.stdout.write(f"  ✓ PDF saved")
                
                # 2. Save uploaded files
                file_fields = [
                    ('photo', 'photo'),
                    ('aadhar_card', 'aadhar_card'),
                    ('tenth_marksheet', '10th_marksheet'),
                    ('twelfth_marksheet', '12th_marksheet'),
                    ('diploma_marksheet', 'diploma_marksheet'),
                    ('ug_marksheet', 'ug_marksheet'),
                    ('community_marksheet', 'community_certificate')
                ]
                
                for field_name, display_name in file_fields:
                    file_obj = getattr(app, field_name)
                    if file_obj and file_obj.name:
                        try:
                            # Get file extension
                            original_name = os.path.basename(file_obj.name)
                            ext = os.path.splitext(original_name)[1]
                            new_filename = f"{display_name}{ext}"
                            file_dest = os.path.join(app_folder, new_filename)
                            
                            # Copy file
                            if default_storage.exists(file_obj.name):
                                with default_storage.open(file_obj.name, 'rb') as f:
                                    with open(file_dest, 'wb') as out_f:
                                        out_f.write(f.read())
                                saved_files.append(file_dest)
                                self.stdout.write(f"  ✓ {display_name} saved")
                        except Exception as e:
                            self.stdout.write(f"  ✗ Failed to save {display_name}: {str(e)}")
                
                # 3. Create summary file
                summary_path = os.path.join(app_folder, "application_summary.txt")
                with open(summary_path, 'w', encoding='utf-8') as f:
                    f.write("=" * 60 + "\n")
                    f.write("STUDENT APPLICATION SUMMARY\n")
                    f.write("=" * 60 + "\n\n")
                    
                    f.write(f"Application ID: {app.application_id}\n")
                    f.write(f"Submitted: {app.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"Status: {app.status}\n\n")
                    
                    f.write("Personal Information:\n")
                    f.write(f"  Name: {app.first_name} {app.last_name}\n")
                    f.write(f"  Email: {app.email_id}\n")
                    f.write(f"  Mobile: {app.mobile_number}\n")
                    f.write(f"  College: {app.college.college_name if app.college else 'N/A'}\n")
                    f.write(f"  Course ID: {app.course_id}\n")
                    f.write(f"  Quota: {app.quota_type}\n\n")
                    
                    f.write("Files Saved:\n")
                    for file_path in saved_files:
                        f.write(f"  - {os.path.basename(file_path)}\n")
                
                saved_files.append(summary_path)
                self.stdout.write(f"  ✓ Summary saved")
                
                # 4. Create ZIP backup
                zip_path = os.path.join(base_dir, f"{folder_name}.zip")
                with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for file_path in saved_files:
                        arcname = os.path.relpath(file_path, app_folder)
                        zipf.write(file_path, arcname)
                
                self.stdout.write(f"  ✓ ZIP backup created: {os.path.basename(zip_path)}")
                self.stdout.write(self.style.SUCCESS(f"✓ Successfully saved {app.application_id} ({len(saved_files)} files)"))
                success_count += 1
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"✗ Failed to save {app.application_id}: {str(e)}"))
                error_count += 1
                import traceback
                traceback.print_exc()
        
        self.stdout.write("=" * 60)
        self.stdout.write(self.style.SUCCESS(f"\n✅ Completed! Success: {success_count}, Failed: {error_count}"))
        self.stdout.write(f"📁 Files saved in: {base_dir}")