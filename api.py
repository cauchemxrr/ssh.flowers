from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всех доменов, чтобы Mini App мог обращаться к API

DATABASE = 'database.db'

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        # Создаем таблицу для букетов
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bouquets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                price INTEGER,
                image TEXT
            )
        ''')
        # Создаем таблицу для заказов
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                user_id TEXT,
                username TEXT,
                first_name TEXT,
                data TEXT, -- JSON строка с деталями заказа/запроса
                timestamp TEXT
            )
        ''')
        conn.commit()

@app.route('/')
def home():
    return "API для ssh.flowers работает!"

@app.route('/bouquets', methods=['GET'])
def get_bouquets():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT category, name, description, price, image, id FROM bouquets')
        bouquets_data = cursor.fetchall()

    bouquets_dict = {
        "love": [], "impress": [], "sorry": [], "march8": [],
        "birthday": [], "any": []
    }
    for category, name, description, price, image, id in bouquets_data:
        bouquets_dict[category].append({
            "id": id,
            "name": name,
            "description": description,
            "price": price,
            "image": image
        })
    return jsonify(bouquets_dict)

@app.route('/bouquets', methods=['POST'])
def add_bouquet():
    data = request.json
    category = data.get('category')
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    image = data.get('image')

    if not all([category, name, description, price is not None]):
        return jsonify({"error": "Missing data"}), 400

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO bouquets (category, name, description, price, image) VALUES (?, ?, ?, ?, ?)',
            (category, name, description, price, image)
        )
        conn.commit()
    return jsonify({"message": "Bouquet added", "id": cursor.lastrowid}), 201

@app.route('/bouquets/<int:bouquet_id>', methods=['DELETE'])
def delete_bouquet(bouquet_id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM bouquets WHERE id = ?', (bouquet_id,))
        conn.commit()
    if cursor.rowcount == 0:
        return jsonify({"error": "Bouquet not found"}), 404
    return jsonify({"message": "Bouquet deleted"}), 200

@app.route('/orders', methods=['GET'])
def get_orders():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT type, user_id, username, first_name, data, timestamp FROM orders ORDER BY timestamp DESC')
        orders_data = cursor.fetchall()
    
    orders_list = []
    for order_type, user_id, username, first_name, data_json, timestamp in orders_data:
        order = json.loads(data_json)
        order['type'] = order_type
        order['user'] = {
            'id': user_id,
            'username': username,
            'first_name': first_name
        }
        order['timestamp'] = timestamp
        orders_list.append(order)
    return jsonify(orders_list)

@app.route('/orders', methods=['POST'])
def add_order():
    data = request.json
    order_type = data.get('type')
    user_info = data.get('user', {})
    user_id = user_info.get('id')
    username = user_info.get('username')
    first_name = user_info.get('first_name')
    timestamp = data.get('timestamp')

    # Сохраняем все данные заказа как JSON строку в поле 'data'
    order_data_json = json.dumps(data) 

    if not all([order_type, user_id, timestamp]):
        return jsonify({"error": "Missing order data"}), 400

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO orders (type, user_id, username, first_name, data, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            (order_type, user_id, username, first_name, order_data_json, timestamp)
        )
        conn.commit()
    return jsonify({"message": "Order added", "id": cursor.lastrowid}), 201

@app.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM orders WHERE id = ?', (order_id,))
        conn.commit()
    if cursor.rowcount == 0:
        return jsonify({"error": "Order not found"}), 404
    return jsonify({"message": "Order deleted"}), 200

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
