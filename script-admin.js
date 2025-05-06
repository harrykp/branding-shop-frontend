// script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

// helper to GET and parse JSON, throws on bad status
async function fetchJSON(path) {
  const res = await fetch(API_BASE + path, { headers });
  const text = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// wire up the nav links
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

// main view loader
async function loadAdminView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  try {
    switch (view) {
      case 'users':           return showUsers();
      case 'roles':           return showRoles();
      case 'products':        return showProducts();
      case 'quotes':          return showQuotes();
      case 'orders':          return showOrders();
      case 'production':      return showJobs();
      case 'crm':             return showCRM();
      case 'hr':              return showHR();
      case 'finance':         return showFinance();
      case 'reports':         return showReports();
      case 'suppliers':       return showSuppliers();
      case 'catalog':         return showCatalog();
      case 'purchaseOrders':  return showPurchaseOrders();
      default:
        app.innerHTML = `<p>Unknown view: ${view}</p>`;
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">Error loading ${view}: ${err.message}</div>`;
  }
}

// === Users & Roles ===
async function showUsers() {
  const users    = await fetchJSON('/users');
  const allRoles = await fetchJSON('/roles');

  const html = users.map(u => {
    // ensure u.roles is always an array
    const assigned = Array.isArray(u.roles) ? u.roles : [];
    return `
      <div class="card mb-3 p-3">
        <strong>${u.name} &lt;${u.email}&gt;</strong>
        <div class="mt-2">
          <label for="roles-${u.id}" class="form-label">Role:</label>
          <select id="roles-${u.id}" class="form-select form-select-sm">
            ${allRoles.map(r =>
              `<option value="${r.id}" ${assigned.includes(r.name) ? 'selected' : ''}>
                ${r.name}
              </option>`
            ).join('')}
          </select>
          <button class="btn btn-sm btn-primary mt-2"
                  onclick="updateUserRole(${u.id})">
            Update Role
          </button>
        </div>
      </div>
    `;
  }).join('');

  app.innerHTML = `<h3>Manage Users & Roles</h3>${html}`;
}

async function updateUserRole(userId) {
  const sel    = document.getElementById(`roles-${userId}`);
  const roleId = sel.value;
  try {
    await fetch(`${API_BASE}/users/${userId}/roles`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ roles: [roleId] })
    });
    alert('Role updated.');
  } catch (err) {
    alert('Update failed: ' + err.message);
  }
}

// === Stub views (fill in as you implement) ===
async function showRoles()           { app.innerHTML = '<h3>Roles</h3><p>…CRUD here…</p>'; }
async function showProducts()        { app.innerHTML = '<h3>Products</h3><p>…CRUD here…</p>'; }
async function showQuotes()          { app.innerHTML = '<h3>Quotes</h3><p>…CRUD here…</p>'; }
async function showOrders()          { app.innerHTML = '<h3>Orders</h3><p>…CRUD here…</p>'; }
async function showJobs()            { app.innerHTML = '<h3>Production Jobs</h3><p>…CRUD here…</p>'; }
async function showCRM()             { app.innerHTML = '<h3>CRM</h3><p>…CRUD here…</p>'; }
async function showHR()              { app.innerHTML = '<h3>HR</h3><p>…CRUD here…</p>'; }
async function showFinance()         { app.innerHTML = '<h3>Finance</h3><p>…CRUD here…</p>'; }
async function showReports()         { app.innerHTML = '<h3>Reports</h3><p>…CRUD here…</p>'; }
async function showSuppliers()       { app.innerHTML = '<h3>Suppliers</h3><p>…CRUD here…</p>'; }
async function showCatalog()         { app.innerHTML = '<h3>Catalog</h3><p>…CRUD here…</p>'; }
async function showPurchaseOrders()  { app.innerHTML = '<h3>Purchase Orders</h3><p>…CRUD here…</p>'; }

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('roles');
  window.location.href = 'login.html';
}

// initial load
loadAdminView('users');
