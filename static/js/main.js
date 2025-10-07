const mainScript = document.getElementById("main-script");
const PRODUCTS_ENDPOINT = mainScript.dataset.productsEndpoint;
const CURRENT_USER_ID = mainScript.dataset.currentUserId;
const PRODUCT_DETAIL_URL_TEMPLATE = mainScript.dataset.productDetailUrlTemplate;
const EDIT_PRODUCT_URL_TEMPLATE = mainScript.dataset.editProductUrlTemplate;
const DELETE_PRODUCT_URL_TEMPLATE = mainScript.dataset.deleteProductUrlTemplate;

const loadingSpinner = document.getElementById("loading");
const errorMessage = document.getElementById("error");
const emptyState = document.getElementById("empty");
const productsContainer = document.getElementById("products-container");
const filterAllBtn = document.getElementById("filter-all");
const filterMineBtn = document.getElementById("filter-mine");
const deleteButton = document.getElementById("delete-button");
const editSaveButton = document.getElementById("edit-save-button");

let activeFilter = "all";
let products = [];

function updateFilterButtons() {
    if (!filterAllBtn || !filterMineBtn) return;
    if (activeFilter === "all") {
        filterAllBtn.className = "btn btn-primary";
        filterMineBtn.className = "btn btn-primary-subtle";
    } else {
        filterAllBtn.className = "btn btn-primary-subtle";
        filterMineBtn.className = "btn btn-primary";
    }
}

function displayPageSection({
    showLoading = false,
    showError = false,
    showEmpty = false,
    showProducts = false,
}) {
    loadingSpinner.classList.toggle("d-none", !showLoading);
    errorMessage.classList.toggle("d-none", !showError);
    emptyState.classList.toggle("d-none", !showEmpty);
    productsContainer.classList.toggle("d-none", !showProducts);

    if (showProducts) {
        productsContainer.className =
            "container-fluid row row-cols-1 row-cols-md-3 g-4";
    }
}

function buildCardsElement(product) {
    const cardElement = document.createElement("product-card");
    cardElement.className = "card";
    cardElement.style = `width: 20rem;
            margin: auto;
            margin-top: 40px;
            margin-bottom: 10px;`;

    const detailLink = PRODUCT_DETAIL_URL_TEMPLATE.replace(
        "00000000-0000-0000-0000-000000000000",
        product.id
    );
    const editLink = EDIT_PRODUCT_URL_TEMPLATE.replace(
        "00000000-0000-0000-0000-000000000000",
        product.id
    );

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
    const featuredBadge = isFeatured
        ? `<span class="badge bg-success">Featured</span>`
        : "";
    const hotBadge = isHot ? `<span class="badge bg-danger">Hot</span>` : "";
    const outOfStockBadge = isOutOfStock
        ? `<span class="badge bg-dark">Out of Stock</span>`
        : "";

    const detailButton = `<a href="${detailLink}" class="btn btn-primary">Details</a>`;
    const editButton =
        CURRENT_USER_ID && Number(CURRENT_USER_ID) === Number(product.user)
            ? `<button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#editProductModal" onclick="setEditedProductId('${product.id}')">Edit</button>`
            : "";
    const deleteButton =
        CURRENT_USER_ID && Number(CURRENT_USER_ID) === Number(product.user)
            ? `<a class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="setDeleteProductId('${product.id}')">Delete</a>`
            : "";

    const completeCardHtml = `
    <div class="card-header"
         style="background-color: white;
                display: flex;
                justify-content: space-between">
        <div style="aspect-ratio: 1/1;
                    width: 100%;
                    max-width: 220px;
                    margin: auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden">
            ${thumbnailHtml}
        </div>
    </div>
    <div class="card-body">
        ${featuredBadge}
        ${hotBadge}
        ${outOfStockBadge}
        <h5 class="card-title" style="padding-top: 10px;">${truncateWords(
            DOMPurify.sanitize(product.name),
            8
        )}</h5>
        <p class="card-text" style="color: #6c757d;">Seller: ${DOMPurify.sanitize(
            product.username
        )}</p>
        <p class="card-text">${truncateWords(
            DOMPurify.sanitize(product.description),
            20
        )}</p>
        <p class="card-text" style="font-weight: 600; font-size: 1.25rem;">${formatPrice(
            DOMPurify.sanitize(product.price)
        )}</p>
    </div>
    <div class="card-footer"
         style="background-color: white;
                display: flex;
                justify-content: space-between">
        ${detailButton}
        ${editButton}
        ${deleteButton}
    </div>
    `;

    cardElement.innerHTML = completeCardHtml;
    return cardElement;
}

function formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(price);
}

function truncateWords(text, maxWords, placeholder = "...") {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) {
        return text;
    }
    return words.slice(0, maxWords).join(" ") + placeholder;
}

function renderProducts(products) {
    productsContainer.innerHTML = "";
    products.forEach((product) => {
        const cardElement = buildCardsElement(product);
        productsContainer.appendChild(cardElement);
    });
}

function filterAndRenderProducts() {
    updateFilterButtons();
    const filteredProducts =
        activeFilter === "all"
            ? products
            : products.filter(
                  (product) => Number(product.user) === Number(CURRENT_USER_ID)
              );
    if (filteredProducts.length === 0) {
        displayPageSection({ showEmpty: true });
    } else {
        renderProducts(filteredProducts);
        displayPageSection({ showProducts: true });
    }
}

async function fetchProducts() {
    try {
        displayPageSection({ showLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 200));
        const response = await fetch(PRODUCTS_ENDPOINT, {
            headers: { Accept: "application/json" },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        products = data || [];
        filterAndRenderProducts();
    } catch (error) {
        console.error("Error: " + error);
        displayPageSection({ showError: true });
    }
}

function handleFilterAllClick() {
    activeFilter = "all";
    filterAndRenderProducts();
}

function handleFilterMineClick() {
    activeFilter = "mine";
    filterAndRenderProducts();
}

function init() {
    filterAllBtn.addEventListener("click", handleFilterAllClick);
    filterMineBtn.addEventListener("click", handleFilterMineClick);
    if (deleteButton) {
        deleteButton.addEventListener("click", handleDeleteProduct);
    }
    if (editSaveButton) {
        editSaveButton.addEventListener("click", function (e) {
            e.preventDefault();
            handleEditProduct();
        });
    }
    fetchProducts();
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
    const deleteUrl = DELETE_PRODUCT_URL_TEMPLATE.replace(
        "00000000-0000-0000-0000-000000000000",
        productId
    );
    try {
        const response = await fetch(deleteUrl, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCsrfToken(),
                "Content-Type": "application/json",
            },
        });
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(
                document.getElementById("deleteModal")
            );
            showToast(
                "Delete Product Success",
                "Product deleted successfully",
                "success"
            );
            if (modal) {
                modal.hide();
            }
            await fetchProducts();
        } else {
            console.error("Failed to delete product");
            showToast(
                "Delete Product Error",
                "Error deleting product. Please try again.",
                "error"
            );
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        showToast(
            "Delete Product Error",
            "Error deleting product. Please try again.",
            "error"
        );
    }
}

function setEditedProductId(productId) {
    const editButton = document.getElementById("edit-button");
    if (editButton) {
        editButton.setAttribute("data-product-id", productId);
    }
}

async function handleEditProduct() {
    const form = document.querySelector("#edit-product-form");
    const formData = new FormData(form);
    const editButton = document.getElementById("edit-save-button");
    const productId = editButton.getAttribute("data-product-id");
    if (!productId) {
        console.error("No product ID found");
        return;
    }
    const editUrl = EDIT_PRODUCT_URL_TEMPLATE.replace(
        "00000000-0000-0000-0000-000000000000",
        productId
    );
    try {
        const response = await fetch(editUrl, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCsrfToken(),
                "Content-Type": "application/json",
            },
            body: formData,
        });
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(
                document.getElementById("editProductModal")
            );
            showToast(
                "Edit Product Success",
                "Product edited successfully",
                "success"
            );
            if (modal) {
                modal.hide();
            }
            await fetchProducts();
        } else {
            console.error("Failed to edit product");
            showToast(
                "Edit Product Error",
                "Error editing product. Please try again.",
                "error"
            );
        }
    } catch (error) {
        console.error("Error editing product:", error);
        showToast(
            "Edit Product Error",
            "Error editing product. Please try again.",
            "error"
        );
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

init();

document.addEventListener("productAdded", function () {
    fetchProducts();
});
