@echo off
REM Car Rental Backend Setup Script for Windows

echo ========================================
echo Car Rental Management System - Backend Setup
echo ========================================
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

node -v
echo [OK] Node.js detected
echo.

REM Check npm
echo Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)

npm -v
echo [OK] npm detected
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Check for .env file
echo Checking environment configuration...
if not exist .env (
    echo [WARNING] .env file not found
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo [WARNING] Please edit .env file with your database credentials
    echo Press any key after updating .env file...
    pause >nul
)
echo [OK] Environment configuration found
echo.

REM Generate Prisma Client
echo Generating Prisma Client...
call npm run prisma:generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate Prisma Client
    pause
    exit /b 1
)
echo [OK] Prisma Client generated
echo.

REM Run migrations
echo Running database migrations...
call npm run prisma:migrate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to run migrations
    echo Please check your database connection in .env file
    pause
    exit /b 1
)
echo [OK] Migrations completed
echo.

REM Seed database
echo Seeding database with sample data...
call npm run prisma:seed
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to seed database
    pause
    exit /b 1
)
echo [OK] Database seeded
echo.

REM Success message
echo ========================================
echo [SUCCESS] Setup completed successfully!
echo.
echo Default login credentials:
echo    Username: samrat
echo    Password: 88889999
echo.
echo To start the server, run:
echo    npm run start:dev
echo.
echo API Documentation will be available at:
echo    http://localhost:3000/api/docs
echo.
echo ========================================
pause
