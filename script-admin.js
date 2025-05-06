// branding-shop-frontend/script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

async function fetchJSON(path) {
  const res = await fetch(API_BASE + path, { headers });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

async function loadAdminView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  try {
    switch (view) {
      case 'users':          return showUsers();
      case 'roles':          return showRoles();
      case 'products':       return showProducts();
      case 'quotes':         return showQuotes();
      case 'orders':         return showOrders();
      case 'production':     return showJobs();
      case 'suppliers':      return showSuppliers();
      case 'catalog':        return showCatalog();
      case 'purchaseOrders': return showPurchaseOrders();
      case 'leads':          return showLeads();
      case 'deals':          return showDeals();
      case 'crm':            return showCRM();
      case 'hr':             return showHR();
      case 'finance':        return showFinance();
      case 'reports':        return showReports();
      default:
        app.innerHTML = `<div class="alert alert-warning">Unknown view: ${view}</div>`;
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">Error loading ${view}: ${err.message}</div>`;
  }
}

// === Users ===
async function showUsers() {
  const users = await fetchJSON('/users');
  const roles = await fetchJSON('/roles');

  const rows = users.map(u => {
    const assigned = Array.isArray(u.roles) ? u.roles : [];
    return `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>
          <select id="roles-${u.id}" class="form-select form-select-sm">
            ${roles.map(r =>
              `<option value="${r.id}" ${assigned.includes(r.name) ? 'selected' : ''}>${r.name}</option>`
            ).join('')}
          </select>
        </td>
        <td>
          <button class="btn btn-sm btn-primary"
                  onclick="updateUserRole(${u.id})">Update</button>
        </td>
      </tr>
    `;
  }).join('');

  app.innerHTML = `
    <h3>Manage Users</h3>
    <table class="table table-striped">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function updateUserRole(userId) {
  const roleId = document.getElementById(`roles-${userId}`).value;
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

// === Roles ===
async function showRoles() {
  const roles = await fetchJSON('/roles');

  const rows = roles.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary"
                onclick="editRole(${r.id})">Edit</button>
        <button class="btn btn-sm btn-outline-danger ms-2"
                onclick="deleteRole(${r.id})">Delete</button>
      </td>
    </tr>
  `).join('');

  app.innerHTML = `
    <h3>Manage Roles</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="newRole()">New Role</button>
    <table class="table table-striped">
      <thead><tr><th>Role</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
function newRole()    { alert('Create new role'); }
function editRole(id) { alert('Edit role '+id); }
function deleteRole(id){
  if (confirm('Delete this role?')) alert('Deleted role '+id);
}

// === Stubs for all other views (so nothing breaks) ===
async function showProducts()       { app.innerHTML = '<h3>Products</h3><p>Under construction…</p>'; }
async function showQuotes()         { app.innerHTML = '<h3>Quotes</h3><p>Under construction…</p>'; }
async function showOrders()         { app.innerHTML = '<h3>Orders</h3><p>Under construction…</p>'; }
async function showJobs()           { app.innerHTML = '<h3>Production</h3><p>Under construction…</p>'; }
async function showSuppliers()      { app.innerHTML = '<h3>Suppliers</h3><p>Under construction…</p>'; }
async function showCatalog()        { app.innerHTML = '<h3>Catalog</h3><p>Under construction…</p>'; }
async function showPurchaseOrders() { app.innerHTML = '<h3>Purchase Orders</h3><p>Under construction…</p>'; }
async function showLeads()          { app.innerHTML = '<h3>Leads</h3><p>Under construction…</p>'; }
async function showDeals()          { app.innerHTML = '<h3>Deals</h3><p>Under construction…</p>'; }
async function showCRM()            { app.innerHTML = '<h3>CRM Home</h3><p>Use Leads/Deals above.</p>'; }
async function showHR()             { app.innerHTML = '<h3>HR</h3><p>Under construction…</p>'; }
async function showFinance()        { app.innerHTML = '<h3>Finance</h3><p>Under construction…</p>'; }
async function showReports()        { app.innerHTML = '<h3>Reports</h3><p>Under construction…</p>'; }

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// load default
loadAdminView('users');
