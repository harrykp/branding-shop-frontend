
document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const fullName = document.getElementById("full-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const question = document.getElementById("security-question").value;
  const answer = document.getElementById("security-answer").value.trim();

  try {
    const res = await fetch("https://branding-shop-backend.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        security_question: question,
        security_answer: answer
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("Account created! You may now login.");
    window.location.href = "login.html";
  } catch (err) {
    console.error("Register error", err);
    alert("An error occurred while registering.");
  }
});
