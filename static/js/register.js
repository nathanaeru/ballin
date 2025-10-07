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
        showToast("Registration Success", data.message, "success");
        setTimeout(() => {
            window.location.href = data.redirect_url;
        }, 1000);
    } else {
        let errorMsg = "";
        for (const field in data.errors) {
            data.errors[field].forEach((error) => {
                errorMsg += `${error}\n`;
            });
        }
        showToast("Registration Failed", errorMsg, "error");
    }
});
