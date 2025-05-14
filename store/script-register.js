const API_BASE_URL = "https://branding-shop-backend.onrender.com/api";

document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone_number: phone, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        alert("Registration successful! Please log in.");
        window.location.href = "login.html";
      } else {
        alert("Registration failed. Try again.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("An error occurred during registration.");
    });
});
