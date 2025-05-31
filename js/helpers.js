function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function getCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    return null;
  }
}

function requireLogin() {
  const user = getCurrentUser();
  if (!user || !user.userId) {
    alert("Please log in to access this page.");
    window.location.href = "login.html";
  }
}

function fetchWithAuth(url, options = {}) {
  const token = getStoredToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }).then(res => res.json());
}
