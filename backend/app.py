from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecommerce.db'
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this in production

db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity={'username': user.username})
        return jsonify({'token': access_token, 'user': {'username': user.username}})
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    query = request.get_json().get('query')
    results = Product.query.filter(Product.name.contains(query)).all()
    response = [{'name': product.name, 'description': product.description, 'price': product.price} for product in results]
    return jsonify({'reply': '\n'.join([f"{item['name']}: {item['description']} - ${item['price']}" for item in response])})

if __name__ == '__main__':
    db.create_all()
    # Add some mock data
    if not User.query.filter_by(username='user').first():
        hashed_password = generate_password_hash('password', method='sha256')
        new_user = User(username='user', password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

    if not Product.query.first():
        products = [
            Product(name=f'Product {i}', description=f'Description for Product {i}', price=i*10) for i in range(1, 101)
        ]
        db.session.bulk_save_objects(products)
        db.session.commit()

    app.run(debug=True)
