function showToast(title, message, type = "normal") {
    const toastElement = document.querySelector(".toast");
    const toastTitle = document.getElementById("toast-title");
    const toastIcon = document.getElementById("toast-icon");
    const toastBody = document.getElementById("toast-body");

    toastTitle.textContent = title;
    toastBody.textContent = message;

    if (type === "error") {
        toastTitle.style.color = "red";
        toastIcon.textContent = "❌";
        toastIcon.style.color = "red";
    } else if (type === "success") {
        toastTitle.style.color = "green";
        toastIcon.textContent = "✅";
        toastIcon.style.color = "green";
    } else {
        toastTitle.style.color = "dodgerblue";
        toastIcon.textContent = "ℹ️";
        toastIcon.style.color = "dodgerblue";
    }

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    setTimeout(() => {
        toast.hide();
    }, 5000);
}
