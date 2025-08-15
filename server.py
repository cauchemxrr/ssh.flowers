#!/usr/bin/env python3
"""
Простой веб-сервер для тестирования Telegram Mini App ssh.flowers
"""

import http.server
import socketserver
import os
import ssl
from pathlib import Path

# Настройки сервера
PORT = 8000
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # Добавляем CORS заголовки для Telegram Mini App
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        # Обработка preflight запросов
        self.send_response(200)
        self.end_headers()

def main():
    print(f"🌸 Запуск веб-сервера для ssh.flowers...")
    print(f"📁 Директория: {DIRECTORY}")
    print(f"🌐 URL: http://localhost:{PORT}")
    print(f"📱 Для тестирования Mini App используйте ngrok или разместите на HTTPS сервере")
    print(f"🔒 Примечание: Telegram Mini App требует HTTPS!")
    print()
    
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"✅ Сервер запущен на порту {PORT}")
            print(f"🛑 Для остановки нажмите Ctrl+C")
            print()
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен")
    except Exception as e:
        print(f"❌ Ошибка запуска сервера: {e}")

if __name__ == "__main__":
    main()
