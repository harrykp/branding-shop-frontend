// script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

const app = document.getElementById('app-admin');

// Helper: fetch JSON and throw on error
async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`(${res.status}) ${msg}`);
  }
  return res.json();
}

// Wire up nav
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
      case 'users':           return showUsers();
      case 'roles':           return showRoles();
      case 'products':        return showProducts();
      case 'quotes':          return showQuotes();
      case 'orders':          return showOrders();
      case 'jobs':            return showJobs();
      case 'crm':             return showCRM();
      case 'hr':              return showHR();
      case 'finance':         return showFinance();
      case 'reports':         return showReports();
      case 'catalog':         return showCatalog();
      default:
        app.innerHTML = `<div class="alert alert-warning">Unknown view: ${view}</div>`;
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">Error loading ${view}: ${err.message}</div>`;
  }
}

// --- USERS CRUD ---
async function showUsers() {
  const users = await fetchJSON('/users');
  const roles = await fetchJSON('/roles');

  let html = `
    <h3>Users</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="createUser()">Add User</button>
    <table class="table table-striped">
      <thead><tr>
        <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.phone_number||''}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="editUser(${u.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  app.innerHTML = html;
}

async function createUser() {
  const name = prompt('Name:');
  if (!name) return;
  const email = prompt('Email:');
  if (!email) return;
  const phone = prompt('Phone:');
  const password = prompt('Password:');
  if (!password) return alert('Password required');
  // Use auth/register to hash password & assign default role
  await fetchJSON('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone_number: phone, password })
  });
  alert('User created');
  showUsers();
}

async function editUser(id) {
  const u = await fetchJSON(`/users/${id}`);
  const name = prompt('Name:', u.name);
  if (name == null) return;
  const email = prompt('Email:', u.email);
  if (email == null) return;
  const phone = prompt('Phone:', u.phone_number);
  await fetchJSON(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, email, phone_number: phone })
  });
  alert('User updated');
  showUsers();
}

async function deleteUser(id) {
  if (!confirm('Delete user #' + id + '?')) return;
  await fetchJSON(`/users/${id}`, { method: 'DELETE' });
  showUsers();
}

// --- ROLES CRUD ---
async function showRoles() {
  const roles = await fetchJSON('/roles');
  let html = `
    <h3>Roles</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="createRole()">Add Role</button>
    <ul class="list-group">
      ${roles.map(r => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${r.name}
          <span>
            <button class="btn btn-sm btn-primary me-1" onclick="editRole(${r.id},'${r.name}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteRole(${r.id})">Delete</button>
          </span>
        </li>
      `).join('')}
    </ul>
  `;
  app.innerHTML = html;
}

async function createRole() {
  const name = prompt('Role name:');
  if (!name) return;
  await fetchJSON('/roles', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
  showRoles();
}

async function editRole(id, oldName) {
  const name = prompt('Role name:', oldName);
  if (name == null) return;
  await fetchJSON(`/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name })
  });
  showRoles();
}

async function deleteRole(id) {
  if (!confirm('Delete role #' + id + '?')) return;
  await fetchJSON(`/roles/${id}`, { method: 'DELETE' });
  showRoles();
}

// --- PRODUCTS CRUD ---
async function showProducts() {
  const prods = await fetchJSON('/products');
  let html = `
    <h3>Products</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="createProduct()">Add Product</button>
    <table class="table table-striped">
      <thead><tr>
        <th>ID</th><th>Name</th><th>Price</th><th>Type</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${prods.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.price.toFixed(2)}</td>
            <td>${p.product_type}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="editProduct(${p.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  app.innerHTML = html;
}

async function createProduct() {
  const name = prompt('Name:'); if (!name) return;
  const price = parseFloat(prompt('Price:', '0')); if (isNaN(price)) return;
  const type = prompt('Type (service/stockable):', 'stockable');
  const category = parseInt(prompt('Category ID:'),10);
  await fetchJSON('/products', {
    method: 'POST',
    body: JSON.stringify({ name, price, product_type: type, category_id: category })
  });
  showProducts();
}

async function editProduct(id) {
  const p = await fetchJSON(`/products/${id}`);
  const name = prompt('Name:', p.name); if (name==null) return;
  const price = parseFloat(prompt('Price:', p.price)); if (isNaN(price)) return;
  await fetchJSON(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, price })
  });
  showProducts();
}

async function deleteProduct(id) {
  if (!confirm('Delete product #' + id + '?')) return;
  await fetchJSON(`/products/${id}`, { method: 'DELETE' });
  showProducts();
}

// --- QUOTES CRUD ---
async function showQuotes() {
  const qs = await fetchJSON('/quotes');
  let html = `
    <h3>Quotes</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Created</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${qs.map(q => `
          <tr>
            <td>${q.id}</td>
            <td>${q.customer_name}</td>
            <td>${q.total.toFixed(2)}</td>
            <td>${q.status}</td>
            <td>${new Date(q.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="updateQuote(${q.id})">Update</button>
              <button class="btn btn-sm btn-danger"  onclick="deleteQuote(${q.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  app.innerHTML = html;
}

async function updateQuote(id) {
  const status = prompt('New status:');
  if (status==null) return;
  await fetchJSON(`/quotes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  showQuotes();
}

async function deleteQuote(id) {
  if (!confirm('Delete quote #' + id + '?')) return;
  await fetchJSON(`/quotes/${id}`, { method: 'DELETE' });
  showQuotes();
}

// --- ORDERS CRUD ---
async function showOrders() {
  const os = await fetchJSON('/orders');
  let html = `
    <h3>Orders</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Created</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${os.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>${o.customer_name}</td>
            <td>${o.total.toFixed(2)}</td>
            <td>${o.status}</td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="updateOrder(${o.id})">Update</button>
              <button class="btn btn-sm btn-danger"  onclick="deleteOrder(${o.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  app.innerHTML = html;
}

async function updateOrder(id) {
  const status = prompt('New status:');
  if (status==null) return;
  await fetchJSON(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  showOrders();
}

async function deleteOrder(id) {
  if (!confirm('Delete order #' + id + '?')) return;
  await fetchJSON(`/orders/${id}`, { method: 'DELETE' });
  showOrders();
}

// --- PRODUCTION (JOBS) CRUD ---
async function showJobs() {
  const js = await fetchJSON('/jobs');
  let html = `
    <h3>Production Jobs</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>ID</th><th>Type</th><th>Status</th><th>Qty</th><th>Due</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${js.map(j => `
          <tr>
            <td>${j.id}</td>
            <td>${j.type}</td>
            <td>${j.status}</td>
            <td>${j.qty}</td>
            <td>${j.due_date||''}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="updateJob(${j.id})">Update</button>
              <button class="btn btn-sm btn-danger"  onclick="deleteJob(${j.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  app.innerHTML = html;
}

async function updateJob(id) {
  const status = prompt('New status:');
  if (status==null) return;
  await fetchJSON(`/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  showJobs();
}

async function deleteJob(id) {
  if (!confirm('Delete job #' + id + '?')) return;
  await fetchJSON(`/jobs/${id}`, { method: 'DELETE' });
  showJobs();
}

// --- CRM (LEADS & DEALS) ---
async function showCRM() {
  const [leads, deals] = await Promise.all([
    fetchJSON('/leads'),
    fetchJSON('/deals')
  ]);
  let html = '<h3>CRM</h3><div class="row">';
  html += '<div class="col-md-6">';
  html += '<h5>Leads</h5><ul class="list-group">';
  leads.forEach(l =>
    html += `<li class="list-group-item">
      ${l.name} (${l.email}) - ${l.status}
      <button class="btn btn-sm btn-danger float-end" onclick="deleteLead(${l.id})">Delete</button>
    </li>`
  );
  html += '</ul><button class="btn btn-sm btn-success mt-2" onclick="createLead()">Add Lead</button>';
  html += '</div><div class="col-md-6">';
  html += '<h5>Deals</h5><ul class="list-group">';
  deals.forEach(d =>
    html += `<li class="list-group-item">
      Lead#${d.lead_id} - $${d.value.toFixed(2)} - ${d.status}
      <button class="btn btn-sm btn-danger float-end" onclick="deleteDeal(${d.id})">Delete</button>
    </li>`
  );
  html += '</ul><button class="btn btn-sm btn-success mt-2" onclick="createDeal()">Add Deal</button>';
  html += '</div></div>';
  app.innerHTML = html;
}

async function createLead() {
  const name = prompt('Lead Name:'); if (!name) return;
  const email = prompt('Email:'); if (!email) return;
  const phone = prompt('Phone:');
  const status = prompt('Status:', 'new');
  await fetchJSON('/leads', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, status })
  });
  showCRM();
}

async function deleteLead(id) {
  if (!confirm('Delete lead #' + id + '?')) return;
  await fetchJSON(`/leads/${id}`, { method: 'DELETE' });
  showCRM();
}

async function createDeal() {
  const lead_id = parseInt(prompt('Lead ID:'), 10); if (isNaN(lead_id)) return;
  const value = parseFloat(prompt('Value:', '0')); if (isNaN(value)) return;
  const status = prompt('Status:', 'qualified');
  await fetchJSON('/deals', {
    method: 'POST',
    body: JSON.stringify({ lead_id, value, status })
  });
  showCRM();
}

async function deleteDeal(id) {
  if (!confirm('Delete deal #' + id + '?')) return;
  await fetchJSON(`/deals/${id}`, { method: 'DELETE' });
  showCRM();
}

// --- HR ---
async function showHR() {
  const data = await fetchJSON('/hr');
  let html = `
    <h3>HR Information</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>User ID</th><th>SSN</th><th>Position</th><th>Salary</th><th>Actions</th>
      </tr></thead><tbody>`;
  data.forEach(h =>
    html += `<tr>
      <td>${h.user_id}</td>
      <td>${h.ssn}</td>
      <td>${h.position}</td>
      <td>${h.salary.toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editHR(${h.id})">Edit</button>
      </td>
    </tr>`
  );
  html += `</tbody></table>`;
  app.innerHTML = html;
}

async function editHR(id) {
  const h = await fetchJSON(`/hr/${id}`);
  const position = prompt('Position:', h.position); if (position==null) return;
  const salary  = parseFloat(prompt('Salary:', h.salary)); if (isNaN(salary)) return;
  await fetchJSON(`/hr/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ position, salary })
  });
  showHR();
}

// --- FINANCE (Payments & Expenses) ---
async function showFinance() {
  const [payments, expenses] = await Promise.all([
    fetchJSON('/payments'),
    fetchJSON('/expenses')
  ]);
  let html = '<h3>Finance</h3><div class="row">';
  html += '<div class="col-md-6"><h5>Payments</h5><ul class="list-group">';
  payments.forEach(p =>
    html += `<li class="list-group-item">
      #${p.id} $${p.amount.toFixed(2)} via ${p.gateway}
      <button class="btn btn-sm btn-danger float-end" onclick="deletePayment(${p.id})">Delete</button>
    </li>`
  );
  html += `</ul><button class="btn btn-sm btn-success mt-2" onclick="createPayment()">Add Payment</button></div>`;
  html += '<div class="col-md-6"><h5>Expenses</h5><ul class="list-group">';
  expenses.forEach(e =>
    html += `<li class="list-group-item">
      #${e.id} $${e.amount.toFixed(2)} - ${e.category}
      <button class="btn btn-sm btn-danger float-end" onclick="deleteExpense(${e.id})">Delete</button>
    </li>`
  );
  html += `</ul><button class="btn btn-sm btn-success mt-2" onclick="createExpense()">Add Expense</button></div>`;
  html += '</div>';
  app.innerHTML = html;
}

async function createPayment() {
  const order_id = parseInt(prompt('Order ID:'),10); if (isNaN(order_id)) return;
  const amount   = parseFloat(prompt('Amount:', '0')); if (isNaN(amount)) return;
  const gateway  = prompt('Gateway:', 'MTN Momo');
  const type_id  = parseInt(prompt('PaymentType ID:'),10); if (isNaN(type_id)) return;
  await fetchJSON('/payments', {
    method: 'POST',
    body: JSON.stringify({ order_id, payment_type_id: type_id, gateway, amount })
  });
  showFinance();
}

async function deletePayment(id) {
  if (!confirm('Delete payment #' + id + '?')) return;
  await fetchJSON(`/payments/${id}`, { method: 'DELETE' });
  showFinance();
}

async function createExpense() {
  const amount   = parseFloat(prompt('Amount:', '0')); if (isNaN(amount)) return;
  const category = prompt('Category:','General');
  const desc     = prompt('Description:','');
  const date     = prompt('Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
  await fetchJSON('/expenses', {
    method: 'POST',
    body: JSON.stringify({ amount, category, description: desc, expense_date: date })
  });
  showFinance();
}

async function deleteExpense(id) {
  if (!confirm('Delete expense #' + id + '?')) return;
  await fetchJSON(`/expenses/${id}`, { method: 'DELETE' });
  showFinance();
}

// --- REPORTS (stub) ---
async function showReports() {
  const { message } = await fetchJSON('/reports');
  app.innerHTML = `<h3>Reports</h3><div class="alert alert-info">${message}</div>`;
}

// --- CATALOG (same as catalog route) ---
async function showCatalog() {
  const items = await fetchJSON('/catalog');
  let html = `
    <h3>Catalog Items</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>ID</th><th>SKU</th><th>Name</th><th>Cost</th><th>Currency</th><th>Supplier</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${items.map(i => `
          <tr>
            <td>${i.id}</td>
            <td>${i.sku}</td>
            <td>${i.name}</td>
            <td>${i.cost.toFixed(2)}</td>
            <td>${i.currency}</td>
            <td>${i.supplier_name}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="editCatalog(${i.id})">Edit</button>
              <button class="btn btn-sm btn-danger"  onclick="deleteCatalog(${i.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <button class="btn btn-sm btn-success" onclick="createCatalog()">Add Item</button>
  `;
  app.innerHTML = html;
}

async function createCatalog() {
  const sku      = prompt('SKU:'); if (!sku) return;
  const name     = prompt('Name:'); if (!name) return;
  const cost     = parseFloat(prompt('Cost:', '0')); if (isNaN(cost)) return;
  const currency = prompt('Currency:','USD');
  const supId    = parseInt(prompt('Supplier ID:'),10); if (isNaN(supId)) return;
  await fetchJSON('/catalog', {
    method: 'POST',
    body: JSON.stringify({ sku, name, cost, currency, supplier_id: supId })
  });
  showCatalog();
}

async function editCatalog(id) {
  const i = await fetchJSON(`/catalog/${id}`);
  const name = prompt('Name:', i.name); if (name==null) return;
  const cost = parseFloat(prompt('Cost:', i.cost)); if (isNaN(cost)) return;
  await fetchJSON(`/catalog/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, cost })
  });
  showCatalog();
}

async function deleteCatalog(id) {
  if (!confirm('Delete catalog item #' + id + '?')) return;
  await fetchJSON(`/catalog/${id}`, { method: 'DELETE' });
  showCatalog();
}

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// Initial load
loadAdminView('users');
