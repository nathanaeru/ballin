const productScript = document.getElementById("product-script");
const CURRENT_USER_ID = productScript.dataset.currentUserId;
const PRODUCT_ID = productScript.dataset.productId;
const PRODUCT_ENDPOINT = productScript.dataset.productEndpoint;
const EDIT_PRODUCT_URL = productScript.dataset.productEditUrl;
const DELETE_PRODUCT_URL = productScript.dataset.productDeleteUrl;

const loadingState = document.getElementById("loading");
const errorState = document.getElementById("error");
const productDetails = document.getElementById("product-details");
const productThumbnail = document.getElementById("product-thumbnail");
const productName = document.getElementById("product-name");
const productBadges = document.getElementById("product-badges");
const productPrice = document.getElementById("product-price");
const productBrand = document.getElementById("product-brand");
const productCategory = document.getElementById("product-category");
const productStock = document.getElementById("product-stock");
const productSold = document.getElementById("product-sold");
const productSeller = document.getElementById("product-seller");
const productDescription = document.getElementById("product-description");
const productButtonsContainer = document.getElementById("buttons-container");

function showState(state) {
    loadingState.classList.toggle("d-none", state !== "loading");
    errorState.classList.toggle("d-none", state !== "error");
    productDetails.classList.toggle("d-none", state !== "details");
}

function getCategoryLabel(category) {
    const categoryMap = {
        ball: "Ball",
        jersey: "Jersey",
        shoes: "Shoes",
        accessories: "Accessories",
        apparel: "Apparel",
        merchandise: "Merchandise",
        others: "Others",
    };
    return categoryMap[category] || category;
}

function renderProductDetails(product) {
    document.title = DOMPurify.sanitize(product.name) + " - Product Details";
    productName.textContent = DOMPurify.sanitize(product.name);
    productPrice.textContent =
        "Price: " + formatPrice(DOMPurify.sanitize(product.price));
    productBrand.textContent = "Brand: " + DOMPurify.sanitize(product.brand);
    productCategory.textContent =
        "Category: " + getCategoryLabel(DOMPurify.sanitize(product.category));
    productStock.textContent = "Stock: " + DOMPurify.sanitize(product.stock);
    productSold.textContent = "Sold: " + DOMPurify.sanitize(product.sold);
    productSeller.textContent =
        "Seller: " + DOMPurify.sanitize(product.username);
    productDescription.textContent = DOMPurify.sanitize(product.description);

    const isFeatured = product.is_featured;
    const isHot = DOMPurify.sanitize(product.sold) > 100;
    const isOutOfStock = DOMPurify.sanitize(product.stock) <= 0;

    const thumbnailHtml = DOMPurify.sanitize(product.thumbnail)
        ? `<img src="${DOMPurify.sanitize(
              product.thumbnail
          )}" alt="${DOMPurify.sanitize(
              product.name
          )}" style="width: 80%;height: auto;object-fit: contain;margin-bottom: 1rem" />`
        : `<img src="${NO_IMAGE_URL}" alt="No Image Available" style="width: 80%;height: auto;object-fit: contain;margin-bottom: 1rem" />`;
    productThumbnail.innerHTML = thumbnailHtml;

    const featuredBadge = isFeatured
        ? `<span class="badge bg-success">Featured</span>`
        : "";
    const hotBadge = isHot ? `<span class="badge bg-danger">Hot</span>` : "";
    const outOfStockBadge = isOutOfStock
        ? `<span class="badge bg-dark">Out of Stock</span>`
        : "";
    productBadges.innerHTML =
        featuredBadge + " " + hotBadge + " " + outOfStockBadge;

    // Debug logging
    console.log("Current User ID:", CURRENT_USER_ID);
    console.log("Product User ID:", product.user);
    console.log(
        "User comparison:",
        Number(CURRENT_USER_ID) === Number(product.user)
    );
    console.log("EDIT_PRODUCT_URL:", EDIT_PRODUCT_URL);
    console.log("DELETE_PRODUCT_URL:", DELETE_PRODUCT_URL);

    const isOwner =
        CURRENT_USER_ID && Number(CURRENT_USER_ID) === Number(product.user);

    const editButton = isOwner
        ? `<a href="${EDIT_PRODUCT_URL}" class="btn btn-success">Edit</a>`
        : "";
    const deleteButton = isOwner
        ? `<a class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="setDeleteProductId('${product.id}')">Delete</a>`
        : "";

    console.log("Edit button:", editButton);
    console.log("Delete button:", deleteButton);
    console.log("Button container:", productButtonsContainer);

    if (editButton || deleteButton) {
        productButtonsContainer.classList.remove("d-none");
        productButtonsContainer.innerHTML = editButton + " " + deleteButton;
        console.log("Buttons added to container");
    } else {
        console.log(
            "No buttons to show - user doesn't own this product or not logged in"
        );
        if (CURRENT_USER_ID) {
            productButtonsContainer.classList.remove("d-none");
        } else {
            productButtonsContainer.classList.remove("d-none");
        }
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(price);
}

async function fetchProductDetails() {
    try {
        showState("loading");
        await new Promise((resolve) => setTimeout(resolve, 200));
        const response = await fetch(PRODUCT_ENDPOINT, {
            headers: { Accept: "application/json" },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch product details");
        }
        const product = await response.json();
        renderProductDetails(product);
        showState("details");
    } catch (error) {
        console.error("Error fetching product details:", error);
        showState("error");
    }
}

function setDeleteProductId(productId) {
    const deleteButton = document.getElementById("delete-button");
    if (deleteButton) {
        deleteButton.setAttribute("data-product-id", productId);
    }
}

async function handleDeleteProduct() {
    const deleteButton = document.getElementById("delete-button");
    const productId = deleteButton.getAttribute("data-product-id");
    if (!productId) {
        console.error("No product ID found");
        return;
    }

    try {
        const response = await fetch(DELETE_PRODUCT_URL, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCsrfToken(),
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            // Close the modal
            const modal = bootstrap.Modal.getInstance(
                document.getElementById("deleteModal")
            );
            if (modal) {
                modal.hide();
            }

            // Check if showToast function is available
            if (typeof showToast === "function") {
                // Show success toast
                showToast(
                    "Delete Product Success",
                    "Product deleted successfully",
                    "success"
                );

                // Redirect after a short delay to allow toast to show
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                console.error("showToast function not available");
                // Fallback: redirect immediately if toast is not available
                setTimeout(() => {
                    window.location.href = "/";
                }, 500);
            }
        } else {
            console.error("Failed to delete product");
            if (typeof showToast === "function") {
                showToast(
                    "Delete Product Error",
                    "Failed to delete product. Please try again.",
                    "error"
                );
            } else {
                alert("Failed to delete product. Please try again.");
            }
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        if (typeof showToast === "function") {
            showToast(
                "Delete Product Error",
                "Error deleting product. Please try again.",
                "error"
            );
        } else {
            alert("Error deleting product. Please try again.");
        }
    }
}

function getCsrfToken() {
    const tokenElement = document.querySelector("[name=csrfmiddlewaretoken]");
    if (tokenElement) {
        return tokenElement.value;
    }
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "csrftoken") {
            return value;
        }
    }
    return "";
}

function init() {
    const deleteButton = document.getElementById("delete-button");
    if (deleteButton) {
        deleteButton.addEventListener("click", handleDeleteProduct);
    }
}

document.addEventListener("DOMContentLoaded", init);

fetchProductDetails();
