// branding-shop-frontend/script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

// Nav wiring
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

// Load view
async function loadAdminView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  switch (view) {
    case 'users':    return showUsers();
    case 'roles':    return showRoles();
    case 'products': return showProducts();
    case 'quotes':   return showQuotes();
    case 'orders':   return showOrders();
    case 'jobs':     return showJobs();
    case 'mockups':  return showMockups();
    case 'crm':      return showCRM();
    case 'hr':       return showHR();
    case 'finance':  return showFinance();
    case 'reports':  return showReports();
    default:
      app.innerHTML = '<p>Unknown view</p>';
  }
}

// Fetch helper
async function fetchJSON(path, opts={}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

// –– USERS ––
async function showUsers() {
  const users = await fetchJSON('/users');
  const roles = await fetchJSON('/roles');
  app.innerHTML = users.map(u => `
    <div class="card mb-2 p-3">
      <strong>${u.name} (${u.email})</strong>
      <select id="role-${u.id}" class="form-select form-select-sm my-2">
        ${roles.map(r => `<option value="${r.id}" ${u.roles.includes(r.id)?'selected':''}>${r.name}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-primary" onclick="updateUserRole(${u.id})">Update Role</button>
    </div>
  `).join('');
}

async function updateUserRole(userId) {
  const sel = document.getElementById(`role-${userId}`);
  await fetchJSON(`/users/${userId}/roles`, {
    method: 'PATCH',
    body: JSON.stringify({ roles: [sel.value] })
  });
  alert('Role updated');
}

// –– QUOTES ––
async function showQuotes() {
  const qs = await fetchJSON('/quotes');
  app.innerHTML = `
    <h3>Quotes</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>#</th><th>Customer</th><th>Category</th><th>Qty</th><th>Unit</th><th>Total</th><th>Status</th><th>At</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${qs.map(q => `
          <tr>
            <td>${q.id}</td>
            <td>${q.customer_name}</td>
            <td>${q.category_name}</td>
            <td>${q.quantity}</td>
            <td>$${q.unit_price.toFixed(2)}</td>
            <td>$${q.total.toFixed(2)}</td>
            <td>${q.status}</td>
            <td>${new Date(q.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="editQuote(${q.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteQuote(${q.id})">Delete</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// stub edit/deleteQuote…

// –– ORDERS ––
async function showOrders() {
  const os = await fetchJSON('/orders');
  app.innerHTML = `
    <h3>Orders</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>#</th><th>Customer</th><th>Quote #</th><th>Total</th><th>Status</th><th>Paid?</th><th>At</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${os.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>${o.customer_name}</td>
            <td>${o.quote_id}</td>
            <td>$${o.total.toFixed(2)}</td>
            <td>${o.status}</td>
            <td>${o.payment_status}</td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="editOrder(${o.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteOrder(${o.id})">Delete</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// stub editOrder/deleteOrder…

// –– JOBS ––
async function showJobs() {
  const js = await fetchJSON('/jobs');
  app.innerHTML = `
    <h3>Production Jobs</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>#</th><th>Order #</th><th>Type</th><th>Qty</th><th>Status</th><th>Due</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${js.map(j => `
          <tr>
            <td>${j.id}</td>
            <td>${j.order_id}</td>
            <td>${j.type}</td>
            <td>${j.qty}</td>
            <td>${j.status}</td>
            <td>${j.due_date?new Date(j.due_date).toLocaleDateString():''}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="editJob(${j.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteJob(${j.id})">Delete</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// stub editJob/deleteJob…

// –– MOCKUPS ––
async function showMockups() {
  const ms = await fetchJSON('/mockups');
  app.innerHTML = `
    <h3>Mockups</h3>
    <div class="row">
      ${ms.map(m => `
        <div class="col-md-4 mb-3">
          <div class="card">
            <img src="${m.image_url}" class="card-img-top">
            <div class="card-body">
              <p>#${m.id} for Quote #${m.quote_id}</p>
              <button class="btn btn-sm btn-danger" onclick="deleteMockup(${m.id})">Delete</button>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

// stub deleteMockup…

// –– STUBS for other views ––
async function showRoles(){ app.innerHTML='<h3>Roles</h3>' }
async function showProducts(){ app.innerHTML='<h3>Products</h3>' }
async function showCRM(){ app.innerHTML='<h3>CRM</h3>' }
async function showHR(){ app.innerHTML='<h3>HR</h3>' }
async function showFinance(){ app.innerHTML='<h3>Finance</h3>' }
async function showReports(){ app.innerHTML='<h3>Reports</h3>' }

function logout(){
  localStorage.removeItem('token');
  window.location.href='login.html';
}

// Initial
loadAdminView('users');
