from sqlite3 import IntegrityError
from flask import Flask, request, url_for, redirect ,jsonify
from flask import render_template as rent
from flask import current_app as app
from application.models import Users, UOM, Product, Category
from flask_login import LoginManager,login_user, logout_user
from .database import db

db.create_all()
mng = "ManageEverything"
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def loader_user(user_id):
    return Users.query.get(user_id)

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = Users.query.filter_by(email=request.form.get("email")).first()
        if user.password == request.form.get("password"):
            login_user(user)
            return redirect(url_for("dashboard"))
    return rent("login.html") 

@app.route("/dashboard")
def dashboard():
    categories = Category.query.all()
    return rent("dashboard.html", categories=categories)

@app.route("/Mhome")
def manage():
    products = Product.query.all()
    categories = Category.query.all()
    units = UOM.query.all()
    category_options = [
        {"id": category.id, "name": category.name} for category in categories
    ]
    unit_options = [{"id": unit.id, "unit": unit.unit} for unit in units]
    return rent(
        "Mhome.html",
        products=products,
        categories=category_options,
        units=unit_options,
    )

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        user = Users(
            name=request.form.get("name_reg"),
            email=request.form.get("email_reg"),
            password=request.form.get("password_reg"),
        )
        db.session.add(user)
        db.session.commit()
        return redirect(url_for("login"))
    return rent("register.html")


@app.route("/manager", methods=["GET", "POST"])
def manager():
    if request.method == "POST":
        manager = Users.query.filter_by(email=request.form.get("email")).first()
        pass_mng = request.form.get("password")
        if pass_mng == mng:
            if manager.password == pass_mng:
                login_user(manager)
                return redirect(url_for("manage"))
    return rent("manager.html")



@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("login"))

@app.route("/add_product", methods=["POST"])
def add_product():
    name = request.form.get("name")
    category_id = request.form.get("category")
    unit_id = request.form.get("unit")
    quantity = int(request.form.get("quantity"))
    price_per_unit = float(request.form.get("price_per_unit"))
    if (
        not name
        or not category_id
        or not unit_id
        or quantity <= 0
        or price_per_unit <= 0
    ):
        return (
            jsonify(
                {
                    "error": "Invalid form data. All fields must be filled with valid values."
                }
            ),
            400,
        )
    new_product = Product(
        name=name,
        category_id=category_id,
        quantity=quantity,
        price_per_unit=price_per_unit,
        unit_id=unit_id,
    )
    db.session.add(new_product)
    db.session.commit()

    response = {
        "id": new_product.id,
        "name": new_product.name,
        "category_id": new_product.category_id,
        "category_name": new_product.category.name,
        "quantity": new_product.quantity,
        "price_per_unit": new_product.price_per_unit,
        "unit_id": new_product.unit_id,
        "unit": new_product.unit.unit,
    }

    return jsonify(response)


@app.route("/update_product/<int:product_id>", methods=["POST", "PUT"])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)

    name = request.form.get("name")
    category_id = request.form.get("category")
    unit_id = request.form.get("unit")
    quantity = int(request.form.get("quantity"))
    price_per_unit = float(request.form.get("price_per_unit"))

    # Validate the form data
    if (
        not name
        or not category_id
        or not unit_id
        or quantity <= 0
        or price_per_unit <= 0
    ):
        return (
            jsonify(
                {
                    "error": "Invalid form data. All fields must be filled with valid values."
                }
            ),
            400,
        )

    # Update the product in the database
    product.name = name
    product.category_id = category_id
    product.unit_id = unit_id
    product.quantity = quantity
    product.price_per_unit = price_per_unit
    db.session.commit()

    response = {
        "id": product.id,
        "name": product.name,
        "category_id": product.category_id,
        "category_name": product.category.name,
        "quantity": product.quantity,
        "price_per_unit": product.price_per_unit,
        "unit_id": product.unit_id,
        "unit": product.unit.unit,
    }

    return jsonify(response)


@app.route("/delete_product", methods=["POST"])
def delete_product():
    product_id = request.form["product_id"]
    product = Product.query.get(product_id)
    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "Product deleted successfully!"})

@app.route("/category/<int:category_id>")
def category_products(category_id):
    category = Category.query.get(category_id)
    products = Product.query.filter_by(category_id=category_id).all()
    return rent(
        "category_products.html",
        category=category,
        products=products,
        category_id=category_id,
    )


# Shopping cart
cart = {}


# Route to handle adding products to the cart
@app.route("/add_to_cart", methods=["POST"])
def add_to_cart():
    data = request.form
    product_id = int(data.get("product_id"))
    quantity = int(data.get("quantity"))

    product = Product.query.get(product_id)

    if product:
        cart[product_id] = {
            "name": product.name,
            "price_per_unit": product.price_per_unit,
            "unit": product.unit.unit,
            "quantity": quantity,
        }
        return jsonify({"message": "Product added to cart successfully!"})

    return jsonify({"error": "Product not found!"}), 404


state = 1


# Route to handle the shopping cart page
@app.route("/cart/<int:state>", methods=["GET", "POST"])
def view_cart(state):
    global cart
    if request.method == "POST" or state == 0:
        # Update the products_in_cart to an empty array
        category_id = 1
        grand_total = 0
        products_in_cart = []
        cart = {}
        return rent(
            "cart.html",
            products_in_cart=products_in_cart,
            grand_total=grand_total,
            category_id=category_id,
        )
    elif state == 1 or cart == {}:
        category_id = request.args.get("category_id")
        if not category_id:
            category_id = 1
        products_in_cart = [
            (
                cart[product_id]["name"],
                cart[product_id]["price_per_unit"],
                cart[product_id]["unit"],
                cart[product_id]["quantity"],
            )
            for product_id in cart.keys()
        ]
        grand_total = sum(
            cart[product_id]["price_per_unit"] * cart[product_id]["quantity"]
            for product_id in cart.keys()
        )
        if cart == {}:
            products_in_cart = []
            grand_total = 0
        return rent(
            "cart.html",
            products_in_cart=products_in_cart,
            grand_total=grand_total,
            category_id=category_id,
        )


# Route to handle buying all products in the cart
@app.route("/buy_all", methods=["POST"])
def buy_all():
    if not cart:
        return jsonify({"error": "Cart is empty!"}), 400

    cart = {}
    cart.clear()
    return jsonify({"message": "Purchase successful!"})


@app.route("/reduce_quantity", methods=["POST", "PUT"])
def reduce_quantity():
    data = request.form
    product_id = int(data.get("product_id"))

    # Assuming you have a cart variable to store product quantities
    if product_id in cart and cart[product_id]["quantity"] > 0:
        cart[product_id]["quantity"] -= 1
        return jsonify({"message": "Product quantity reduced successfully!"})

    return (
        jsonify({"error": "Product quantity is already 0 or product not found!"}),
        404,
    )


# Route to handle reducing the quantities in the cart and updating the database
@app.route("/reduce_cart_quantities", methods=["POST"])
def reduce_cart_quantities():
    data = request.json
    cart = {}
    cart.clear()
    for item in data:
        product_id = int(item.get("product_id"))
        quantity = int(item.get("quantity"))

        # Find the product in the database
        product = Product.query.get(product_id)

        if product and product.quantity >= quantity:
            # Update the product quantity in the database
            product.quantity -= quantity

            try:
                db.session.commit()
            except IntegrityError as e:
                db.session.rollback()
                return jsonify({"error": "Database error: " + str(e)}), 500

        else:
            return (
                jsonify(
                    {
                        "error": "Insufficient quantity for product with ID "
                        + str(product_id)
                    }
                ),
                400,
            )

    return jsonify(
        {"message": "Product quantities updated in the database successfully!"}
    )


# Route to handle fetching product details by product_id
@app.route("/product/<int:product_id>", methods=["GET"])
def get_product_by_id(product_id):
    product = Product.query.get(product_id)
    if product:
        return jsonify(
            {
                "name": product.name,
                "price_per_unit": product.price_per_unit,
                "unit": product.unit.unit,
            }
        )
    return jsonify({"error": "Product not found!"}), 404

@app.route('/category_management')
def category_management():
    categories = Category.query.all()
    return rent('category-management.html', categories=categories)

# Route to handle adding a new category
@app.route('/add_category', methods=['POST'])
def add_category():
    data = request.form
    name = data.get('name')

    category = Category(name=name)
    db.session.add(category)
    db.session.commit()

    return jsonify({'message': 'Category added successfully!'})

# Route to handle editing a category
@app.route('/edit_category/<int:category_id>', methods=['PUT'])
def edit_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found!'}), 404

    data = request.form
    name = data.get('name')

    category.name = name
    db.session.commit()

    return jsonify({'message': 'Category edited successfully!'})

# Route to handle deleting a category
@app.route('/delete_category/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found!'}), 404

    db.session.delete(category)
    db.session.commit()

    return jsonify({'message': 'Category deleted successfully!'})
