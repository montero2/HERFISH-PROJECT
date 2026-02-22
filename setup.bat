@echo off
echo 🚀 HERFISH LEGACY - Installation Script
echo.

echo 📦 Installing root dependencies...
call npm install

echo 📦 Installing frontend dependencies...
call npm install --workspace=frontend

echo 📦 Installing backend dependencies...
call npm install --workspace=backend

echo.
echo ✅ Installation complete!
echo.
echo 📝 Next steps:
echo 1. Start backend: cd backend ^&^& npm run dev
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo 3. Open http://localhost:5173
echo.
