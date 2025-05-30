function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "login.html";
}
