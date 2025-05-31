
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const remember = document.getElementById("rememberMe").checked;

  try {
    const res = await fetch("https://branding-shop-backend.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Store JWT in storage
    if (remember) {
      localStorage.setItem("token", data.token);
    } else {
      sessionStorage.setItem("token", data.token);
    }

    // Decode roles to redirect appropriately
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    const roles = payload.roles || [];

    if (roles.includes("admin")) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } catch (err) {
    console.error("Login error", err);
    alert("An error occurred during login.");
  }
});
