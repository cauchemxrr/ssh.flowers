// Telegram Mini App для ssh.flowers
let tg = window.Telegram.WebApp;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем Telegram Web App
    tg.ready();
    
    // Настраиваем тему
    tg.expand();
    
    // Получаем информацию о пользователе
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('user-name').textContent = user.first_name || 'Пользователь';
        if (user.photo_url) {
            document.getElementById('user-avatar').src = user.photo_url;
        }
    }
    
    // Добавляем анимации для карточек категорий
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((card, index) => {
        card.style.setProperty('--animation-order', index);
    });
    
    // Обработчики событий
    setupEventListeners();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчик для карточек категорий
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            showCategoryInfo(category);
        });
    });
    
    // Обработчик для формы создания букета
    document.getElementById('bouquet-form').addEventListener('submit', function(e) {
        e.preventDefault();
        createBouquet();
    });
    
    // Обработчик для формы связи
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        sendContactMessage();
    });
    
    // Обработчик для модального окна
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('order-modal').style.display = 'none';
    });
    
    // Обработчик для подтверждения заказа
    document.getElementById('confirm-order').addEventListener('click', function() {
        confirmOrder();
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('order-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Показать информацию о категории
function showCategoryInfo(category) {
    const categoryNames = {
        'love': '🌹 Любимой',
        'impress': '🎩 Козырнуть',
        'sorry': '😅 Облажался по крупному',
        'march8': '🌸 8 марта',
        'birthday': '🎂 День рождения',
        'any': '💐 На любой случай'
    };
    
    const categoryDescriptions = {
        'love': 'Романтичные букеты для самых важных людей в вашей жизни',
        'impress': 'Элегантные композиции, которые точно произведут впечатление',
        'sorry': 'Искренние букеты для примирения и извинений',
        'march8': 'Праздничные букеты для прекрасных дам',
        'birthday': 'Яркие и веселые букеты для дня рождения',
        'any': 'Универсальные букеты для любого повода'
    };
    
    // Показываем уведомление
    tg.showAlert(`${categoryNames[category]}\n\n${categoryDescriptions[category]}\n\nНажмите "Создать букет" для заказа!`);
}

// Создание букета
function createBouquet() {
    const formData = {
        count: document.getElementById('flower-count').value,
        flowers: document.getElementById('flower-types').value,
        package: document.getElementById('package').value,
        card: document.getElementById('card').value,
        wishes: document.getElementById('wishes').value
    };
    
    // Проверяем обязательные поля
    if (!formData.count || !formData.flowers || !formData.package) {
        tg.showAlert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
    // Показываем детали заказа
    showOrderDetails(formData);
}

// Показать детали заказа
function showOrderDetails(data) {
    const orderDetails = document.getElementById('order-details');
    orderDetails.innerHTML = `
        <div class="order-item">
            <strong>Количество цветов:</strong> ${data.count}
        </div>
        <div class="order-item">
            <strong>Виды цветов:</strong> ${data.flowers}
        </div>
        <div class="order-item">
            <strong>Упаковка:</strong> ${data.package}
        </div>
        <div class="order-item">
            <strong>Открытка:</strong> ${data.card || 'Не указана'}
        </div>
        <div class="order-item">
            <strong>Дополнительно:</strong> ${data.wishes || 'Не указано'}
        </div>
    `;
    
    document.getElementById('order-modal').style.display = 'block';
}

// Подтверждение заказа
function confirmOrder() {
    const formData = {
        count: document.getElementById('flower-count').value,
        flowers: document.getElementById('flower-types').value,
        package: document.getElementById('package').value,
        card: document.getElementById('card').value,
        wishes: document.getElementById('wishes').value,
        user: tg.initDataUnsafe?.user || {}
    };
    
    // Отправляем данные в Telegram
    tg.sendData(JSON.stringify(formData));
    
    // Закрываем модальное окно
    document.getElementById('order-modal').style.display = 'none';
    
    // Очищаем форму
    document.getElementById('bouquet-form').reset();
    
    // Показываем подтверждение
    tg.showAlert('✅ Ваш заказ принят! Скоро с вами свяжемся.');
    
    // Показываем главное меню
    tg.MainButton.setText('🌸 Вернуться в магазин');
    tg.MainButton.show();
}

// Отправка сообщения для связи
function sendContactMessage() {
    const message = document.getElementById('contact-message').value;
    
    if (!message.trim()) {
        tg.showAlert('Пожалуйста, напишите сообщение!');
        return;
    }
    
    const contactData = {
        type: 'contact',
        message: message,
        user: tg.initDataUnsafe?.user || {}
    };
    
    // Отправляем данные в Telegram
    tg.sendData(JSON.stringify(contactData));
    
    // Очищаем форму
    document.getElementById('contact-form').reset();
    
    // Показываем подтверждение
    tg.showAlert('✅ Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
}

// Обработка нажатия на главную кнопку
tg.MainButton.onClick(function() {
    tg.MainButton.hide();
    // Можно добавить дополнительную логику
});

// Обработка нажатия на кнопку "Назад"
tg.BackButton.onClick(function() {
    // Можно добавить логику навигации
});

// Уведомления
function showNotification(message, type = 'info') {
    tg.showAlert(message);
}

// Анимации для плавного появления элементов
function animateElement(element, delay = 0) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        element.style.transition = 'all 0.6s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, delay);
}

// Применяем анимации к секциям
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        animateElement(section, index * 100);
    });
});

// Обработка ошибок
window.addEventListener('error', function(e) {
    console.error('Ошибка в приложении:', e.error);
    tg.showAlert('Произошла ошибка. Попробуйте перезагрузить приложение.');
});

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', function(e) {
    console.error('Необработанная ошибка промиса:', e.reason);
    tg.showAlert('Произошла ошибка. Попробуйте еще раз.');
});
