$(document).ready(function () {
  // Code for handling the Add Category button click
  $("#add-category-btn").on("click", function () {
    // Show the Add Category form
    $("#add-category-form").toggle();
  });

  // Submit the Add Category form data to the server using AJAX
  $("#add-category-form").on("submit", function (event) {
    event.preventDefault();
    const categoryName = $("#category-name").val();

    // Submit the form data to the server using AJAX to add the category
    $.ajax({
      type: "POST",
      url: "/add_category",
      data: { name: categoryName },
      success: function (response) {
        console.log("Category added successfully!");
        // Hide the form after successful submission
        $("#add-category-form").hide();
        location.reload(); // Refresh the page to see the newly added category
      },
      error: function (error) {
        console.error("Error adding category:", error);
        // You can display an error message or handle it as per your requirement
      },
    });
  });
  // Code for handling the Delete button click
  $(".delete-btn").on("click", function () {
    const categoryId = $(this).data("id");
    const categoryName = $(this).data("name");

    // Display the delete confirmation modal
    $("#deleteModalLabel").text(`Delete Category "${categoryName}"?`);
    $("#confirm-delete-btn").attr("data-id", categoryId);
    $("#deleteModal").modal("show");
  });

  // Code for handling the Confirm Delete button click
  $("#confirm-delete-btn").on("click", function () {
    const categoryId = $(this).data("id");

    // Submit the form data to the server using AJAX to delete the category
    $.ajax({
      type: "DELETE",
      url: `/delete_category/${categoryId}`,
      success: function (response) {
        console.log("Category deleted successfully!");
        location.reload(); // Refresh the page to see the updated list of categories
      },
      error: function (error) {
        console.error("Error deleting category:", error);
        // You can display an error message or handle it as per your requirement
      },
    });
  });
});
