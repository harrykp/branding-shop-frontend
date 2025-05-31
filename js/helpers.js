function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Invalid token format");
    return null;
  }
}

function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function requireLogin() {
  const token = getStoredToken();
  const payload = parseJwt(token);
  if (!token || !payload || !payload.userId) {
    alert("Please log in to access this page.");
    window.location.href = "login.html";
  }
}

function requireAdmin() {
  const token = getStoredToken();
  const payload = parseJwt(token);
  if (!token || !payload || !payload.roles || !payload.roles.includes("admin")) {
    alert("Admin access required");
    window.location.href = "unauthorized.html";
  }
}

function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "login.html";
}
