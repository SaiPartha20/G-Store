from .database import db
from flask_login import UserMixin

class Users(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), nullable=False)
    email = db.Column(db.String(250), nullable=False)
    password = db.Column(db.String(250), nullable=False)

class Category(db.Model):
    __tablename__ = "category"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True)

    def __repr__(self):
        return self.name


class UOM(db.Model):
    __tablename__ = "uom"
    id = db.Column(db.Integer, primary_key=True)
    unit = db.Column(db.String(20), unique=True)

    def __repr__(self):
        return self.unit


class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=False)
    category = db.relationship("Category", backref=db.backref("products", lazy=True))
    quantity = db.Column(db.Integer, nullable=False)
    price_per_unit = db.Column(db.Integer, nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey("uom.id"), nullable=False)
    unit = db.relationship("UOM", backref=db.backref("products", lazy=True), primaryjoin="Product.unit_id == UOM.id", foreign_keys=[unit_id])
    
    def __repr__(self):
        return f"{self.name} ({self.category}, {self.unit})"
    
db.create_all()
