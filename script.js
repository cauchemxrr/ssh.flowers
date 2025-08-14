// Modern Telegram Mini App для ssh.flowers
let tg = window.Telegram.WebApp;

// Глобальные переменные
let isAdmin = false;
const ADMIN_ID = 5315749575; // Ваш Telegram ID

// База данных букетов (в реальном приложении это будет в базе данных)
let bouquetsDatabase = {
    love: [],      // Любимой
    impress: [],   // Козырнуть
    sorry: [],     // Облажался
    march8: [],    // 8 марта
    birthday: [],  // День рождения
    any: []        // На любой случай
};

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
    
    // Загружаем сохраненные букеты из localStorage
    loadBouquetsFromStorage();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчик для карточек категорий
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            showCategoryBouquets(category);
        });
    });
    
    // Обработчик для формы создания букета
    document.getElementById('bouquet-form').addEventListener('submit', function(e) {
        e.preventDefault();
        sendCustomBouquetRequest();
    });
    
    // Обработчик для формы связи
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        sendContactMessage();
    });
    
    // Обработчик для формы добавления букета
    document.getElementById('add-bouquet-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addNewBouquet();
    });
    
    // Обработчики для модальных окон
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Показать букеты в категории
function showCategoryBouquets(category) {
    const modal = document.getElementById('category-modal');
    const categoryTitle = document.getElementById('category-title');
    const bouquetsContainer = document.getElementById('bouquets-in-category');
    
    // Устанавливаем заголовок
    const categoryNames = {
        'love': '🌹 Любимой',
        'impress': '🎩 Козырнуть',
        'sorry': '😅 Облажался',
        'march8': '🌸 8 марта',
        'birthday': '🎂 День рождения',
        'any': '💐 На любой случай'
    };
    
    categoryTitle.textContent = categoryNames[category] || '💐 Категория';
    
    // Получаем букеты для этой категории
    const bouquets = bouquetsDatabase[category] || [];
    
    if (bouquets.length === 0) {
        // Показываем сообщение "пока пусто"
        bouquetsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌺</div>
                <h3>Пока тут пусто</h3>
                <p>Но скоро появятся красивые букеты!<br>Следите за обновлениями.</p>
            </div>
        `;
    } else {
        // Показываем букеты
        bouquetsContainer.innerHTML = `
            <div class="bouquets-in-category">
                ${bouquets.map(bouquet => `
                    <div class="bouquet-item">
                        <div class="bouquet-image">
                            ${bouquet.image ? `<img src="${bouquet.image}" alt="${bouquet.name}">` : '🌺'}
                        </div>
                        <h4>${bouquet.name}</h4>
                        <p>${bouquet.description}</p>
                        <div class="bouquet-price">${bouquet.price.toLocaleString()} ₽</div>
                        <button class="btn-primary" onclick="orderBouquet('${bouquet.name}', ${bouquet.price}, '${categoryNames[category]}')">Заказать</button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    modal.style.display = 'block';
}

// Заказать букет
function orderBouquet(name, price, category) {
    const orderData = {
        type: 'bouquet_order',
        name: name,
        price: price,
        category: category,
        user: tg.initDataUnsafe?.user || {},
        timestamp: new Date().toISOString()
    };
    
    // Отправляем данные в Telegram
    tg.sendData(JSON.stringify(orderData));
    
    // Закрываем модальное окно
    document.getElementById('category-modal').style.display = 'none';
    
    // Показываем подтверждение
    tg.showAlert('✅ Ваш заказ принят! Наш менеджер свяжется с вами в ближайшее время.');
}

// Отправить запрос на создание букета
function sendCustomBouquetRequest() {
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
    
    // Формируем данные для отправки
    const customBouquetData = {
        type: 'custom_bouquet_request',
        ...formData,
        user: tg.initDataUnsafe?.user || {},
        timestamp: new Date().toISOString()
    };
    
    // Отправляем данные в Telegram
    tg.sendData(JSON.stringify(customBouquetData));
    
    // Очищаем форму
    document.getElementById('bouquet-form').reset();
    
    // Показываем подтверждение
    tg.showAlert('✅ Ваш запрос отправлен! Мы свяжемся с вами для уточнения деталей и цены.');
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

// Управление букетами
function manageBouquets() {
    const modal = document.getElementById('manage-bouquets-modal');
    modal.style.display = 'block';
    
    // Показываем существующие букеты
    showExistingBouquets();
}

// Показать существующие букеты
function showExistingBouquets() {
    const container = document.getElementById('existing-bouquets');
    let allBouquets = [];
    
    // Собираем все букеты из всех категорий
    Object.keys(bouquetsDatabase).forEach(category => {
        bouquetsDatabase[category].forEach(bouquet => {
            allBouquets.push({ ...bouquet, category });
        });
    });
    
    if (allBouquets.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280;">Пока нет добавленных букетов</p>';
        return;
    }
    
    container.innerHTML = `
        <div style="max-height: 300px; overflow-y: auto;">
            ${allBouquets.map(bouquet => `
                <div style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <div style="flex: 1;">
                        <strong>${bouquet.name}</strong><br>
                        <small>${getCategoryName(bouquet.category)}</small>
                    </div>
                    <div style="margin-right: 10px;">
                        <strong>${bouquet.price} ₽</strong>
                    </div>
                    <button class="admin-btn" onclick="deleteBouquet('${bouquet.name}', '${bouquet.category}')" style="background: #ef4444;">🗑️</button>
                </div>
            `).join('')}
        </div>
    `;
}

// Получить название категории
function getCategoryName(category) {
    const categoryNames = {
        'love': '🌹 Любимой',
        'impress': '🎩 Козырнуть',
        'sorry': '😅 Облажался',
        'march8': '🌸 8 марта',
        'birthday': '🎂 День рождения',
        'any': '💐 На любой случай'
    };
    return categoryNames[category] || category;
}

// Добавить новый букет
function addNewBouquet() {
    const category = document.getElementById('bouquet-category').value;
    const name = document.getElementById('bouquet-name').value;
    const description = document.getElementById('bouquet-description').value;
    const price = parseInt(document.getElementById('bouquet-price').value);
    const image = document.getElementById('bouquet-image').value;
    
    if (!category || !name || !description || !price) {
        tg.showAlert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
    // Создаем новый букет
    const newBouquet = {
        id: Date.now(),
        name: name,
        description: description,
        price: price,
        image: image || null
    };
    
    // Добавляем в базу данных
    if (!bouquetsDatabase[category]) {
        bouquetsDatabase[category] = [];
    }
    bouquetsDatabase[category].push(newBouquet);
    
    // Сохраняем в localStorage
    saveBouquetsToStorage();
    
    // Очищаем форму
    document.getElementById('add-bouquet-form').reset();
    
    // Обновляем список существующих букетов
    showExistingBouquets();
    
    // Показываем подтверждение
    tg.showAlert('✅ Букет успешно добавлен!');
}

// Удалить букет
function deleteBouquet(name, category) {
    if (confirm(`Удалить букет "${name}"?`)) {
        bouquetsDatabase[category] = bouquetsDatabase[category].filter(b => b.name !== name);
        saveBouquetsToStorage();
        showExistingBouquets();
        tg.showAlert('🗑️ Букет удален!');
    }
}

// Управление категориями
function manageCategories() {
    const modal = document.getElementById('manage-categories-modal');
    const container = document.getElementById('categories-management');
    
    container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <p>Управление категориями</p>
            <p>Здесь вы можете редактировать названия и описания категорий</p>
            <p style="color: #6b7280; font-size: 0.875rem;">Функция в разработке</p>
        </div>
    `;
    
    modal.style.display = 'block';
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

// Сохранить букеты в localStorage
function saveBouquetsToStorage() {
    localStorage.setItem('ssh-flowers-bouquets', JSON.stringify(bouquetsDatabase));
}

// Загрузить букеты из localStorage
function loadBouquetsFromStorage() {
    const saved = localStorage.getItem('ssh-flowers-bouquets');
    if (saved) {
        try {
            bouquetsDatabase = JSON.parse(saved);
        } catch (e) {
            console.error('Ошибка загрузки букетов:', e);
        }
    }
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
