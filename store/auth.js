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

function checkAuth(requiredRole = null) {
  const token = getToken();
  const payload = token ? parseJwt(token) : null;

  if (!token || !payload || (payload.exp && Date.now() > payload.exp * 1000)) {
    logout();
  }

  const lastActivity = localStorage.getItem("lastActivity");
  if (lastActivity && (Date.now() - lastActivity > INACTIVITY_LIMIT)) {
    alert("You were logged out due to inactivity.");
    logout();
  } else {
    localStorage.setItem("lastActivity", Date.now());
  }

  // Role check
  if (requiredRole && payload?.role !== requiredRole) {
    alert("Unauthorized access.");
    logout();
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("lastActivity");
  sessionStorage.removeItem("token");
  window.location.href = "login.html";
}

// Update last activity on interaction
window.addEventListener("load", () => checkAuth());
window.addEventListener("mousemove", () => localStorage.setItem("lastActivity", Date.now()));
window.addEventListener("keypress", () => localStorage.setItem("lastActivity", Date.now()));
