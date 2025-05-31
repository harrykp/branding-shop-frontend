
document.getElementById("resetConfirmForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const code = document.getElementById("code").value.trim();
  const newPassword = document.getElementById("new-password").value.trim();

  try {
    const res = await fetch("https://branding-shop-backend.onrender.com/api/auth/reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Reset failed");
      return;
    }

    alert("Password successfully updated. You may now login.");
    window.location.href = "login.html";
  } catch (err) {
    console.error("Reset confirm error", err);
    alert("An error occurred while resetting your password.");
  }
});
