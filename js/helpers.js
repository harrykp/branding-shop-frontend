// helpers.js

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function requireAdmin() {
  const token = getToken();
  if (!token) return redirectToLogin();

  const payload = parseJwt(token);
  if (!payload || !payload.roles || !payload.roles.includes('admin')) {
    alert("Admin access required");
    window.location.href = "unauthorized.html";
  }
}

function redirectToLogin() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  window.location.href = "login.html";
}
