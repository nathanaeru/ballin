const editProductScript = document.getElementById("edit-product-modal-script");
const PRODUCT_JSON_ENDPOINT_TEMPLATE = editProductScript
    ? editProductScript.dataset.productJsonEndpoint
    : null;
const EDIT_AJAX_ENDPOINT_TEMPLATE = editProductScript
    ? editProductScript.dataset.editAjaxEndpointTemplate
    : null;

let currentEditProductId = null;
let currentEditAjaxUrl = null;

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

async function editProductEntry() {
    const form = document.querySelector("#edit-product-form");
    const formData = new FormData(form);

    if (!currentEditAjaxUrl) {
        console.error("No edit URL set for AJAX");
        return;
    }

    const response = await fetch(currentEditAjaxUrl, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "X-CSRFToken": getCsrfToken(),
        },
        body: formData,
    });
    if (!response.ok) {
        showToast(
            "Edit Product Error",
            "Failed to edit product. Please try again.",
            "error"
        );
        return false;
    }
    document.getElementById("edit-product-form").reset();
    const modal = bootstrap.Modal.getInstance(
        document.getElementById("EditProductModal")
    );
    modal.hide();
    showToast("Edit Product Success", "Product edited successfully", "success");
    document.dispatchEvent(new Event("productAdded"));
    return false;
}

document.getElementById("edit-product-form").onsubmit = function (e) {
    e.preventDefault();
    editProductEntry();
};
