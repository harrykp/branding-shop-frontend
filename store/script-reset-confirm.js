const API_BASE_URL = "https://branding-shop-backend.onrender.com/api";

document.getElementById("confirm-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");
  const token = urlParams.get("token");
  const newPassword = document.getElementById("new-password").value;

  if (!email || !token) {
    document.getElementById("status").innerText = "Invalid reset link.";
    return;
  }

  fetch(`${API_BASE_URL}/auth/reset-password/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token, newPassword })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("status").innerText = data.message;
      if (res.ok) {
        setTimeout(() => window.location.href = "login.html", 2000);
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("status").innerText = "Reset failed.";
    });
});
