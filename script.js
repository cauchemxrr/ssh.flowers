// Modern Telegram Mini App для ssh.flowers
let tg = window.Telegram.WebApp;

// Глобальные переменные
let cart = [];
let isAdmin = false;
const ADMIN_ID = 5315749575; // Ваш Telegram ID

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
        
        // Проверяем, является ли пользователь админом
        if (user.id === ADMIN_ID) {
            isAdmin = true;
            document.getElementById('admin-panel').style.display = 'block';
        }
    }
    
    // Добавляем анимации для карточек категорий
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((card, index) => {
        card.style.setProperty('--animation-order', index);
    });
    
    // Обработчики событий
    setupEventListeners();
    
    // Загружаем корзину из localStorage
    loadCart();
    
    // Обновляем отображение корзины
    updateCartDisplay();
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
        addToCart();
    });
    
    // Обработчик для формы связи
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        sendContactMessage();
    });
    
    // Обработчики для модальных окон
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Обработчик для подтверждения заказа
    document.getElementById('confirm-order').addEventListener('click', function() {
        confirmOrder();
    });
    
    // Обработчик для оформления заказа из корзины
    document.getElementById('checkout-btn').addEventListener('click', function() {
        checkoutFromCart();
    });
    
    // Обработчик для очистки корзины
    document.getElementById('clear-cart-btn').addEventListener('click', function() {
        clearCart();
    });
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
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

// Добавить букет в корзину
function addToCart() {
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
    
    // Добавляем в корзину
    const bouquet = {
        id: Date.now(),
        ...formData,
        price: calculatePrice(formData),
        timestamp: new Date().toLocaleString()
    };
    
    cart.push(bouquet);
    saveCart();
    updateCartDisplay();
    
    // Показываем корзину
    document.getElementById('cart-section').style.display = 'block';
    
    // Очищаем форму
    document.getElementById('bouquet-form').reset();
    
    // Показываем подтверждение
    tg.showAlert('✅ Букет добавлен в корзину!');
    
    // Прокручиваем к корзине
    document.getElementById('cart-section').scrollIntoView({ behavior: 'smooth' });
}

// Рассчитать цену букета
function calculatePrice(data) {
    let basePrice = 1000; // Базовая цена
    basePrice += parseInt(data.count) * 50; // 50 руб за цветок
    
    // Доплата за упаковку
    const packagePrices = {
        'paper': 0,
        'ribbon': 200,
        'box': 500,
        'basket': 800
    };
    
    basePrice += packagePrices[data.package] || 0;
    
    // Доплата за открытку
    if (data.card && data.card.trim() !== '' && data.card.toLowerCase() !== 'нет') {
        basePrice += 150;
    }
    
    return basePrice;
}

// Обновить отображение корзины
function updateCartDisplay() {
    const cartSection = document.getElementById('cart-section');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartSection.style.display = 'none';
        return;
    }
    
    cartSection.style.display = 'block';
    
    // Отображаем товары в корзине
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <strong>${item.flowers}</strong><br>
                <small>${item.count} цветов, ${item.package}</small>
            </div>
            <div>
                <strong>${item.price} ₽</strong>
                <button onclick="removeFromCart(${item.id})" style="margin-left: 10px; padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
            </div>
        </div>
    `).join('');
    
    // Отображаем общую сумму
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = `Итого: ${total} ₽`;
}

// Удалить из корзины
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartDisplay();
}

// Очистить корзину
function clearCart() {
    cart = [];
    saveCart();
    updateCartDisplay();
    tg.showAlert('🗑️ Корзина очищена!');
}

// Сохранить корзину в localStorage
function saveCart() {
    localStorage.setItem('ssh-flowers-cart', JSON.stringify(cart));
}

// Загрузить корзину из localStorage
function loadCart() {
    const savedCart = localStorage.getItem('ssh-flowers-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Оформить заказ из корзины
function checkoutFromCart() {
    if (cart.length === 0) {
        tg.showAlert('Корзина пуста!');
        return;
    }
    
    showOrderDetails();
}

// Показать детали заказа
function showOrderDetails() {
    const orderDetails = document.getElementById('order-details');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    orderDetails.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3>📦 Заказ из корзины</h3>
            <p><strong>Количество товаров:</strong> ${cart.length}</p>
            <p><strong>Общая сумма:</strong> ${total} ₽</p>
        </div>
        <div style="max-height: 200px; overflow-y: auto; margin-bottom: 20px;">
            ${cart.map(item => `
                <div style="padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px;">
                    <strong>${item.flowers}</strong><br>
                    <small>${item.count} цветов, ${item.package}</small><br>
                    <small>Цена: ${item.price} ₽</small>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('order-modal').style.display = 'block';
}

// Подтверждение заказа
function confirmOrder() {
    const orderData = {
        type: 'order',
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0),
        user: tg.initDataUnsafe?.user || {},
        timestamp: new Date().toISOString()
    };
    
    // Отправляем данные в Telegram
    tg.sendData(JSON.stringify(orderData));
    
    // Закрываем модальное окно
    document.getElementById('order-modal').style.display = 'none';
    
    // Очищаем корзину
    clearCart();
    
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

// АДМИН ФУНКЦИИ

// Редактировать категории
function editCategories() {
    const modal = document.getElementById('edit-categories-modal');
    const form = document.getElementById('categories-edit-form');
    
    form.innerHTML = `
        <div style="margin-bottom: 20px;">
            <p>Здесь вы можете редактировать категории букетов</p>
            <button class="admin-btn" onclick="addNewCategory()">➕ Добавить категорию</button>
        </div>
        <div id="categories-list">
            ${getCategoriesList()}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Получить список категорий
function getCategoriesList() {
    const categories = [
        { id: 'love', name: 'Любимой', icon: '🌹' },
        { id: 'impress', name: 'Козырнуть', icon: '🎩' },
        { id: 'sorry', name: 'Облажался', icon: '😅' },
        { id: 'march8', name: '8 марта', icon: '🌸' },
        { id: 'birthday', name: 'День рождения', icon: '🎂' },
        { id: 'any', name: 'На любой случай', icon: '💐' }
    ];
    
    return categories.map(cat => `
        <div style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <span style="font-size: 24px; margin-right: 10px;">${cat.icon}</span>
            <input type="text" value="${cat.name}" style="flex: 1; margin-right: 10px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px;">
            <button class="admin-btn" onclick="deleteCategory('${cat.id}')" style="background: #ef4444;">🗑️</button>
        </div>
    `).join('');
}

// Добавить новую категорию
function addNewCategory() {
    const categoriesList = document.getElementById('categories-list');
    const newCategory = `
        <div style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <input type="text" placeholder="🌺" style="width: 60px; margin-right: 10px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px;">
            <input type="text" placeholder="Название категории" style="flex: 1; margin-right: 10px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px;">
            <button class="admin-btn" onclick="this.parentElement.remove()" style="background: #ef4444;">🗑️</button>
        </div>
    `;
    
    categoriesList.insertAdjacentHTML('beforeend', newCategory);
}

// Удалить категорию
function deleteCategory(id) {
    if (confirm('Удалить категорию?')) {
        // Здесь логика удаления
        tg.showAlert('Категория удалена!');
    }
}

// Просмотр заказов
function viewOrders() {
    const modal = document.getElementById('orders-modal');
    const ordersList = document.getElementById('orders-list');
    
    ordersList.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <p>Здесь будут отображаться все заказы</p>
            <p>Заказы приходят в личные сообщения бота</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Изменить цены
function editPrices() {
    tg.showAlert('Функция изменения цен будет добавлена в следующем обновлении!');
}

// Добавить цветы
function addFlowers() {
    tg.showAlert('Функция добавления цветов будет добавлена в следующем обновлении!');
}

// Обработка нажатия на главную кнопку
tg.MainButton.onClick(function() {
    tg.MainButton.hide();
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
