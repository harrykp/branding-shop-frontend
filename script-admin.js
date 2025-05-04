// script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// Common headers for all API calls
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

const app = document.getElementById('app-admin');

// Helper: fetch JSON or throw
async function fetchJSON(path) {
  const res = await fetch(API_BASE + path, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return res.json();
}

// Wire up nav links
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
      case 'users':      return showUsers();
      case 'roles':      return showRoles();
      case 'products':   return showProducts();
      case 'quotes':     return showQuotes();
      case 'orders':     return showOrders();
      case 'jobs':       return showJobs();
      case 'crm':        return showCRM();
      case 'hr':         return showHR();
      case 'finance':    return showFinance();
      case 'reports':    return showReports();
      default:
        app.innerHTML = `<div class="alert alert-warning">Unknown view: ${view}</div>`;
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">Error loading ${view}: ${err.message}</div>`;
  }
}

// --- Users & Roles (already implemented) ---
async function showUsers() {
  const [users, allRoles] = await Promise.all([fetchJSON('/users'), fetchJSON('/roles')]);
  const html = users.map(u => `
    <div class="card mb-3 p-3">
      <div class="row align-items-center">
        <div class="col-md-4">
          <strong>${u.name}</strong><br>
          <small>${u.email}</small><br>
          <small>Phone: ${u.phone_number || '—'}</small>
        </div>
        <div class="col-md-4">
          <label for="role-select-${u.id}" class="form-label">Role</label>
          <select id="role-select-${u.id}" class="form-select">
            ${allRoles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-4 text-end">
          <button class="btn btn-primary" onclick="updateUserRole(${u.id})">
            Update Role
          </button>
        </div>
      </div>
    </div>
  `).join('');
  app.innerHTML = `<h3 class="mb-4">Manage Users</h3>${html}`;

  // Pre-select each user’s current role
  for (let u of users) {
    try {
      const userRoles = await fetchJSON(`/users/${u.id}/roles`);
      if (userRoles.length) {
        document.getElementById(`role-select-${u.id}`).value = userRoles[0].id;
      }
    } catch {
      /* silently skip */
    }
  }
}

async function updateUserRole(userId) {
  const roleId = document.getElementById(`role-select-${userId}`).value;
  await fetch(`${API_BASE}/users/${userId}/roles`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ roles: [roleId] })
  });
  alert('Role updated successfully.');
}

async function showRoles() {
  const roles = await fetchJSON('/roles');
  app.innerHTML = `
    <h3 class="mb-4">Roles</h3>
    <ul class="list-group">
      ${roles.map(r => `<li class="list-group-item">${r.id}. ${r.name}</li>`).join('')}
    </ul>
  `;
}

// --- Products ---
async function showProducts() {
  const products = await fetchJSON('/products');
  const rows = products.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.category || '—'}</td>
      <td>${p.product_type}</td>
      <td>${p.price.toFixed(2)}</td>
    </tr>
  `).join('');
  app.innerHTML = `
    <h3 class="mb-4">Products</h3>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Type</th><th>Price</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// --- Quotes ---
async function showQuotes() {
  const quotes = await fetchJSON('/quotes');
  const rows = quotes.map(q => `
    <tr>
      <td>${q.id}</td>
      <td>${q.customer_name}</td>
      <td>${q.total.toFixed(2)}</td>
      <td>${q.status}</td>
      <td>${new Date(q.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
  app.innerHTML = `
    <h3 class="mb-4">Quotes</h3>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Created</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// --- Orders ---
async function showOrders() {
  const orders = await fetchJSON('/orders');
  const rows = orders.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.customer_name}</td>
      <td>${o.total.toFixed(2)}</td>
      <td>${o.status}</td>
      <td>${new Date(o.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
  app.innerHTML = `
    <h3 class="mb-4">Orders</h3>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Created</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// --- Production (Jobs) ---
async function showJobs() {
  const jobs = await fetchJSON('/jobs');
  const rows = jobs.map(j => `
    <tr>
      <td>${j.id}</td>
      <td>${j.type}</td>
      <td>${j.status}</td>
      <td>${j.department}</td>
      <td>${j.assigned_to || '—'}</td>
      <td>${j.qty}</td>
      <td>${j.due_date || '—'}</td>
    </tr>
  `).join('');
  app.innerHTML = `
    <h3 class="mb-4">Production Jobs</h3>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Type</th><th>Status</th><th>Dept</th><th>Assigned</th><th>Qty</th><th>Due</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// --- CRM (Leads & Deals) ---
async function showCRM() {
  const [leads, deals] = await Promise.all([fetchJSON('/leads'), fetchJSON('/deals')]);
  const leadRows = leads.map(l => `<li>${l.name} (${l.email}) — ${l.status}</li>`).join('');
  const dealRows = deals.map(d => `<li>Lead #${d.lead_id} — $${d.value.toFixed(2)} — ${d.status}</li>`).join('');
  app.innerHTML = `
    <h3 class="mb-4">CRM</h3>
    <h5>Leads</h5><ul>${leadRows}</ul>
    <h5 class="mt-4">Deals</h5><ul>${dealRows}</ul>
  `;
}

// --- HR Info ---
async function showHR() {
  const hrInfo = await fetchJSON('/hr');
  const rows = hrInfo.map(h => `
    <tr>
      <td>${h.user_id}</td>
      <td>${h.name}</td>
      <td>${h.ssn}</td>
      <td>${h.position}</td>
      <td>${h.salary.toFixed(2)}</td>
      <td>${h.hire_date}</td>
    </tr>
  `).join('');
  app.innerHTML = `
    <h3 class="mb-4">HR Information</h3>
    <table class="table table-striped">
      <thead><tr><th>User ID</th><th>Name</th><th>SSN</th><th>Position</th><th>Salary</th><th>Hire Date</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// --- Finance (Payments & Expenses) ---
async function showFinance() {
  const [payments, expenses] = await Promise.all([
    fetchJSON('/payments'),
    fetchJSON('/expenses')
  ]);
  const payRows = payments.map(p => `<li>#${p.id} — $${p.amount.toFixed(2)} — ${new Date(p.received_at).toLocaleDateString()}</li>`).join('');
  const expRows = expenses.map(e => `<li>#${e.id} — $${e.amount.toFixed(2)} — ${e.category}</li>`).join('');
  app.innerHTML = `
    <h3 class="mb-4">Finance</h3>
    <h5>Payments</h5><ul>${payRows}</ul>
    <h5 class="mt-4">Expenses</h5><ul>${expRows}</ul>
  `;
}

// --- Reports (stub) ---
async function showReports() {
  const { message } = await fetchJSON('/reports');
  app.innerHTML = `
    <h3 class="mb-4">Reports</h3>
    <div class="alert alert-info">${message}</div>
  `;
}

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// Initial load
loadAdminView('users');
