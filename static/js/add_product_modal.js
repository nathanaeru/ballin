const addProductScript = document.getElementById("add-product-script");
const ADD_PRODUCT_URL = addProductScript
    ? addProductScript.dataset.addUrl
    : "/";

function getCsrfToken() {
    const tokenInput = document.querySelector("[name=csrfmiddlewaretoken]");
    if (tokenInput) return tokenInput.value;
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "csrftoken") return decodeURIComponent(value);
    }
    return "";
}

async function addProductEntry() {
    const form = document.querySelector("#add-product-form");
    const formData = new FormData(form);

    await fetch(ADD_PRODUCT_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "X-CSRFToken": getCsrfToken(),
        },
        body: formData,
    });
    document.getElementById("add-product-form").reset();
    const modal = bootstrap.Modal.getInstance(
        document.getElementById("addProductModal")
    );
    modal.hide();
    showToast("Add Product Success", "Product added successfully", "success");
    document.dispatchEvent(new Event("productAdded"));
    return false;
}

document.getElementById("add-product-form").onsubmit = function (e) {
    e.preventDefault();
    addProductEntry();
};
