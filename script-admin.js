// script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const app = document.getElementById('app-admin');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

// helper to GET and parse JSON (shows error text if not OK)
async function fetchJSON(path) {
  const res = await fetch(API_BASE + path, { headers });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// wire up the side‐nav
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

// Dispatch to the right view loader
async function loadAdminView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  switch (view) {
    case 'users':    return showUsers();
    case 'roles':    return showRoles();
    case 'products': return showProducts();
    case 'quotes':   return showQuotes();
    case 'orders':   return showOrders();
    case 'jobs':     return showJobs();
    case 'crm':      return showCRM();
    case 'hr':       return showHR();
    case 'finance':  return showFinance();
    case 'reports':  return showReports();
    default: app.innerHTML = '<p>Unknown view</p>';
  }
}

// ─────────────── Users & Roles ───────────────

async function showUsers() {
  const users = await fetchJSON('/users');
  const allRoles = await fetchJSON('/roles');

  app.innerHTML = `<h3>Manage Users & Roles</h3>` +
    users.map(u => `
      <div class="card mb-2 p-3">
        <strong>${u.name} (${u.email})</strong>
        <select id="roles-${u.id}" class="form-select form-select-sm my-2">
          ${allRoles.map(r =>
            `<option value="${r.id}" ${u.roles.includes(r.name)?'selected':''}>${r.name}</option>`
          ).join('')}
        </select>
        <button class="btn btn-sm btn-primary"
          onclick="updateUserRole(${u.id})">
          Update Role
        </button>
      </div>`
    ).join('');
}

async function updateUserRole(userId) {
  const roleId = document.getElementById(`roles-${userId}`).value;
  await fetch(`${API_BASE}/users/${userId}/roles`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ roles: [roleId] })
  });
  alert('Role updated.');
  showUsers();
}

// ─────────────── Roles ───────────────

async function showRoles() {
  const roles = await fetchJSON('/roles');
  app.innerHTML = `
    <h3>Manage Roles</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="createRole()">New Role</button>
    <table class="table table-striped">
      <thead>
        <tr><th>ID</th><th>Name</th><th>Actions</th></tr>
      </thead>
      <tbody>
        ${roles.map(r => `
          <tr>
            <td>${r.id}</td>
            <td>
              <input
                id="role-name-${r.id}"
                class="form-control form-control-sm"
                value="${r.name}"
              >
            </td>
            <td>
              <button class="btn btn-sm btn-primary me-1"
                onclick="updateRole(${r.id})">Save</button>
              <button class="btn btn-sm btn-danger"
                onclick="deleteRole(${r.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

async function createRole() {
  const name = prompt('Enter new role name');
  if (!name) return;
  await fetch(`${API_BASE}/roles`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name })
  });
  showRoles();
}

async function updateRole(id) {
  const name = document.getElementById(`role-name-${id}`).value;
  await fetch(`${API_BASE}/roles/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ name })
  });
  showRoles();
}

async function deleteRole(id) {
  if (!confirm('Are you sure you want to delete this role?')) return;
  await fetch(`${API_BASE}/roles/${id}`, {
    method: 'DELETE',
    headers
  });
  showRoles();
}

// ─────────────── Stubs for Other Views ───────────────
// Replace these stubs exactly like showRoles() once you’re ready

async function showProducts()  { app.innerHTML = `<h3>Products</h3>`; }
async function showQuotes()    { app.innerHTML = `<h3>Quotes</h3>`; }
async function showOrders()    { app.innerHTML = `<h3>Orders</h3>`; }
async function showJobs()      { app.innerHTML = `<h3>Production</h3>`; }
async function showCRM()       { app.innerHTML = `<h3>CRM</h3>`; }
async function showHR()        { app.innerHTML = `<h3>HR</h3>`; }
async function showFinance()   { app.innerHTML = `<h3>Finance</h3>`; }
async function showReports()   { app.innerHTML = `<h3>Reports</h3>`; }

// ─────────────── Logout ───────────────

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// kick it off on the “roles” tab
loadAdminView('roles');
