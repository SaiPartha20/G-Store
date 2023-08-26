$(document).ready(function () {
  // Code for handling the Add to Cart button click
  function calculateProductTotal() {
    $(".quantity-input").each(function () {
      const productId = $(this).data("product-id");
      const quantity = parseInt($(this).val());
      const pricePerUnit = parseInt($("#price-per-unit-" + productId).text());
      const total = quantity * pricePerUnit;
      $("#total-" + productId).text(total);
    });
  }
  let cartData = JSON.parse(localStorage.getItem("cartData")) || [];
  console.log(cartData);
  $(".add-to-cart-btn").on("click", function () {
    const productId = $(this).data("product-id");
    const productQuantity = parseInt($("#quantity_" + productId).val());
    console.log(productId);
    const productData = { product_id: productId, quantity: productQuantity };
    cartData.push(productData);
    localStorage.setItem("cartData", JSON.stringify(cartData));
    console.log(cartData);
    if (productQuantity > 0) {
      // Submit the form data to the server using AJAX to reduce the quantity in the cart
      $.ajax({
        type: "POST",
        url: "/add_to_cart",
        data: productData,
        success: function (response) {
          alert("Product added to cart successfully!");
          // You may show a success message or perform any other actions as needed
        },
        error: function (error) {
          console.error("Error adding product to cart:", error);
          // You can display an error message or handle it as per your requirement
        },
      });
    } else {
      alert("Product quantity is 0 (add some quantity)");
      // You may show a message to indicate that the product is out of stock or any other actions
    }
  });
  // Code for handling the quantity input change in the cart.html
  $(".quantity-input").on("input", function () {
    calculateProductTotal();
    updateGrandTotal();
    const productIndex = $(this).data("product-id");
    const newQuantity = parseInt($(this).val());
    const productPrice = parseInt(productsInCart[productIndex][1]);
    if (newQuantity >= 0) {
      // Update the total price for the product based on the new quantity
      const newTotal = productPrice * newQuantity;
      $(this).parents("tr").find(".product-total").text(newTotal);
      // Recalculate the grand total
      let grandTotal = 0;
      $(".product-total").each(function () {
        grandTotal += parseInt($(this).text());
      });
      $("#grand-total").text(grandTotal);
    }
  });
  // Function to update the grand total
  function updateGrandTotal() {
    let grandTotal = 0;
    $(".total").each(function () {
      grandTotal += parseInt($(this).text());
    });
    $("#grand-total").text(grandTotal);
  }
  // Code for handling the Buy All button click

  $("#buy-all-btn").on("click", function () {
    // Collect the product IDs and quantities in the cart
    console.log(cartData);
    if (cartData.length === 0) {
      alert("Please add products to the cart before buying.");
      return;
    }

    // Submit the form data to the server using AJAX to reduce quantities in the cart
    $.ajax({
      type: "POST",
      url: "/reduce_cart_quantities",
      contentType: "application/json",
      data: JSON.stringify(cartData),
      success: function (response) {
        alert("Product quantities updated in the database successfully!");
        $.ajax({
          type: "POST",
          url: "/cart/1",
          success: function (response) {
            console.log(response);
            cartData = []; // Clear the cartData after successful purchase
            localStorage.setItem("cartData", JSON.stringify(cartData));
            updateCartView(cartData); // Update the cart view to show an empty cart
            window.location.href = "/cart/0"; // Redirect to the cart page after successful purchase
          },
          error: function (error) {
            console.error("Error clearing cart data:", error);
          },
        });
        cartData = []; // Clear the cartData after successful purchase
        localStorage.setItem("cartData", JSON.stringify(cartData));
        localStorage.removeItem("cartData");
        updateCartView(cartData); // Redirect to the cart page after successful purchase
      },
      error: function (error) {
        alert("Error updating product quantities: " + error.responseJSON.error);
      },
    });
    calculateProductTotal();
    updateGrandTotal();
  });
  // Function to update the cart view based on cart data
  function updateCartView(products_in_cart) {
    // Clear the existing cart content
    let grandTotal = 0;
    const cartTableBody = $("#cart-table tbody");
    cartTableBody.empty();
    console.log(products_in_cart);
    // Check if cart is empty
    if (products_in_cart.length === 0) {
      $("#grand-total").text("Grand Total: Rs " + grandTotal);
      return;
    }
  }

  $("#cart-table").on("click", ".remove-btn", function () {
    const index = $(this).data("index");
    cartData.splice(index, 1); // Remove the product from the cartData array
    localStorage.setItem("cartData", JSON.stringify(cartData));
    updateCartView(cartData); // Update the cart view to reflect the removal
  });

  // Update the cart view initially
  updateCartView(cartData);
});
