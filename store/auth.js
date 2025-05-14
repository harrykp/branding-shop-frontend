// Auto-logout after inactivity (15 minutes = 900000 ms)
const INACTIVITY_LIMIT = 15 * 60 * 1000;

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

function checkAuth() {
  const token = getToken();
  const payload = token ? parseJwt(token) : null;

  // Token missing or expired
  if (!token || !payload || (payload.exp && Date.now() > payload.exp * 1000)) {
    logout();
  }

  // Inactivity check
  const lastActivity = localStorage.getItem("lastActivity");
  if (lastActivity && (Date.now() - lastActivity > INACTIVITY_LIMIT)) {
    alert("You have been logged out due to inactivity.");
    logout();
  } else {
    localStorage.setItem("lastActivity", Date.now());
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("lastActivity");
  sessionStorage.removeItem("token");
  window.location.href = "login.html";
}

// Hook into page activity
window.addEventListener("load", checkAuth);
window.addEventListener("mousemove", () => localStorage.setItem("lastActivity", Date.now()));
window.addEventListener("keypress", () => localStorage.setItem("lastActivity", Date.now()));
