from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

class Book(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(120), nullable=False)
        author = db.Column(db.String(120), nullable=False)
        course = db.Column(db.String(50), nullable=False)
        price = db.Column(db.Float, nullable=False)
        condition = db.Column(db.String(50), nullable=False)
        description = db.Column(db.Text)
        sold = db.Column(db.Boolean, default=False)
        seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
