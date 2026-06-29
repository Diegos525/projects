from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Book

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///books.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Book Marketplace API!"})

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
    if existing_user:
        return jsonify({"error": "Username or email already exists"}), 400

    password_hash = generate_password_hash(password)

    new_user = User(
        username=username, 
        email=email, 
        password_hash=password_hash
                    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({
        "message": "Login successful", 
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
         }
        })

@app.route("/books", methods = ["GET"])
def get_books():
    books = Book.query.all()
    book_list = []
    for book in books:
        book_list.append({
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "price": book.price,
            "course": book.course,
            "condition": book.condition,
            "description":book.description,
            "sold": book.sold,
            "seller_id": book.seller_id
        })
    
    return jsonify(book_list)
@app.route("/books", methods=["POST"])
def add_book():
    data = request.get_json()
    new_book = Book(
        title=data.get("title"),
        author=data.get("author"),
        price=float(data.get("price")),
        condition=data.get("condition"),
        description=data.get("description"),
        seller_id=data.get("seller_id"),
        course=data.get("course")
    )
    db.session.add(new_book)
    db.session.commit()

    return jsonify({"message": "Book added successfully"}), 201

@app.route("/books/<int:id>", methods=["DELETE"])
def delete_book(id):
    book = Book.query.get(id)

    if not book:
        return jsonify({"error": "Book not found"}), 404

    db.session.delete(book)
    db.session.commit()

    return jsonify({"message": "Book deleted"})

@app.route("/books/<int:id>/sold", methods=["PUT", "OPTIONS"])
def mark_sold(id):
    book = Book.query.get(id)

    if not book:
        return jsonify({"error": "Book not found"}), 404

    book.sold = True
    db.session.commit()

    return jsonify({"message": "Book marked as sold"})

if __name__ == "__main__":
    app.run(debug=True)
    
