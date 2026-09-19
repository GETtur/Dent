@echo off
chcp 65001 >nul
title DENTAL OS - Student Edition
echo ===================================================
echo     🦷 DENTAL OS - Запуск учебной платформы
echo ===================================================
echo.
if not exist node_modules (
    echo [1/2] Установка необходимых библиотек... Это займет 1-2 минуты...
    call npm install
    echo.
)
echo [2/2] Запуск сервера и интерфейса...
echo Откройте в браузере: http://localhost:5173
echo.
call npm run dev
pause
