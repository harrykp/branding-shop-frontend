const API_BASE_URL = "https://branding-shop-backend.onrender.com/api";

document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const remember = document.getElementById("remember-me").checked;

  fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        if (remember) {
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("token", data.token);
        }

        localStorage.setItem("lastActivity", Date.now());
        window.location.href = "products.html";
      } else {
        alert("Login failed. Check your credentials.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("An error occurred during login.");
    });
});
