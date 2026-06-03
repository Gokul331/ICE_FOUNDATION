import os
import dj_database_url
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ==================== CREATE REQUIRED DIRECTORIES ====================
# Create saved_applications directory if it doesn't exist (for storing submitted applications)
SAVED_APPLICATIONS_DIR = BASE_DIR / 'saved_applications'
os.makedirs(SAVED_APPLICATIONS_DIR, exist_ok=True)

# ==================== SECURITY ====================
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-&z+ca)$#0^a(l^nve5dhf0y*8c32om^-$ey#oij06cst@1cpy8')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'  # Changed to False by default

# ALLOWED_HOSTS - critical for Render (NO SPACES)
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1,.onrender.com,.vercel.app,.aceconsultancy.org').split(',')

# CSRF settings for Render - Includes aceconsultancy.org
CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', 'https://*.onrender.com,https://*.vercel.app,https://aceconsultancy.org,https://www.aceconsultancy.org,http://localhost:5173,http://localhost:3000').split(',')

# ==================== APPLICATION DEFINITION ====================
INSTALLED_APPS = [
    'admin_interface',
    'colorfield',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'backend',  # Your main app
    'colleges',  # College app
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [str(BASE_DIR / 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ==================== DATABASE - FIXED FOR RENDER ====================
# Try to get database URLs from environment variables
RENDER_INTERNAL_DATABASE_URL = os.environ.get('RENDER_INTERNAL_DATABASE_URL')
RENDER_EXTERNAL_DATABASE_URL = os.environ.get('RENDER_EXTERNAL_DATABASE_URL')
DATABASE_URL = RENDER_INTERNAL_DATABASE_URL or RENDER_EXTERNAL_DATABASE_URL or os.environ.get('DATABASE_URL')

if DATABASE_URL:
    # Check if using internal connection (no SSL needed)
    using_internal = bool(RENDER_INTERNAL_DATABASE_URL and DATABASE_URL == RENDER_INTERNAL_DATABASE_URL)
    
    # Parse the database URL
    db_config = dj_database_url.parse(DATABASE_URL, conn_max_age=600, conn_health_checks=True)
    
    # Configure SSL properly for Render's PostgreSQL
    if not using_internal:
        # For external connections, SSL is required
        db_config['OPTIONS'] = {
            'sslmode': 'require',
            'connect_timeout': 10,
        }
        print(f"🔌 Using external PostgreSQL: {db_config.get('HOST', 'unknown')} (SSL required)")
    else:
        # Internal connections work without SSL
        db_config['OPTIONS'] = {
            'connect_timeout': 10,
        }
        print(f"🔌 Using internal PostgreSQL: {db_config.get('HOST', 'unknown')} (no SSL needed)")
    
    DATABASES = {
        'default': db_config
    }
    
    # Override connection age if specified
    conn_max_age = os.environ.get('DB_CONN_MAX_AGE')
    if conn_max_age:
        DATABASES['default']['CONN_MAX_AGE'] = int(conn_max_age)
    
    # Test connection on startup (helpful for debugging)
    try:
        from django.db import connections
        connections['default'].cursor()
        print("✅ Database connection successful!")
    except Exception as e:
        print(f"⚠️ Database connection test failed: {e}")
        print("   This might be normal during initial build. Continuing...")
else:
    # Fallback to SQLite for local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': str(BASE_DIR / 'db.sqlite3'),
        }
    }
    print("📦 Using SQLite database for development")

# ==================== CORS SETTINGS ====================
# Allow all origins only in development
CORS_ALLOW_ALL_ORIGINS = DEBUG

# Explicitly allowed origins
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178",
    "http://localhost:5179",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://aceconsultancy.org",
    "https://www.aceconsultancy.org",
]

# Add any CORS origins from environment variable
env_cors_origins = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if env_cors_origins:
    CORS_ALLOWED_ORIGINS.extend([origin.strip() for origin in env_cors_origins.split(',') if origin.strip()])

# Allow all Render.com subdomains via regex
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.onrender\.com$",
    r"^https://.*\.vercel\.app$",
    r"^https://(www\.)?aceconsultancy\.org$",
]

# Allow credentials (cookies, authorization headers)
CORS_ALLOW_CREDENTIALS = True

# Allowed methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Allowed headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ==================== REST FRAMEWORK ====================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# ==================== AUTHENTICATION ====================
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# ==================== PASSWORD VALIDATION ====================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ==================== INTERNATIONALIZATION ====================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'  # IST
USE_I18N = True
USE_TZ = True

# ==================== STATIC & MEDIA FILES ====================
STATIC_URL = '/static/'
STATIC_ROOT = str(BASE_DIR / 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = str(BASE_DIR / 'media')

# ==================== FILE UPLOAD SETTINGS ====================
# Maximum file size for uploads (5MB)
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB in bytes
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB in bytes

# Allowed file extensions for uploads
ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']

# ==================== SECURITY SETTINGS (Production) ====================
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# ==================== EMAIL SETTINGS ====================
if DEBUG:
    # Use console email backend for development
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    print("📧 Using console email backend (development)")
else:
    # Use SMTP backend for production
    EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
    EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
    EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() == 'true'
    EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', 'False').lower() == 'true'
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
    EMAIL_TIMEOUT = int(os.environ.get('EMAIL_TIMEOUT', 30))
    
    # Validate email settings
    if not EMAIL_HOST_USER or not EMAIL_HOST_PASSWORD:
        print("⚠️ WARNING: Email credentials not configured. Email functionality will not work.")

# Default from email
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'ICE Foundation <noreply@icefoundation.com>')
SERVER_EMAIL = os.environ.get('SERVER_EMAIL', DEFAULT_FROM_EMAIL)

# Frontend URL for email links
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://aceconsultancy.org')

# ==================== LOGGING ====================
LOG_LEVEL = os.environ.get('DJANGO_LOG_LEVEL', 'INFO')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': LOG_LEVEL,
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': LOG_LEVEL,
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'ERROR',  # Change to 'DEBUG' to see SQL queries
            'propagate': False,
        },
        'colleges': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'backend': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# ==================== AUTO SUPERUSER CREATION ====================
# Run on Render in production or when DATABASE_URL is set
if os.environ.get('DATABASE_URL') and os.environ.get('DJANGO_SUPERUSER_USERNAME'):
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        
        if password and not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            print(f"✅ Superuser '{username}' created successfully!")
        elif not password:
            print("⚠️ DJANGO_SUPERUSER_PASSWORD not set, skipping superuser creation")
        else:
            print(f"ℹ️ Superuser '{username}' already exists")
    except Exception as e:
        print(f"⚠️ Could not create superuser: {e}")

# ==================== DEFAULT PRIMARY KEY FIELD ====================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

print(f"🚀 Django running in {'DEVELOPMENT' if DEBUG else 'PRODUCTION'} mode")