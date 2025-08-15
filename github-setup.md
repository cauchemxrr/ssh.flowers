# 🚀 Пошаговое развертывание ssh.flowers на GitHub

## 📋 Что нужно сделать (5 минут)

### 1️⃣ Создайте репозиторий на GitHub
```
1. Откройте github.com
2. Нажмите "New repository" (зеленая кнопка)
3. Repository name: ssh-flowers
4. Description: Telegram Mini App для магазина букетов
5. Public ✅
6. Add a README file ❌
7. Нажмите "Create repository"
```

### 2️⃣ Загрузите файлы
```
1. В новом репозитории нажмите "uploading an existing file"
2. Перетащите эти файлы:
   - index.html
   - style.css
   - script.js
3. Напишите commit message: "Initial commit"
4. Нажмите "Commit changes"
```

### 3️⃣ Включите GitHub Pages
```
1. Перейдите в Settings (вкладка)
2. В левом меню найдите "Pages"
3. Source: Deploy from a branch
4. Branch: main
5. Folder: / (root)
6. Нажмите Save
```

### 4️⃣ Получите URL
```
Ваш Mini App будет доступен по адресу:
https://ваш-username.github.io/ssh-flowers/
```

## 🔧 Обновите бота

Откройте `bot.py` и замените:
```python
WEBAPP_URL = "https://ваш-username.github.io/ssh-flowers/"
```

## 📱 Настройте в BotFather

```
1. Отправьте /newapp в @BotFather
2. Выберите вашего бота
3. Название: ssh.flowers
4. Описание: Магазин букетов с доставкой
5. URL: https://ваш-username.github.io/ssh-flowers/
6. Получите Web App URL
```

## ✅ Запустите бота

```bash
python bot.py
```

## 🎯 Результат

Через 5 минут ваш Mini App будет доступен в Telegram!
Пользователи смогут нажать кнопку и открыть магазин букетов.
