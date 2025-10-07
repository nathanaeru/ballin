document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch(e.target.action, {
        method: "POST",
        body: formData,
        headers: {
            "X-CSRFToken": formData.get("csrfmiddlewaretoken"),
        },
    });
    const data = await response.json();
    if (data.status === "success") {
        showToast("Login Success", data.message, "success");
        setTimeout(() => {
            window.location.href = data.redirect_url;
        }, 1000);
    } else {
        showToast("Login Failed", data.message, "error");
    }
});
