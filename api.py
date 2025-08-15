import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Получаем URL базы данных из переменных окружения
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    # Fallback для локальной разработки, если переменная окружения не установлена
    # В продакшене на Render.com DATABASE_URL будет установлена
    DATABASE_URL = "sqlite:///local_database.db"
    print("WARNING: DATABASE_URL not set in environment. Using local_database.db (SQLite) for local development.")

# Создаем движок SQLAlchemy
engine = create_engine(DATABASE_URL)

# Определяем базовый класс для декларативных моделей
Base = declarative_base()

# Определяем модель Bouquet
class Bouquet(Base):
    __tablename__ = 'bouquets'
    id = Column(Integer, primary_key=True)
    category = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Integer)
    image = Column(Text)

    def to_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "image": self.image
        }

# Определяем модель Order
class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True)
    type = Column(String, nullable=False)
    user_id = Column(String)
    username = Column(String)
    first_name = Column(String)
    data = Column(Text)  # JSON строка с деталями заказа/запроса
    timestamp = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "user": {
                "id": self.user_id,
                "username": self.username,
                "first_name": self.first_name
            },
            "data": json.loads(self.data) if self.data else {},
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

# Создаем таблицы в базе данных
def init_db():
    Base.metadata.create_all(engine)
    print("Database tables created or already exist.")

# Создаем сессию для взаимодействия с базой данных
Session = sessionmaker(bind=engine)

@app.route('/')
def home():
    return "API для ssh.flowers работает! (Версия 1.1 - PostgreSQL)"

@app.route('/bouquets', methods=['GET'])
def get_bouquets():
    session = Session()
    try:
        bouquets_data = session.query(Bouquet).all()
        
        bouquets_dict = {}
        for bouquet in bouquets_data:
            if bouquet.category not in bouquets_dict:
                bouquets_dict[bouquet.category] = []
            bouquets_dict[bouquet.category].append(bouquet.to_dict())
        return jsonify(bouquets_dict)
    except Exception as e:
        print(f"Error fetching bouquets: {e}")
        return jsonify({"error": "Failed to fetch bouquets", "details": str(e)}), 500
    finally:
        session.close()

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

    session = Session()
    try:
        new_bouquet = Bouquet(
            category=category,
            name=name,
            description=description,
            price=price,
            image=image
        )
        session.add(new_bouquet)
        session.commit()
        return jsonify({"message": "Bouquet added", "id": new_bouquet.id}), 201
    except Exception as e:
        session.rollback()
        print(f"Error adding bouquet: {e}")
        return jsonify({"error": "Failed to add bouquet", "details": str(e)}), 500
    finally:
        session.close()

@app.route('/bouquets/<int:bouquet_id>', methods=['DELETE'])
def delete_bouquet(bouquet_id):
    session = Session()
    try:
        bouquet = session.query(Bouquet).get(bouquet_id)
        if not bouquet:
            return jsonify({"error": "Bouquet not found"}), 404
        session.delete(bouquet)
        session.commit()
        return jsonify({"message": "Bouquet deleted"}), 200
    except Exception as e:
        session.rollback()
        print(f"Error deleting bouquet: {e}")
        return jsonify({"error": "Failed to delete bouquet", "details": str(e)}), 500
    finally:
        session.close()

@app.route('/orders', methods=['GET'])
def get_orders():
    session = Session()
    try:
        orders_data = session.query(Order).order_by(Order.timestamp.desc()).all()
        orders_list = [order.to_dict() for order in orders_data]
        return jsonify(orders_list)
    except Exception as e:
        print(f"Error fetching orders: {e}")
        return jsonify({"error": "Failed to fetch orders", "details": str(e)}), 500
    finally:
        session.close()

@app.route('/orders', methods=['POST'])
def add_order():
    data = request.json
    order_type = data.get('type')
    user_info = data.get('user', {})
    user_id = user_info.get('id')
    username = user_info.get('username')
    first_name = user_info.get('first_name')
    
    # Сохраняем все данные заказа как JSON строку в поле 'data'
    order_data_json = json.dumps(data)

    if not all([order_type, user_id]): # timestamp генерируется автоматически
        return jsonify({"error": "Missing order data"}), 400

    session = Session()
    try:
        new_order = Order(
            type=order_type,
            user_id=user_id,
            username=username,
            first_name=first_name,
            data=order_data_json,
            timestamp=datetime.utcnow() # Используем utcnow для PostgreSQL
        )
        session.add(new_order)
        session.commit()
        return jsonify({"message": "Order added", "id": new_order.id}), 201
    except Exception as e:
        session.rollback()
        print(f"Error adding order: {e}")
        return jsonify({"error": "Failed to add order", "details": str(e)}), 500
    finally:
        session.close()

@app.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    session = Session()
    try:
        order = session.query(Order).get(order_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404
        session.delete(order)
        session.commit()
        return jsonify({"message": "Order deleted"}), 200
    except Exception as e:
        session.rollback()
        print(f"Error deleting order: {e}")
        return jsonify({"error": "Failed to delete order", "details": str(e)}), 500
    finally:
        session.close()

@app.route('/debug/bouquets', methods=['GET'])
def debug_bouquets():
    session = Session()
    try:
        bouquets_raw_data = [b.to_dict() for b in session.query(Bouquet).all()]
        return jsonify(bouquets_raw_data)
    except Exception as e:
        print(f"Error in debug endpoint: {e}")
        return jsonify({"error": "Failed to fetch debug data", "details": str(e)}), 500
    finally:
        session.close()

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
