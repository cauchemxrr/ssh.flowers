import logging
import json
from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command
from aiogram import Router
import asyncio

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Конфигурация
API_TOKEN = "8395025224:AAFbApm2m28qAqKXwIRL2Sgj36dcLddgyn4"  # Ваш токен
ADMIN_ID = 5315749575  # Ваш Telegram ID
WEBAPP_URL = "https://cauchemxrr.github.io/ssh.flowers/"

# Инициализация бота и диспетчера
bot = Bot(token=API_TOKEN)
dp = Dispatcher()
router = Router()

@router.message(Command("start"))
async def start(msg: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🌸 Открыть ssh.flowers",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])
    await msg.answer(
        "💐 Добро пожаловать в ssh.flowers!\n\n"
        "Нажмите кнопку ниже, чтобы открыть приложение:",
        reply_markup=kb
    )

@router.message(lambda msg: msg.web_app_data is not None)
async def handle_webapp_data(msg: types.Message):
    try:
        data = msg.web_app_data.data
        logging.info(f"Получены данные из Mini App: {data}")
        
        try:
            order_data = json.loads(data)
        except json.JSONDecodeError:
            await msg.answer("❌ Ошибка при обработке данных заказа.")
            return

        # Определяем тип данных и обрабатываем соответственно
        if order_data.get('type') == 'bouquet_order':
            await handle_order(msg, order_data)
        elif order_data.get('type') == 'contact':
            await handle_contact(msg, order_data)
        elif order_data.get('type') == 'custom_bouquet_request':
            await handle_custom_bouquet_request(msg, order_data)
        else:
            await handle_general_data(msg, order_data)

    except Exception as e:
        logging.error(f"Ошибка обработки данных Mini App: {e}")
        await msg.answer("Произошла ошибка при обработке данных.")

async def handle_order(msg: types.Message, order_data: dict):
    """Обработка заказов готовых букетов"""
    try:
        user = order_data.get('user', {})
        name = order_data.get('name', 'Не указано')
        price = order_data.get('price', 0)
        category = order_data.get('category', 'Не указано')
        timestamp = order_data.get('timestamp', '')

        # Формируем текст заказа для админа
        order_text = f"🆕 **ЗАКАЗ ГОТОВОГО БУКЕТА ИЗ ssh.flowers!**\n\n"
        order_text += f"👤 **Покупатель:** @{user.get('username', 'Не указан')}\n"
        order_text += f"🆔 **ID:** {user.get('id', 'Не указан')}\n"
        order_text += f"📅 **Дата:** {timestamp}\n"
        order_text += f"💐 **Букет:** {name}\n"
        order_text += f"📂 **Категория:** {category}\n"
        order_text += f"💰 **Цена:** {price} ₽\n\n"
        order_text += f"💬 **Ответить:** @{user.get('username', 'Не указан')}"

        # Отправляем заказ админу
        await bot.send_message(ADMIN_ID, order_text, parse_mode="Markdown")
        logging.info(f"Заказ готового букета отправлен админу: {order_data}")

        # Отправляем подтверждение пользователю
        await msg.answer(
            "✅ **Ваш заказ принят!**\n\n"
            f"💐 **Букет:** {name}\n"
            f"📂 **Категория:** {category}\n"
            f"💰 **Цена:** {price} ₽\n\n"
            "📞 **Что дальше?**\n"
            "• Наш менеджер свяжется с вами в течение 30 минут\n"
            "• Уточнит детали доставки\n"
            "• Согласует время и адрес\n"
            "• Подтвердит способ оплаты\n\n"
            "⏰ **Время работы:** 9:00 - 21:00\n"
            "📱 **Связь:** @sshflowersbot\n\n"
            "🌸 **Спасибо за выбор ssh.flowers!**",
            parse_mode="Markdown"
        )
        logging.info(f"Заказ готового букета от пользователя {user.get('id')} успешно обработан")
        
    except Exception as e:
        logging.error(f"Ошибка обработки заказа готового букета: {e}")
        await msg.answer("❌ Произошла ошибка при обработке заказа. Попробуйте еще раз.")

async def handle_custom_bouquet_request(msg: types.Message, request_data: dict):
    """Обработка запросов на создание букета"""
    try:
        user = request_data.get('user', {})
        count = request_data.get('count', 'Не указано')
        flowers = request_data.get('flowers', 'Не указано')
        package = request_data.get('package', 'Не указано')
        card = request_data.get('card', 'Не указано')
        wishes = request_data.get('wishes', 'Не указано')
        timestamp = request_data.get('timestamp', '')

        # Формируем текст запроса для админа
        request_text = f"🎨 **ЗАПРОС НА СОЗДАНИЕ БУКЕТА ИЗ ssh.flowers!**\n\n"
        request_text += f"👤 **Покупатель:** @{user.get('username', 'Не указан')}\n"
        request_text += f"🆔 **ID:** {user.get('id', 'Не указан')}\n"
        request_text += f"📅 **Дата:** {timestamp}\n\n"
        request_text += "🌺 **Детали букета:**\n"
        request_text += f"• Количество цветов: {count}\n"
        request_text += f"• Виды цветов: {flowers}\n"
        request_text += f"• Упаковка: {package}\n"

        if card and card.lower() != 'нет':
            request_text += f"• Открытка: {card}\n"

        if wishes:
            request_text += f"• Пожелания: {wishes}\n"

        request_text += f"\n💬 **Ответить:** @{user.get('username', 'Не указан')}"

        # Отправляем запрос админу
        await bot.send_message(ADMIN_ID, request_text, parse_mode="Markdown")
        logging.info(f"Запрос на создание букета отправлен админу: {request_data}")

        # Отправляем подтверждение пользователю
        await msg.answer(
            "✅ **Ваш запрос отправлен!**\n\n"
            "🎨 Мы получили ваши пожелания по созданию букета\n"
            "📞 Наш дизайнер свяжется с вами для уточнения деталей\n"
            "💰 И сообщит точную стоимость\n\n"
            "⏰ **Время работы:** 9:00 - 21:00\n"
            "📱 **Связь:** @sshflowersbot\n\n"
            "🌸 **Спасибо за выбор ssh.flowers!**",
            parse_mode="Markdown"
        )
        logging.info(f"Запрос на создание букета от пользователя {user.get('id')} успешно обработан")
        
    except Exception as e:
        logging.error(f"Ошибка обработки запроса на создание букета: {e}")
        await msg.answer("❌ Произошла ошибка при отправке запроса. Попробуйте еще раз.")

async def handle_contact(msg: types.Message, contact_data: dict):
    """Обработка сообщений для связи"""
    try:
        user = contact_data.get('user', {})
        message = contact_data.get('message', '')

        # Формируем текст сообщения для админа
        contact_text = f"💬 **НОВОЕ СООБЩЕНИЕ ИЗ ssh.flowers**\n\n"
        contact_text += f"👤 **От:** @{user.get('username', 'Не указан')}\n"
        contact_text += f"🆔 **ID:** {user.get('id', 'Не указан')}\n"
        contact_text += f"📝 **Сообщение:**\n{message}\n\n"
        contact_text += f"💬 **Ответить:** @{user.get('username', 'Не указан')}"

        # Отправляем сообщение админу
        await bot.send_message(ADMIN_ID, contact_text, parse_mode="Markdown")
        logging.info(f"Сообщение для связи отправлено админу: {contact_data}")

        # Отправляем подтверждение пользователю
        await msg.answer(
            "✅ **Ваше сообщение отправлено!**\n\n"
            "📧 Мы свяжемся с вами в ближайшее время.",
            parse_mode="Markdown"
        )
        logging.info(f"Сообщение от пользователя {user.get('id')} успешно обработано")
        
    except Exception as e:
        logging.error(f"Ошибка обработки сообщения: {e}")
        await msg.answer("❌ Произошла ошибка при отправке сообщения. Попробуйте еще раз.")

async def handle_general_data(msg: types.Message, data: dict):
    """Обработка общих данных"""
    try:
        user = data.get('user', {})
        logging.info(f"Общие данные от пользователя {user.get('id')}: {data}")
        await msg.answer("✅ Данные получены! Скоро с вами свяжемся.")
    except Exception as e:
        logging.error(f"Ошибка обработки общих данных: {e}")
        await msg.answer("❌ Произошла ошибка при обработке данных.")

# Подключаем роутер к диспетчеру
dp.include_router(router)

async def main():
    try:
        print("🚀 Бот ssh.flowers запущен!")
        print(f"👑 Админ ID: {ADMIN_ID}")
        print(f"🌐 Mini App URL: {WEBAPP_URL}")
        print("📱 Ожидаю заказы и сообщения...")
        await dp.start_polling(bot, skip_updates=True)
    except Exception as e:
        logging.error(f"Ошибка запуска бота: {e}")

if __name__ == '__main__':
    asyncio.run(main())
