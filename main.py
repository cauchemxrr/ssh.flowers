import logging
import sqlite3
from aiogram import Bot, Dispatcher, executor, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.dispatcher import FSMContext
from aiogram.dispatcher.filters.state import State, StatesGroup

# ===== НАСТРОЙКИ =====
API_TOKEN = "8395025224:AAFbApm2m28qAqKXwIRL2Sgj36dcLddgyn4"  # Твой токен
ADMIN_ID = 5315749575  # Твой Telegram ID

logging.basicConfig(level=logging.INFO)

# ===== БД =====
conn = sqlite3.connect("flowers.db")
cursor = conn.cursor()
cursor.execute("""CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
)""")
cursor.execute("""CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    avatar TEXT,
    orders TEXT
)""")
conn.commit()

# ===== ПЕРВОНАЧАЛЬНЫЕ КАТЕГОРИИ =====
default_categories = ["🌹 Любимой", "🎩 Козырнуть", "😅 Облажался по крупному",
                      "🌸 8 марта", "🎂 День рождения", "💐 На любой случай"]
for cat in default_categories:
    cursor.execute("INSERT OR IGNORE INTO categories (name) VALUES (?)", (cat,))
conn.commit()

# ===== FSM для создания букета =====
class BouquetForm(StatesGroup):
    count = State()
    flowers = State()
    package = State()
    card = State()
    wishes = State()

# ===== FSM для связи с админом =====
class ContactForm(StatesGroup):
    message = State()

# ===== БОТ =====
bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot, storage=MemoryStorage())

# ===== МЕНЮ =====
def main_menu():
    kb = ReplyKeyboardMarkup(resize_keyboard=True)
    kb.add(KeyboardButton("📂 Категории"))
    kb.add(KeyboardButton("💌 Связаться"), KeyboardButton("🎨 Создать букет"))
    return kb

# ===== СТАРТ =====
@dp.message_handler(commands=['st   art'])
async def start(msg: types.Message):
    try:
        # Безопасное получение аватара
        avatar_url = ""
        try:
            photos = msg.from_user.get_profile_photos()
            if photos.total_count > 0:
                avatar_url = photos.photos[0][-1].file_id
        except Exception as e:
            logging.warning(f"Не удалось получить аватар: {e}")
        
        cursor.execute("INSERT OR IGNORE INTO users (id, username, avatar, orders) VALUES (?, ?, ?, ?)",
                       (msg.from_user.id, msg.from_user.username, avatar_url, ""))
        conn.commit()
        await msg.answer("💐 Привет! Добро пожаловать в магазин букетов.\nВыбирай категорию или создай свой букет.",
                         reply_markup=main_menu())
    except Exception as e:
        logging.error(f"Ошибка в start: {e}")
        await msg.answer("Произошла ошибка. Попробуйте еще раз.")

# ===== КАТЕГОРИИ =====
@dp.message_handler(lambda msg: msg.text == "📂 Категории")
async def show_categories(msg: types.Message):
    try:
        cursor.execute("SELECT name FROM categories")
        cats = cursor.fetchall()
        kb = InlineKeyboardMarkup()
        for c in cats:
            kb.add(InlineKeyboardButton(c[0], callback_data=f"cat_{c[0]}"))
        await msg.answer("🌸 Доступные категории:", reply_markup=kb)
    except Exception as e:
        logging.error(f"Ошибка в show_categories: {e}")
        await msg.answer("Произошла ошибка при загрузке категорий.")

# ===== КОНСТРУКТОР БУКЕТА =====
@dp.message_handler(lambda msg: msg.text == "🎨 Создать букет")
async def create_bouquet(msg: types.Message):
    await msg.answer("Сколько цветов хотите в букете?")
    await BouquetForm.count.set()

@dp.message_handler(state=BouquetForm.count)
async def set_count(msg: types.Message, state: FSMContext):
    await state.update_data(count=msg.text)
    await msg.answer("Какие цветы вы хотите?")
    await BouquetForm.flowers.set()

@dp.message_handler(state=BouquetForm.flowers)
async def set_flowers(msg: types.Message, state: FSMContext):
    await state.update_data(flowers=msg.text)
    await msg.answer("Какую упаковку предпочитаете?")
    await BouquetForm.package.set()

@dp.message_handler(state=BouquetForm.package)
async def set_package(msg: types.Message, state: FSMContext):
    await state.update_data(package=msg.text)
    await msg.answer("Нужна ли открытка? Если да, напишите текст. Если нет, напишите 'нет'.")
    await BouquetForm.card.set()

@dp.message_handler(state=BouquetForm.card)
async def set_card(msg: types.Message, state: FSMContext):
    await state.update_data(card=msg.text)
    await msg.answer("Дополнительные пожелания?")
    await BouquetForm.wishes.set()

@dp.message_handler(state=BouquetForm.wishes)
async def finish_bouquet(msg: types.Message, state: FSMContext):
    try:
        data = await state.get_data()
        await state.finish()

        text = (f"📦 Новый заказ букета:\n"
                f"Количество цветов: {data['count']}\n"
                f"Цветы: {data['flowers']}\n"
                f"Упаковка: {data['package']}\n"
                f"Открытка: {data['card']}\n"
                f"Дополнительно: {data['wishes']}\n"
                f"От: @{msg.from_user.username} ({msg.from_user.id})")
        await bot.send_message(ADMIN_ID, text)
        await msg.answer("✅ Ваш заказ принят! Скоро с вами свяжемся.", reply_markup=main_menu())
    except Exception as e:
        logging.error(f"Ошибка в finish_bouquet: {e}")
        await state.finish()
        await msg.answer("Произошла ошибка при создании заказа. Попробуйте еще раз.", reply_markup=main_menu())

# ===== СВЯЗАТЬСЯ С АДМИНОМ =====
@dp.message_handler(lambda msg: msg.text == "💌 Связаться")
async def contact_admin(msg: types.Message):
    await msg.answer("✉ Отправьте сообщение админу:")
    await ContactForm.message.set()

@dp.message_handler(state=ContactForm.message)
async def forward_message(msg: types.Message, state: FSMContext):
    try:
        await bot.send_message(ADMIN_ID, f"💬 Сообщение от @{msg.from_user.username} ({msg.from_user.id}):\n{msg.text}")
        await state.finish()
        await msg.answer("✅ Сообщение отправлено.", reply_markup=main_menu())
    except Exception as e:
        logging.error(f"Ошибка в forward_message: {e}")
        await state.finish()
        await msg.answer("Произошла ошибка при отправке сообщения.", reply_markup=main_menu())

# ===== ЗАПУСК =====
if __name__ == '__main__':
    try:
        executor.start_polling(dp, skip_updates=True)
    except Exception as e:
        logging.error(f"Ошибка запуска бота: {e}")
