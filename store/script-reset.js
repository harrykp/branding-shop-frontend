const API_BASE_URL = "https://branding-shop-backend.onrender.com/api";

document.getElementById("reset-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("message").innerText = data.message || "Check your email.";
    })
    .catch(err => {
      console.error(err);
      document.getElementById("message").innerText = "Error sending reset link.";
    });
});
