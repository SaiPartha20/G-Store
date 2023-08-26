$(document).ready(function () {
  let currentProductId = null;
  // Add New Product button

  $(".add-btn").on("click", function () {
    // Clear the form fields before showing the modal for adding a new product

    $("#productModalLabel").text("Add New Product");
    $("#name").val("");
    $("#category").val("Choose Category");
    $("#unit").val("Choose Unit");
    $("#quantity").val("");
    $("#price_per_unit").val("");

    currentProductId = null; // Reset the current product ID to null for adding a new product
    $("#productModal").modal("show"); // Open the modal for adding a new product
  });

  $("#productModal").on("click", '[data-dismiss="modal"]', function () {
    // Clear the form fields when the modal is closed
    $("#name").val("");
    $("#category").val("Choose Category");
    $("#unit").val("Choose Unit");
    $("#quantity").val("");
    $("#price_per_unit").val("");

    currentProductId = null; // Reset the current product ID when the modal is closed
  });

  // Edit button click
  // Code for handling the Edit button click inside the modal for editing an existing product

  $(".edit-btn").on("click", function () {
    const row = $(this).closest("tr");
    const productId = row.find(".product-id").text();
    const productName = row.find(".product-name").text();
    const categoryId = row.find(".category-id").text();
    const unitId = row.find(".unit-id").text();
    const quantity = parseInt(row.find(".quantity").text());
    const pricePerUnit = parseInt(row.find(".price-per-unit").text());
    console.log(productId);
    console.log(productName);
    console.log(categoryId);
    console.log(unitId);
    console.log(quantity);
    console.log(pricePerUnit);
    // Set the form fields with the existing product details
    $("#productModalLabel").text("Edit Product");
    $("#name").val(productName);
    $("#category").val(categoryId);
    $("#unit").val(unitId);
    $("#quantity").val(quantity);
    $("#price_per_unit").val(pricePerUnit);

    currentProductId = productId; // Set the current product ID
    $("#productModal").modal("show"); // Open the modal for editing
  });

  // Delete button click
  $(".delete-btn").click(function () {
    var productId = $(this).data("id");

    if (confirm("Are you sure you want to delete this product?")) {
      $.ajax({
        url: "/delete_product",
        type: "POST",
        data: {
          product_id: productId,
        },
        success: function (response) {
          alert(response.message);
          window.location.reload();
        },
        error: function (error) {
          console.log(error);
        },
      });
    }
  });

  // Code for handling the Save button click inside the modal for adding a new product
  $("#save-product-btn").on("click", function () {
    const name = $("#name").val();
    const category = $("#category").val();
    const unit = $("#unit").val();
    const quantity = parseInt($("#quantity").val());
    const pricePerUnit = parseInt($("#price_per_unit").val());
    console.log("prodn", name);
    console.log("prodcat", category);
    console.log("produ", unit);
    console.log("prodq", quantity);
    console.log("prodppu", pricePerUnit);
    // Validate the form data before submitting
    if (!name || !category || !unit || isNaN(quantity) || isNaN(pricePerUnit)) {
      console.error(
        "Invalid form data. All fields must be filled with valid values."
      );
      return;
    }

    const formData = {
      name: name,
      category: category,
      unit: unit,
      quantity: quantity,
      price_per_unit: pricePerUnit,
    };

    if (currentProductId) {
      // If currentProductId is set (i.e., we are updating an existing product)
      // Submit the form data to the server using AJAX for updating a product (PUT request)
      $.ajax({
        type: "PUT",
        url: `/update_product/${currentProductId}`,
        data: formData,
        success: function (response) {
          // Handle the successful response from the server
          // You may update the product list or perform any other actions as needed
          console.log("Product updated successfully!");
          $("#productModal").modal("hide"); // Hide the modal after successful submission
          location.reload(); // Refresh the page to see the updated product details
        },
        error: function (error) {
          // Handle the error response from the server
          console.error("Error updating product:", error);
          // You can display an error message or handle it as per your requirement
        },
      });
    } else {
      // If currentProductId is not set (i.e., we are adding a new product)
      // Submit the form data to the server using AJAX for adding a new product (POST request)
      $.ajax({
        type: "POST",
        url: "/add_product",
        data: formData,
        success: function (response) {
          // Handle the successful response from the server
          // You may update the product list or perform any other actions as needed
          console.log("New product added successfully!");
          $("#productModal").modal("hide"); // Hide the modal after successful submission
          location.reload(); // Refresh the page to see the newly added product
        },
        error: function (error) {
          // Handle the error response from the server
          console.error("Error adding new product:", error);
          // You can display an error message or handle it as per your requirement
        },
      });
    }
  });

  // Code for handling the "Close" button click in the modal
  $("#close-btn").on("click", function () {
    // Clear the form fields when the modal is closed
    $("#name").val("");
    $("#category").val("Choose Category");
    $("#unit").val("Choose Unit");
    $("#quantity").val("");
    $("#price_per_unit").val("");

    currentProductId = null; // Reset the current product ID when the modal is closed
    $("#productModal").modal("hide"); // Hide the modal when the "Close" button is clicked
  });
  // Code to handle closing the modals when the "Cancel" button is clicked
  $("#addModal, #editModal").on("hidden.bs.modal", function () {
    // Clear the form inputs when the modal is closed
    $("#product-form")[0].reset();
    $("#update-form")[0].reset();
  });
});
