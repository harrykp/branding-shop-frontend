const API_BASE_URL = "https://branding-shop-backend.onrender.com/api";

document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone_number = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const security_question = document.getElementById("security-question")?.value;
  const security_answer = document.getElementById("security-answer")?.value;

  // Basic validation
  if (!name || !email || !phone_number || !password || !security_question || !security_answer) {
    alert("Please fill out all fields including security question.");
    return;
  }

  const payload = {
    name,
    email,
    phone_number,
    password,
    security_question,
    security_answer
  };

  fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        alert("Registration successful. Please log in.");
        window.location.href = "login.html";
      } else if (data.message) {
        alert(data.message);
      } else {
        alert("Registration failed.");
      }
    })
    .catch(err => {
      console.error("Error registering:", err);
      alert("An error occurred while registering.");
    });
});
