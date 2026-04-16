# ICE Foundation

A college recommendation platform for 12th-grade students in India.

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python seed_data.py  # Seeds 15 sample colleges
python manage.py runserver 8000
```

### Frontend Setup

```bash
cd my-react-app
npm install
npm run dev
```

## Project Structure

```
frontend/
├── my-react-app/          # React + Vite frontend
│   └── src/
│       ├── components/    # Reusable components
│       │   └── layout/     # Layout with Navbar + Footer
│       ├── pages/          # Page components
│       └── styles/         # CSS files
└── backend/                # Django REST API
    └── api/
        └── accounts/       # User auth & colleges app
```

## API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/register/` | Register new user |
| POST | `/api/login/` | Login user |
| GET | `/api/colleges/` | List all colleges |
| GET | `/api/colleges/<id>/` | College detail |
| GET | `/api/college-suggestions/` | Filtered suggestions |

## Features

- **User Authentication**: Login/Register with Django REST API
- **College Listing**: Browse 500+ partner colleges with filters
- **College Suggestions**: AI-powered matching based on cutoff, category, branch
- **User Profile**: Manage profile and view saved colleges
- **Responsive Design**: Mobile-first with Tailwind CSS v4

## Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS v4
- React Router v6

**Backend:**
- Django 4.2
- Django REST Framework
- SQLite (dev) / PostgreSQL (prod)