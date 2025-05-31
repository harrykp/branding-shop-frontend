
document.getElementById("resetRequestForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("reset-email").value.trim();
  try {
    const res = await fetch("https://branding-shop-backend.onrender.com/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Reset request failed");
      return;
    }

    document.getElementById("reset-msg").textContent = "Check your email for the reset code.";
  } catch (err) {
    console.error("Reset request error", err);
    alert("An error occurred while requesting password reset.");
  }
});
