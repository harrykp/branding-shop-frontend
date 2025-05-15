const API_BASE_URL = "https://branding-shop-backend.onrender.com/api";

// Get token from local or session storage
const token = localStorage.getItem("token") || sessionStorage.getItem("token");

document.getElementById("profile-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const password = document.getElementById("new-password").value.trim();
  const question = document.getElementById("security-question").value;
  const answer = document.getElementById("security-answer").value.trim();
  const message = document.getElementById("update-msg");

  if (!password || !question || !answer) {
    message.innerText = "Please fill out all fields.";
    message.classList.remove("text-success");
    message.classList.add("text-danger");
    return;
  }

  fetch(`${API_BASE_URL}/auth/update-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      password,
      security_question: question,
      security_answer: answer
    })
  })
    .then(res => res.json())
    .then(data => {
      message.innerText = data.message || "Profile updated.";
      message.classList.remove("text-danger");
      message.classList.add("text-success");
    })
    .catch(err => {
      console.error(err);
      message.innerText = "Failed to update profile.";
      message.classList.remove("text-success");
      message.classList.add("text-danger");
    });
});
