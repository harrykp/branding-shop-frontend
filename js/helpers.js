// helpers.js

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

// Pagination Renderer (fixed to support default container and args)
function renderPagination(totalItems, perPage = 10, currentPage = 1, onPageClick, containerId = 'pagination') {
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

// CSV Exporter (auto-detect first table)
function exportTableToCSV(filename = "export.csv") {
  const table = document.querySelector("table");
  if (!table) return;

  const rows = Array.from(table.querySelectorAll("tr"));
  const csv = rows.map(row =>
    Array.from(row.cells).map(cell => `"${cell.innerText.replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

async function populateDropdown(endpoint, selectId) {
  try {
    const res = await fetch(`${API_BASE}/api/${endpoint}`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` }
    });
    const result = await res.json();

    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">-- Select --</option>';

    let data = [];
    if (Array.isArray(result.customers)) {
      data = result.customers;
    } else if (Array.isArray(result.data)) {
      data = result.data;
    } else if (Array.isArray(result)) {
      data = result;
    }

    data.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error(`Failed to load dropdown for ${selectId}:`, error);
  }
}
