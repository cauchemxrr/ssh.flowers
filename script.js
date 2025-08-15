// Telegram Web App инициализация
let tg = window.Telegram.WebApp;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram Web App
    tg.ready();
    tg.expand();
    
    // Показ админ панели только для вас (ваш Telegram ID)
    if (tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id === 5315749575) {
        document.getElementById('admin-panel').style.display = 'block';
    }
    
    // Загрузка данных из общей базы
    loadSharedData();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Отображение информации о пользователе
    displayUserInfo();
});

// Загрузка данных из общей базы
function loadSharedData() {
    // Загружаем данные из общей базы
    window.SharedData.loadSharedBouquets();
    window.SharedData.loadSharedOrders();
    console.log('Данные загружены из общей базы');
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчик для категорий
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
    setupModalHandlers();
    
    // Обработчик для загрузки файлов
    setupFileUpload();
}

// Настройка загрузки файлов
function setupFileUpload() {
    const fileInput = document.getElementById('bouquet-image');
    const fileLabel = document.querySelector('.file-upload-label');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Создаем URL для предварительного просмотра
            const imageUrl = URL.createObjectURL(file);
            fileLabel.innerHTML = `📷 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            fileLabel.style.borderColor = 'var(--accent-color)';
            
            // Сохраняем файл в localStorage как base64 (для демо)
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64 = e.target.result;
                fileInput.dataset.base64 = base64;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Drag and drop функциональность
    fileLabel.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    fileLabel.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    
    fileLabel.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            fileInput.files = e.dataTransfer.files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    });
}

// Отображение информации о пользователе
function displayUserInfo() {
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        const userName = user.first_name || user.username || 'Пользователь';
        const userAvatar = user.photo_url || '👤';
        
        document.getElementById('user-name').textContent = userName;
        
        if (user.photo_url) {
            document.getElementById('user-avatar').innerHTML = `<img src="${user.photo_url}" alt="Аватар" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
    }
}

// Показать букеты в категории
function showCategoryBouquets(category) {
    const modal = document.getElementById('category-modal');
    const categoryTitle = document.getElementById('category-title');
    const bouquetsContainer = document.getElementById('bouquets-in-category');
    
    const categoryNames = {
        love: '🌹 Любимой',
        impress: '✨ Козырнуть',
        sorry: '🥺 Облажался',
        march8: '🌷 8 марта',
        birthday: '🎂 День рождения',
        any: '🎁 На любой случай'
    };
    
    categoryTitle.textContent = categoryNames[category] || '💐 Категория';
    
    // Получаем данные из общей базы
    const bouquetsDatabase = window.SharedData.getSharedBouquets();
    const bouquets = bouquetsDatabase[category] || [];
    
    if (bouquets.length === 0) {
        bouquetsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌺</div>
                <h3>Пока тут пусто</h3>
                <p>Но скоро появятся красивые букеты!<br>Следите за обновлениями.</p>
            </div>
        `;
    } else {
        bouquetsContainer.innerHTML = `
            <div class="bouquets-in-category">
                ${bouquets.map(bouquet => `
                    <div class="bouquet-item">
                        <div class="bouquet-image" onclick="showProductModal('${bouquet.id}', '${category}')">
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

// Показать карточку товара на весь экран
function showProductModal(bouquetId, category) {
    const bouquetsDatabase = window.SharedData.getSharedBouquets();
    const bouquet = bouquetsDatabase[category].find(b => b.id === parseInt(bouquetId));
    if (!bouquet) return;
    
    const categoryNames = {
        love: '🌹 Любимой',
        impress: '✨ Козырнуть',
        sorry: '🥺 Облажался',
        march8: '🌷 8 марта',
        birthday: '🎂 День рождения',
        any: '🎁 На любой случай'
    };
    
    // Создаем модальное окно для товара
    const productModal = document.createElement('div');
    productModal.className = 'modal';
    productModal.id = 'product-modal';
    productModal.innerHTML = `
        <div class="modal-content product-modal-content">
            <span class="close" onclick="closeProductModal()">&times;</span>
            <div class="product-full-view">
                <div class="product-image-full">
                    ${bouquet.image ? `<img src="${bouquet.image}" alt="${bouquet.name}">` : '<div class="no-image">🌺</div>'}
                </div>
                <div class="product-info-full">
                    <h2>${bouquet.name}</h2>
                    <p class="product-description">${bouquet.description}</p>
                    <div class="product-category">${categoryNames[category]}</div>
                    <div class="product-price">${bouquet.price.toLocaleString()} ₽</div>
                    <button class="btn-primary btn-order-full" onclick="orderBouquet('${bouquet.name}', ${bouquet.price}, '${categoryNames[category]}')">
                        💐 Заказать букет
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(productModal);
    productModal.style.display = 'block';
}

// Закрыть карточку товара
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.remove();
    }
}

// Заказать готовый букет
function orderBouquet(name, price, category) {
    const user = tg.initDataUnsafe?.user || {};
    
    const orderData = {
        type: 'bouquet_order',
        user: {
            id: user.id || 'Не указан',
            username: user.username || 'Не указан',
            first_name: user.first_name || 'Не указан'
        },
        name: name,
        price: price,
        category: category,
        timestamp: new Date().toISOString()
    };
    
    // Сохраняем заказ в общую базу
    window.SharedData.addSharedOrder(orderData);
    
    // Отправляем данные в бота
    tg.sendData(JSON.stringify(orderData));
    
    // Показываем подтверждение
    tg.showAlert('✅ Заказ отправлен! Мы свяжемся с вами в ближайшее время.');
    
    // Закрываем модальные окна
    document.getElementById('category-modal').style.display = 'none';
    closeProductModal();
}

// Отправить запрос на создание букета
function sendCustomBouquetRequest() {
    const form = document.getElementById('bouquet-form');
    const formData = new FormData(form);
    
    const user = tg.initDataUnsafe?.user || {};
    
    const requestData = {
        type: 'custom_bouquet_request',
        user: {
            id: user.id || 'Не указан',
            username: user.username || 'Не указан',
            first_name: user.first_name || 'Не указан'
        },
        count: formData.get('flower-count'),
        flowers: formData.get('flower-types'),
        package: formData.get('package'),
        card: formData.get('card') || 'Нет',
        wishes: formData.get('wishes') || 'Не указано',
        timestamp: new Date().toISOString()
    };
    
    // Сохраняем заказ в общую базу
    window.SharedData.addSharedOrder(requestData);
    
    // Отправляем данные в бота
    tg.sendData(JSON.stringify(requestData));
    
    // Показываем подтверждение
    tg.showAlert('✅ Ваш запрос отправлен! Мы свяжемся с вами для уточнения деталей и цены.');
    
    // Очищаем форму
    form.reset();
}

// Отправить сообщение для связи
function sendContactMessage() {
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);
    
    const user = tg.initDataUnsafe?.user || {};
    
    const contactData = {
        type: 'contact',
        user: {
            id: user.id || 'Не указан',
            username: user.username || 'Не указан',
            first_name: user.first_name || 'Не указан'
        },
        message: formData.get('contact-message'),
        timestamp: new Date().toISOString()
    };
    
    // Отправляем данные в бота
    tg.sendData(JSON.stringify(contactData));
    
    // Показываем подтверждение
    tg.showAlert('✅ Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
    
    // Очищаем форму
    form.reset();
}

// Админ функции
function manageBouquets() {
    const modal = document.getElementById('manage-bouquets-modal');
    modal.style.display = 'block';
    showExistingBouquets();
}

function showExistingBouquets() {
    const container = document.getElementById('existing-bouquets');
    let allBouquets = [];
    
    // Получаем данные из общей базы
    const bouquetsDatabase = window.SharedData.getSharedBouquets();
    
    // Собираем все букеты из всех категорий
    Object.keys(bouquetsDatabase).forEach(category => {
        bouquetsDatabase[category].forEach(bouquet => {
            allBouquets.push({...bouquet, category: category});
        });
    });
    
    if (allBouquets.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Пока нет добавленных букетов</p>';
        return;
    }
    
    const categoryNames = {
        love: '🌹 Любимой',
        impress: '✨ Козырнуть',
        sorry: '🥺 Облажался',
        march8: '🌷 8 марта',
        birthday: '🎂 День рождения',
        any: '🎁 На любой случай'
    };
    
    container.innerHTML = allBouquets.map(bouquet => `
        <div class="bouquet-item" style="margin-bottom: 20px; padding: 20px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0;">${bouquet.name}</h4>
                <button class="admin-btn" onclick="deleteBouquet('${bouquet.id}', '${bouquet.category}')" style="padding: 8px 16px; font-size: 14px; background: #dc3545;">🗑️ Удалить</button>
            </div>
            <p style="margin-bottom: 10px; color: var(--text-secondary);">${bouquet.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--accent-color); font-weight: 700;">${bouquet.price.toLocaleString()} ₽</span>
                <span style="color: var(--text-muted); font-size: 14px;">${categoryNames[bouquet.category]}</span>
            </div>
        </div>
    `).join('');
}

function addNewBouquet() {
    const category = document.getElementById('bouquet-category').value;
    const name = document.getElementById('bouquet-name').value;
    const description = document.getElementById('bouquet-description').value;
    const price = parseInt(document.getElementById('bouquet-price').value);
    const imageInput = document.getElementById('bouquet-image');
    
    if (!category || !name || !description || !price) {
        tg.showAlert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
    const newBouquet = {
        id: Date.now(),
        name: name,
        description: description,
        price: price,
        image: imageInput.dataset.base64 || null
    };
    
    // Добавляем букет в общую базу
    window.SharedData.addSharedBouquet(category, newBouquet);
    
    document.getElementById('add-bouquet-form').reset();
    document.querySelector('.file-upload-label').innerHTML = '📷 Нажмите для выбора фото или сделайте снимок';
    document.querySelector('.file-upload-label').style.borderColor = 'var(--border-color)';
    showExistingBouquets();
    tg.showAlert('✅ Букет успешно добавлен!');
}

function deleteBouquet(id, category) {
    if (confirm('Вы уверены, что хотите удалить этот букет?')) {
        // Удаляем букет из общей базы
        window.SharedData.deleteSharedBouquet(category, id);
        showExistingBouquets();
        tg.showAlert('✅ Букет удален!');
    }
}

function viewOrders() {
    const modal = document.getElementById('manage-categories-modal');
    modal.style.display = 'block';
    
    const container = document.getElementById('categories-list');
    
    // Получаем заказы из общей базы
    const ordersDatabase = window.SharedData.getSharedOrders();
    
    if (ordersDatabase.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Пока нет заказов</p>';
        return;
    }
    
    container.innerHTML = `
        <h2 style="margin-bottom: 20px; text-align: center;">📦 Все заказы</h2>
        ${ordersDatabase.map((order, index) => {
            let orderType = '';
            let orderDetails = '';
            
            if (order.type === 'bouquet_order') {
                orderType = '💐 Заказ готового букета';
                orderDetails = `
                    <strong>Букет:</strong> ${order.name}<br>
                    <strong>Категория:</strong> ${order.category}<br>
                    <strong>Цена:</strong> ${order.price} ₽
                `;
            } else if (order.type === 'custom_bouquet_request') {
                orderType = '🎨 Запрос на создание букета';
                orderDetails = `
                    <strong>Количество цветов:</strong> ${order.count}<br>
                    <strong>Виды цветов:</strong> ${order.flowers}<br>
                    <strong>Упаковка:</strong> ${order.package}<br>
                    <strong>Открытка:</strong> ${order.card}<br>
                    <strong>Пожелания:</strong> ${order.wishes}
                `;
            } else if (order.type === 'contact') {
                orderType = '💌 Сообщение для связи';
                orderDetails = `<strong>Сообщение:</strong> ${order.message}`;
            }
            
            return `
                <div style="padding: 20px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); margin-bottom: 15px; background: var(--secondary-bg);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: var(--accent-color);">${orderType}</h3>
                        <button class="admin-btn" onclick="deleteOrder(${index})" style="padding: 8px 16px; font-size: 14px; background: #dc3545;">🗑️</button>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>От:</strong> @${order.user.username || 'Не указан'} (ID: ${order.user.id})<br>
                        <strong>Дата:</strong> ${new Date(order.timestamp).toLocaleString('ru-RU')}
                    </div>
                    <div style="color: var(--text-secondary);">
                        ${orderDetails}
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

function deleteOrder(index) {
    if (confirm('Удалить этот заказ?')) {
        // Удаляем заказ из общей базы
        window.SharedData.deleteSharedOrder(index);
        viewOrders();
        tg.showAlert('✅ Заказ удален!');
    }
}

function manageCategories() {
    const modal = document.getElementById('manage-categories-modal');
    modal.style.display = 'block';
    
    const container = document.getElementById('categories-list');
    const categoryNames = {
        love: '🌹 Любимой',
        impress: '✨ Козырнуть',
        sorry: '🥺 Облажался',
        march8: '🌷 8 марта',
        birthday: '🎂 День рождения',
        any: '🎁 На любой случай'
    };
    
    // Получаем данные из общей базы
    const bouquetsDatabase = window.SharedData.getSharedBouquets();
    
    container.innerHTML = Object.keys(categoryNames).map(category => {
        const count = bouquetsDatabase[category] ? bouquetsDatabase[category].length : 0;
        return `
            <div style="padding: 20px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); margin-bottom: 15px;">
                <h3 style="margin-bottom: 10px;">${categoryNames[category]}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 15px;">Букетов в категории: ${count}</p>
                <button class="admin-btn" onclick="showCategoryBouquets('${category}')" style="width: 100%;">👀 Просмотреть</button>
            </div>
        `;
    }).join('');
}

// Настройка модальных окон
function setupModalHandlers() {
    // Закрытие модальных окон по клику на крестик
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Закрытие модальных окон по клику вне их
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
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

