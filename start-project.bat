@echo off
echo ===================================================
echo   Employee Leave Management System Launcher
echo ===================================================

:: 1. Check if database is running (port 3306)
netstat -ano | findstr 3306 > nul
if %ERRORLEVEL% equ 0 (
    echo Database is already running on port 3306.
) else (
    echo Database is not running. Launching start-db.bat...
    start "MySQL-Server" /B cmd.exe /c start-db.bat
    timeout /t 5 > nul
)

:: 2. Launch Spring Boot Backend
echo Launching Spring Boot backend...
start "LMS-Backend" /D backend "..\.maven\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run

:: 3. Launch React Frontend
echo Launching React frontend...
start "LMS-Frontend" /D frontend cmd.exe /c npm run dev

echo ===================================================
echo   All systems launched!
echo   - Backend:  http://localhost:8080
echo   - Frontend: http://localhost:5173
echo ===================================================
