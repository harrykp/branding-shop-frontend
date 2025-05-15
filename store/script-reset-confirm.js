const API_BASE_URL = "https://branding-shop-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");
  const token = params.get("token");

  if (!email || !token) {
    document.getElementById("question-display").innerText = "Invalid reset link.";
    return;
  }

  // Fetch question
  fetch(`${API_BASE_URL}/auth/security-question?email=${email}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("question-display").innerText = data.question;
    })
    .catch(() => {
      document.getElementById("question-display").innerText = "Error loading question.";
    });

  document.getElementById("confirm-form").addEventListener("submit", e => {
    e.preventDefault();
    const answer = document.getElementById("security-answer").value;
    const newPassword = document.getElementById("new-password").value;

    fetch(`${API_BASE_URL}/auth/reset-password/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, newPassword, security_answer: answer })
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        document.getElementById("status").innerText = data.message;
        if (ok) {
          setTimeout(() => window.location.href = "login.html", 2000);
        }
      })
      .catch(err => {
        console.error(err);
        document.getElementById("status").innerText = "Reset failed.";
      });
  });
});
