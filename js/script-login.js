const API_BASE = "https://branding-shop-backend.onrender.com";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    // Save token
    localStorage.setItem("token", data.token);

    // Decode token to determine role
    const payload = JSON.parse(atob(data.token.split('.')[1]));
    const roles = payload.roles || [];

    // Redirect based on role
    if (roles.includes("admin")) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }

  } catch (err) {
    alert("Login failed: " + err.message);
  }
});
