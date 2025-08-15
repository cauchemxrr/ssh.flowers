// Общая база данных для всех пользователей
// В реальном проекте это должна быть настоящая база данных

// Инициализация общей базы данных
let sharedBouquetsDatabase = {
    love: [],      // Любимой
    impress: [],   // Козырнуть
    sorry: [],     // Облажался
    march8: [],    // 8 марта
    birthday: [],  // День рождения
    any: []        // На любой случай
};

let sharedOrdersDatabase = [];

// Функции для работы с общей базой данных
function getSharedBouquets() {
    return sharedBouquetsDatabase;
}

function addSharedBouquet(category, bouquet) {
    if (!sharedBouquetsDatabase[category]) {
        sharedBouquetsDatabase[category] = [];
    }
    sharedBouquetsDatabase[category].push(bouquet);
    saveSharedBouquets();
    return true;
}

function deleteSharedBouquet(category, bouquetId) {
    if (sharedBouquetsDatabase[category]) {
        sharedBouquetsDatabase[category] = sharedBouquetsDatabase[category].filter(
            bouquet => bouquet.id !== parseInt(bouquetId)
        );
        saveSharedBouquets();
        return true;
    }
    return false;
}

function getSharedOrders() {
    return sharedOrdersDatabase;
}

function addSharedOrder(order) {
    sharedOrdersDatabase.push(order);
    saveSharedOrders();
    return true;
}

function deleteSharedOrder(orderIndex) {
    if (sharedOrdersDatabase[orderIndex]) {
        sharedOrdersDatabase.splice(orderIndex, 1);
        saveSharedOrders();
        return true;
    }
    return false;
}

// Сохранение в localStorage как резервная копия
function saveSharedBouquets() {
    try {
        localStorage.setItem('sshFlowersSharedBouquets', JSON.stringify(sharedBouquetsDatabase));
        console.log('Общие букеты сохранены:', sharedBouquetsDatabase);
    } catch (e) {
        console.error('Ошибка сохранения общих букетов:', e);
    }
}

function saveSharedOrders() {
    try {
        localStorage.setItem('sshFlowersSharedOrders', JSON.stringify(sharedOrdersDatabase));
        console.log('Общие заказы сохранены:', sharedOrdersDatabase);
    } catch (e) {
        console.error('Ошибка сохранения общих заказов:', e);
    }
}

// Загрузка из localStorage
function loadSharedBouquets() {
    try {
        const saved = localStorage.getItem('sshFlowersSharedBouquets');
        if (saved) {
            sharedBouquetsDatabase = JSON.parse(saved);
            console.log('Общие букеты загружены:', sharedBouquetsDatabase);
        }
    } catch (e) {
        console.error('Ошибка загрузки общих букетов:', e);
    }
}

function loadSharedOrders() {
    try {
        const saved = localStorage.getItem('sshFlowersSharedOrders');
        if (saved) {
            sharedOrdersDatabase = JSON.parse(saved);
            console.log('Общие заказы загружены:', sharedOrdersDatabase);
        }
    } catch (e) {
        console.error('Ошибка загрузки общих заказов:', e);
    }
}

// Инициализация при загрузке
loadSharedBouquets();
loadSharedOrders();

// Экспорт функций
window.SharedData = {
    getSharedBouquets,
    addSharedBouquet,
    deleteSharedBouquet,
    getSharedOrders,
    addSharedOrder,
    deleteSharedOrder,
    saveSharedBouquets,
    saveSharedOrders,
    loadSharedBouquets,
    loadSharedOrders
};
