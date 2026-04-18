#!/bin/bash

# ICE Foundation - Start Development Servers
# Run this script to start both frontend and backend

echo "Starting ICE Foundation Development Servers..."
echo ""

# Function to check if port is in use
check_port() {
  if lsof -i:$1 > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Start Django Backend
if check_port 8000; then
  echo "⚠️  Port 8000 is in use - Django may already be running"
else
  echo "🚀 Starting Django Backend on https://ice-foundation-1.onrender.com/api/"
  cd backend && python manage.py runserver 8000 &
fi

# Wait a bit for Django to start
sleep 2

# Start React Frontend
if check_port 5173; then
  echo "⚠️  Port 5173 is in use - Frontend may already be running"
else
  echo "🚀 Starting React Frontend on https://icefoundation.vercel.app/"
  cd my-react-app && npm run dev &
fi

echo ""
echo "✅ Servers starting..."
echo "   Frontend: https://icefoundation.vercel.app/"
echo "   Backend:  https://ice-foundation-1.onrender.com/api/"
echo ""
echo "Press Ctrl+C to stop servers"