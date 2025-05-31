function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Invalid token format", e);
    return null;
  }
}

function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function getCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = parseJwt(token);
    if (!payload.roles) payload.roles = []; // ensure roles is always an array
    return payload;
  } catch (e) {
    return null;
  }
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
  if (!token || !payload.roles || !payload.roles.includes("admin")) {
    alert("Admin access required");
    window.location.href = "unauthorized.html";
  }
}

function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "login.html";
}

async function fetchWithAuth(url, options = {}) {
  const token = getStoredToken();
  if (!token) throw new Error("Missing token");
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  return fetch(url, { ...options, headers });
}
