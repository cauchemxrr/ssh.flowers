@echo off
echo 🌸 Запуск ssh.flowers Telegram Mini App...
echo.

echo 🔍 Поиск Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python не найден! Устанавливаем...
    echo 📥 Скачайте Python с python.org
    echo ✅ Обязательно поставьте галочку "Add Python to PATH"
    pause
    exit
)

echo ✅ Python найден!
python --version

echo.
echo 📦 Установка зависимостей...
python -m pip install aiogram==2.25.1

echo.
echo 🚀 Запуск бота...
python bot.py

pause
