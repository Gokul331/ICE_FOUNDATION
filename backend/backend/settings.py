import os
import dj_database_url
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Security - use environment variables
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-&z+ca)$#0^a(l^nve5dhf0y*8c32om^-$ey#oij06cst@1cpy8')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# ALLOWED_HOSTS - critical for Render
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1,.onrender.com').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'backend',
    'colleges',
    'jazzmin',

]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # For development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5179",
    "http://127.0.0.1:3000",
    "https://icefoundation.vercel.app",
    "https://*.onrender.com",
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

# Database - PostgreSQL on Render, SQLite locally
if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(conn_max_age=600, ssl_require=True)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# CSRF settings for Render
CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', 'https://*.onrender.com,https://icefoundation.vercel.app').split(',')

# Security settings for production
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

INSTALLED_APPS = [
    'jazzmin',  # ⚠️ MUST be before 'django.contrib.admin'
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'backend',
    'colleges',
]

# Add Jazzmin settings (add after your INSTALLED_APPS)
JAZZMIN_SETTINGS = {
    # Title of the window (Will default to current_admin_site.site_title)
    "site_title": "ICE Foundation Admin",

    # Title on the login screen (19 chars max)
    "site_header": "ICE Foundation",

    # Title on the brand (19 chars max)
    "site_brand": "ICE Foundation",

    # Logo to use for your site, must be present in static files
    "site_logo": "assets/img/logo.png",  # Optional: add your logo

    # CSS classes that are applied to the logo
    "site_logo_classes": "img-circle",

    # Welcome text on the login screen
    "welcome_sign": "Welcome to ICE Foundation Admin Panel",

    # Copyright footer
    "copyright": "ICE Foundation",

    # The model admin to search from the search bar
    "search_model": "auth.User",

    # Field name on user model that contains avatar image
    "user_avatar": None,

    ############
    # Top Menu #
    ############
    # Links to put along the top menu
    "topmenu_links": [
        # Url that gets reversed (Permissions can be added)
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        
        # External url that opens in a new window
        {"name": "Frontend", "url": "https://icefoundation.vercel.app", "new_window": True},
        
        # Model admin to link to
        {"model": "auth.User"},
    ],

    #############
    # Side Menu #
    #############
    # Whether to display the side menu
    "show_sidebar": True,

    # Whether to aut expand the menu
    "navigation_expanded": True,

    # Hide these apps when generating side menu
    "hide_apps": [],

    # Hide these models when generating side menu
    "hide_models": [],

    # Custom icons for side menu apps/models
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.group": "fas fa-users",
        "colleges.College": "fas fa-university",
        "colleges.Company": "fas fa-building",
        "colleges.UserProfile": "fas fa-id-card",
    },

    # Icons that are used when one is not manually specified
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    #################
    # Related Modal #
    #################
    # Use modals instead of popups
    "related_modal_active": False,

    #############
    # UI Tweaks #
    #############
    # Relative paths to custom CSS/JS scripts
    "custom_css": None,
    "custom_js": None,
    # Whether to show the UI builder
    "show_ui_builder": True,  # ⚠️ Enable this for live customization

    ###############
    # Change view #
    ###############
    # Render out the change view as a single form
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {"auth.user": "collapsible", "auth.group": "vertical_tabs"},
}

# UI Tweaks for colors, sidebar style, etc.
JAZZMIN_UI_TWEAKS = {
    "navbar_small": False,
    "footer_small": False,
    "body_small": False,
    "brand_small": False,
    "sidebar_nav_small": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "flatly",  # Options: 'default', 'darkly', 'flatly', 'litera', 'lumen', 'minty', 'pulse', 'sandstone', 'simplex', 'spacelab', 'united', 'yeti', 'cyborg'
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
    "actions_sticky_top": False,
}