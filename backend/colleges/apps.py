from django.apps import AppConfig

class CollegeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'colleges'

    def ready(self):
        from .signals import create_admin
        create_admin()