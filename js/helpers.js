// js/helpers.js

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Invalid token format");
    return null;
  }
}

// Gets stored token from either localStorage or sessionStorage
function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// Gets stored user profile from localStorage
function getCurrentUser() {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

// Redirects to login.html if user not authenticated
function requireLogin() {
  const token = getStoredToken();
  const payload = parseJwt(token);
  if (!token || !payload || !payload.userId) {
    alert("Please log in to access this page.");
    window.location.href = "login.html";
  }
}

// Redirects to unauthorized.html if user is not admin
function requireAdmin() {
  const token = getStoredToken();
  const payload = parseJwt(token);
  if (!token || !payload || !payload.roles || !payload.roles.includes("admin")) {
    alert("Admin access required");
    window.location.href = "unauthorized.html";
  }
}

// Logs out and redirects to login
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  window.location.href = "login.html";
}
