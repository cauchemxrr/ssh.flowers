# ⚡ САМЫЙ БЫСТРЫЙ СПОСОБ - Netlify (2 минуты!)

## 🚀 Развертывание через Netlify

### 1️⃣ Подготовьте файлы
Убедитесь что у вас есть:
- `index.html`
- `style.css` 
- `script.js`

### 2️⃣ Перейдите на Netlify
```
1. Откройте netlify.com
2. Нажмите "Sign up" (регистрация через GitHub)
3. Войдите в аккаунт
```

### 3️⃣ Загрузите сайт
```
1. Нажмите "New site from Git"
2. Выберите "Deploy manually"
3. Перетащите папку с файлами или выберите файлы
4. Нажмите "Deploy site"
```

### 4️⃣ Получите URL
```
Сразу получите URL вида:
https://random-name-123.netlify.app
```

### 5️⃣ Настройте домен (опционально)
```
1. В настройках сайта найдите "Domain management"
2. Нажмите "Change site name"
3. Введите: ssh-flowers
4. Получите: https://ssh-flowers.netlify.app
```

## 🔧 Обновите бота

В `bot.py` замените:
```python
WEBAPP_URL = "https://ssh-flowers.netlify.app"
```

## 📱 Настройте в BotFather

```
1. Отправьте /newapp
2. Выберите бота
3. Название: ssh.flowers
4. Описание: Магазин букетов
5. URL: ваш Netlify URL
6. Готово!
```

## ✅ Запустите бота

```bash
python bot.py
```

## 🎯 Результат

Через 2 минуты ваш Mini App будет работать в Telegram!
