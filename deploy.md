# 🚀 Быстрое развертывание ssh.flowers в Telegram

## 📱 Вариант 1: GitHub Pages (Рекомендуется)

### 1. Создайте репозиторий на GitHub
- Перейдите на [github.com](https://github.com)
- Нажмите "New repository"
- Назовите: `ssh-flowers`
- Сделайте публичным
- Создайте

### 2. Загрузите файлы
В репозитории нажмите "uploading an existing file" и загрузите:
- `index.html`
- `style.css` 
- `script.js`

### 3. Включите GitHub Pages
- Перейдите в Settings → Pages
- Source: Deploy from a branch
- Branch: main
- Нажмите Save

### 4. Получите URL
Ваш Mini App будет доступен по адресу:
`https://ваш-username.github.io/ssh-flowers/`

## 🌐 Вариант 2: Netlify (Еще быстрее)

### 1. Перейдите на [netlify.com](https://netlify.com)
### 2. Нажмите "New site from Git"
### 3. Подключите GitHub репозиторий
### 4. Получите URL вида: `https://random-name.netlify.app`

## ⚡ Вариант 3: Vercel (Самый быстрый)

### 1. Перейдите на [vercel.com](https://vercel.com)
### 2. Нажмите "New Project"
### 3. Подключите GitHub
### 4. Получите URL: `https://ssh-flowers.vercel.app`

## 🔧 Настройка бота

После получения URL:

1. Откройте `bot.py`
2. Замените `WEBAPP_URL` на ваш URL
3. Запустите бота: `python bot.py`

## 📱 Настройка в BotFather

1. Отправьте `/newapp` в @BotFather
2. Выберите вашего бота
3. Название: `ssh.flowers`
4. Описание: `Магазин букетов`
5. URL: ваш полученный URL
6. Получите Web App URL

## ✅ Готово!

Теперь ваш Mini App будет доступен в Telegram!
