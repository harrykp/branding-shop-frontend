// Prevent redeclaration of API_BASE
if (typeof window.API_BASE === "undefined") {
  window.API_BASE = "https://branding-shop-backend.onrender.com";
}

// Token and Auth
function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function getCurrentUser() {
  const token = getStoredToken();
  return token ? parseJwt(token) : null;
}

function requireLogin() {
  const token = getStoredToken();
  const user = parseJwt(token);
  if (!token || !user || !user.userId) {
    alert("Login required.");
    window.location.href = "login.html";
  }
}

function requireAdmin() {
  const token = getStoredToken();
  const user = parseJwt(token);
  if (!token || !user || !user.roles || !user.roles.includes("admin")) {
    alert("Admin access required.");
    window.location.href = "unauthorized.html";
  }
}

async function fetchWithAuth(url, options = {}) {
  const token = getStoredToken();
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...options.headers
  };
  return fetch(fullUrl, { ...options, headers });
}

function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "login.html";
}

// Pagination Renderer
function renderPagination(totalItems, containerId, onPageClick, perPage = 10, currentPage = 1) {
  const totalPages = Math.ceil(totalItems / perPage);
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-outline-primary mx-1';
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.onclick = () => onPageClick(i);
    container.appendChild(btn);
  }
}

// CSV Exporter
function exportTableToCSV(tableId, filename = "export.csv") {
  const rows = document.querySelectorAll(`#${tableId} tr`);
  if (!rows.length) return;

  const csv = Array.from(rows).map(row =>
    Array.from(row.cells).map(cell => `"${cell.innerText.replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
