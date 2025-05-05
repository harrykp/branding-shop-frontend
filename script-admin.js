// script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

async function fetchJSON(path, opts = {}) {
  const url = API_BASE + path;
  let res;
  try {
    res = await fetch(url, {
      mode: 'cors',
      cache: 'no-cache',
      ...opts,
      headers
    });
  } catch (err) {
    throw new Error(`Network error: ${err.message}`);
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.json();
}

document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadView(el.dataset.view);
  })
);

async function loadView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  switch (view) {
    case 'users':           return usersView();
    case 'roles':           return rolesView();
    case 'products':        return productsView();
    case 'quotes':          return quotesView();
    case 'orders':          return ordersView();
    case 'jobs':            return jobsView();
    case 'leads':           return leadsView();
    case 'deals':           return dealsView();
    case 'hr':              return hrView();
    case 'finance':         return financeView();
    case 'suppliers':       return suppliersView();
    case 'catalog':         return catalogView();
    case 'purchaseOrders':  return purchaseOrdersView();
    case 'reports':         return reportsView();
    default:
      app.innerHTML = `<div class="alert alert-warning">Unknown view: ${view}</div>`;
  }
}

// ——— USERS ———
async function usersView() {
  const u = await fetchJSON('/users');
  app.innerHTML = `
    <h3>Users</h3>
    <button class="btn btn-success mb-3" onclick="createUser()">+ Add User</button>
    ${u.map(u => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <strong>${u.name}</strong> (${u.email})<br>
            Phone: ${u.phone_number || '–'}
          </div>
          <div>
            <button class="btn btn-sm btn-primary me-2" onclick="editUser(${u.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('')}
  `;
}
async function createUser() {
  const name = prompt('Name:');      if (!name)  return;
  const email = prompt('Email:');    if (!email) return;
  const phone = prompt('Phone:');
  const pwd   = prompt('Password:'); if (!pwd)   return;
  await fetchJSON('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone_number: phone, password: pwd })
  });
  usersView();
}
async function editUser(id) {
  const u = await fetchJSON(`/users/${id}`);
  const name  = prompt('Name:',  u.name);  if (name  == null) return;
  const email = prompt('Email:', u.email); if (email == null) return;
  const phone = prompt('Phone:', u.phone_number || '');
  await fetchJSON(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, email, phone_number: phone })
  });
  usersView();
}
async function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  await fetchJSON(`/users/${id}`, { method: 'DELETE' });
  usersView();
}

// ——— ROLES ———
async function rolesView() {
  const r = await fetchJSON('/roles');
  app.innerHTML = `
    <h3>Roles</h3>
    <button class="btn btn-success mb-3" onclick="createRole()">+ Add Role</button>
    ${r.map(r => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>${r.name}</div>
          <div>
            <button class="btn btn-sm btn-primary me-2" onclick="editRole(${r.id},'${r.name}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteRole(${r.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('')}
  `;
}
async function createRole() {
  const name = prompt('Role name:'); if (!name) return;
  await fetchJSON('/roles', { method:'POST', body:JSON.stringify({ name }) });
  rolesView();
}
async function editRole(id, oldName) {
  const name = prompt('Role name:', oldName); if (name == null) return;
  await fetchJSON(`/roles/${id}`, { method:'PATCH', body:JSON.stringify({ name }) });
  rolesView();
}
async function deleteRole(id) {
  if (!confirm('Delete this role?')) return;
  await fetchJSON(`/roles/${id}`, { method:'DELETE' });
  rolesView();
}

// ——— PRODUCTS ———
async function productsView() {
  const list = await fetchJSON('/products');
  app.innerHTML = `
    <h3>Products</h3>
    <button class="btn btn-success mb-3" onclick="createProduct()">+ Add Product</button>
    ${list.map(p => {
      const price = parseFloat(p.price) || 0;
      return `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>${p.name} — $${price.toFixed(2)}</div>
          <div>
            <button class="btn btn-sm btn-primary me-2" onclick="editProduct(${p.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
          </div>
        </div>
      </div>`;
    }).join('')}
  `;
}
async function createProduct() {
  const name = prompt('Name:');             if (!name) return;
  const desc = prompt('Description:','');
  const price = parseFloat(prompt('Price:','0')); if (isNaN(price)) return;
  const cat   = parseInt(prompt('Category ID:'),10);
  const type  = prompt('Type:','stockable');
  await fetchJSON('/products', {
    method: 'POST',
    body: JSON.stringify({ name, description: desc, price, category_id: cat, product_type: type })
  });
  productsView();
}
async function editProduct(id) {
  const p = await fetchJSON(`/products/${id}`);
  const name  = prompt('Name:',  p.name);            if (name == null) return;
  const price = parseFloat(prompt('Price:', p.price)); if (isNaN(price)) return;
  await fetchJSON(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, price })
  });
  productsView();
}
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  await fetchJSON(`/products/${id}`, { method: 'DELETE' });
  productsView();
}

// ——— QUOTES ———
async function quotesView() {
  const list = await fetchJSON('/quotes');
  app.innerHTML = `
    <h3>Quotes</h3>
    ${list.map(q => {
      const total = parseFloat(q.total) || 0;
      return `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>#${q.id} — ${q.customer_name} — $${total.toFixed(2)} — ${q.status}</div>
          <div>
            <button class="btn btn-sm btn-primary me-2" onclick="updateQuote(${q.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteQuote(${q.id})">Delete</button>
          </div>
        </div>
      </div>`;  
    }).join('')}
  `;
}
async function updateQuote(id) {
  const status = prompt('New status:'); if (status == null) return;
  await fetchJSON(`/quotes/${id}`, { method:'PATCH', body:JSON.stringify({ status }) });
  quotesView();
}
async function deleteQuote(id) {
  if (!confirm('Delete this quote?')) return;
  await fetchJSON(`/quotes/${id}`, { method:'DELETE' });
  quotesView();
}

// ——— ORDERS ———
async function ordersView() {
  const list = await fetchJSON('/orders');
  app.innerHTML = `
    <h3>Orders</h3>
    ${list.map(o => {
      const total = parseFloat(o.total) || 0;
      return `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>#${o.id} — ${o.customer_name} — $${total.toFixed(2)} — ${o.status}</div>
          <div>
            <button class="btn btn-sm btn-primary me-2" onclick="updateOrder(${o.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteOrder(${o.id})">Delete</button>
          </div>
        </div>
      </div>`;  
    }).join('')}
  `;
}
async function updateOrder(id) {
  const status = prompt('New status:'); if (status == null) return;
  await fetchJSON(`/orders/${id}`, { method:'PATCH', body:JSON.stringify({ status }) });
  ordersView();
}
async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  await fetchJSON(`/orders/${id}`, { method:'DELETE' });
  ordersView();
}

// ——— PRODUCTION JOBS ———
async function jobsView() {
  const list = await fetchJSON('/jobs');
  app.innerHTML = `
    <h3>Production Jobs</h3>
    ${list.map(j => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            #${j.id} — ${j.type} — ${j.status} — Qty:${parseInt(j.qty,10)||0} — Due: ${j.due_date ? new Date(j.due_date).toLocaleDateString() : '–'}
          </div>
          <div>
            <button class="btn btn-sm btn-primary me-2" onclick="updateJob(${j.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteJob(${j.id})">Delete</button>
          </div>
        </div>
      </div>`).join('')}
  `;
}
async function updateJob(id) {
  const status      = prompt('Status:'); if (status == null) return;
  const due_date    = prompt('Due Date (YYYY-MM-DD):');
  const qty         = parseInt(prompt('Quantity:'),10);
  const assigned_to = parseInt(prompt('Assign To User ID:'),10);
  await fetchJSON(`/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, due_date, qty, assigned_to })
  });
  jobsView();
}
async function deleteJob(id) {
  if (!confirm('Delete this job?')) return;
  await fetchJSON(`/jobs/${id}`, { method:'DELETE' });
  jobsView();
}

// ——— LEADS ———
async function leadsView() {
  const list = await fetchJSON('/leads');
  app.innerHTML = `
    <h3>Leads</h3>
    ${list.map(l => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>${l.name} (${l.email}) — ${l.status}</div>
          <div>
            <button class="btn btn-sm btn-danger" onclick="deleteLead(${l.id})">Delete</button>
          </div>
        </div>
      </div>`).join('')}
    <button class="btn btn-success mt-2" onclick="createLead()">+ Add Lead</button>
  `;
}
async function createLead() {
  const name   = prompt('Name:'); if (!name) return;
  const email  = prompt('Email:'); if (!email) return;
  const phone  = prompt('Phone:');
  const status = prompt('Status:','new');
  await fetchJSON('/leads', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, status })
  });
  leadsView();
}
async function deleteLead(id) {
  if (!confirm('Delete this lead?')) return;
  await fetchJSON(`/leads/${id}`, { method:'DELETE' });
  leadsView();
}

// ——— DEALS ———
async function dealsView() {
  const list = await fetchJSON('/deals');
  app.innerHTML = `
    <h3>Deals</h3>
    ${list.map(d => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>Lead#${d.lead_id} — $${parseFloat(d.value).toFixed(2)} — ${d.status}</div>
          <div>
            <button class="btn btn-sm btn-danger" onclick="deleteDeal(${d.id})">Delete</button>
          </div>
        </div>
      </div>`).join('')}
    <button class="btn btn-success mt-2" onclick="createDeal()">+ Add Deal</button>
  `;
}
async function createDeal() {
  const lead_id = parseInt(prompt('Lead ID:'),10); if (isNaN(lead_id)) return;
  const value   = parseFloat(prompt('Value:','0')); if (isNaN(value)) return;
  const status  = prompt('Status:','qualified');
  await fetchJSON('/deals', {
    method: 'POST',
    body: JSON.stringify({ lead_id, value, status })
  });
  dealsView();
}
async function deleteDeal(id) {
  if (!confirm('Delete this deal?')) return;
  await fetchJSON(`/deals/${id}`, { method:'DELETE' });
  dealsView();
}

// ——— HR ———
async function hrView() {
  const list = await fetchJSON('/hr');
  app.innerHTML = `
    <h3>HR Info</h3>
    ${list.map(h => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>${h.name} — ${h.ssn} — ${h.position} — $${parseFloat(h.salary).toFixed(2)}</div>
          <div>
            <button class="btn btn-sm btn-primary me-2" onclick="editHR(${h.id})">Edit</button>
          </div>
        </div>
      </div>`).join('')}
  `;
}
async function editHR(id) {
  const h = await fetchJSON(`/hr/${id}`);
  const position = prompt('Position:', h.position); if (position == null) return;
  const salary   = parseFloat(prompt('Salary:', h.salary)); if (isNaN(salary)) return;
  await fetchJSON(`/hr/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ position, salary })
  });
  hrView();
}

// ——— FINANCE ———
async function financeView() {
  const [payments, expenses] = await Promise.all([
    fetchJSON('/payments'),
    fetchJSON('/expenses')
  ]);
  app.innerHTML = `
    <h3>Payments</h3>
    ${payments.map(p => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>#${p.id} — $${parseFloat(p.amount).toFixed(2)} via ${p.gateway}</div>
          <div>
            <button class="btn btn-sm btn-danger" onclick="deletePayment(${p.id})">Delete</button>
          </div>
        </div>
      </div>`).join('')}
    <button class="btn btn-success mb-4" onclick="createPayment()">+ Add Payment</button>

    <h3>Expenses</h3>
    ${expenses.map(e => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>#${e.id} — $${parseFloat(e.amount).toFixed(2)} — ${e.category}</div>
          <div>
            <button class="btn btn-sm btn-danger" onclick="deleteExpense(${e.id})">Delete</button>
          </div>
        </div>
      </div>`).join('')}
    <button class="btn btn-success mt-2" onclick="createExpense()">+ Add Expense</button>
  `;
}

async function createPayment() {
  const order_id        = parseInt(prompt('Order ID:'), 10);
  const payment_type_id = parseInt(prompt('Payment Type ID:'),10);
  const gateway         = prompt('Gateway:');
  const amount          = parseFloat(prompt('Amount:','0'));
  if (isNaN(order_id)||isNaN(payment_type_id)||!gateway||isNaN(amount)) return;
  await fetchJSON('/payments', {
    method: 'POST',
    body: JSON.stringify({ order_id, payment_type_id, gateway, amount })
  });
  financeView();
}

async function deletePayment(id) {
  if (!confirm('Delete this payment?')) return;
  await fetchJSON(`/payments/${id}`, { method: 'DELETE' });
  financeView();
}

async function createExpense() {
  const amount       = parseFloat(prompt('Amount:','0'));
  const category     = prompt('Category:');
  const description  = prompt('Description:','');
  const expense_date = prompt('Date (YYYY-MM-DD):');
  if (isNaN(amount)||!category) return;
  await fetchJSON('/expenses', {
    method: 'POST',
    body: JSON.stringify({ amount, category, description, expense_date })
  });
  financeView();
}

async function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  await fetchJSON(`/expenses/${id}`, { method: 'DELETE' });
  financeView();
}

// ——— SUPPLIERS ———
async function suppliersView() {
  const list = await fetchJSON('/suppliers');
  app.innerHTML = `
    <h3>Suppliers</h3>
    ${list.map(s => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>${s.name} — ${s.website || '–'}</div>
          <div></div>
        </div>
      </div>`).join('')}
  `;
}

// ——— CATALOG ———
async function catalogView() {
  const list = await fetchJSON('/catalog');
  app.innerHTML = `
    <h3>Catalog Items</h3>
    ${list.map(i => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>${i.sku} — ${i.name} — $${parseFloat(i.cost).toFixed(2)} ${i.currency} — ${i.supplier_name}</div>
          <div>
            <button class="btn btn-sm btn-primary me-2" onclick="editCatalog(${i.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteCatalog(${i.id})">Delete</button>
          </div>
        </div>
      </div>`).join('')}
    <button class="btn btn-success mt-2" onclick="createCatalog()">+ Add Catalog Item</button>
  `;
}

function createCatalog() { alert('Not implemented'); }
function editCatalog(id) { alert(`Edit catalog ${id} not implemented`); }
function deleteCatalog(id) { alert(`Delete catalog ${id} not implemented`); }

// ——— PURCHASE ORDERS ———
async function purchaseOrdersView() {
  const list = await fetchJSON('/purchase-orders');
  app.innerHTML = `
    <h3>Purchase Orders</h3>
    ${list.map(po => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>#${po.id} — ${po.supplier_name} — ${po.status}</div>
          <div></div>
        </div>
      </div>`).join('')}
  `;
}

// ——— REPORTS ———
async function reportsView() {
  const [sales, fin, taxes, leave, cashflow] = await Promise.all([
    fetchJSON('/sales'),
    fetchJSON('/finance'),
    fetchJSON('/taxes-report'),
    fetchJSON('/leave'),
    fetchJSON('/cashflow')
  ]);

  app.innerHTML = `
    <h3>Sales by Month</h3>
    <table class="table table-striped">
      <thead><tr><th>Month</th><th>Total Sales</th></tr></thead>
      <tbody>${sales.map(r=>`<tr><td>${r.month}</td><td>$${parseFloat(r.total_sales).toFixed(2)}</td></tr>`).join('')}</tbody>
    </table>

    <h3>Finance Summary</h3>
    <div class="row mb-4">
      <div class="col-md-6"><div class="card p-3"><h5>Total Received</h5><p>$${parseFloat(fin.total_received).toFixed(2)}</p></div></div>
      <div class="col-md-6"><div class="card p-3"><h5>Total Expenses</h5><p>$${parseFloat(fin.total_expenses).toFixed(2)}</p></div></div>
    </div>

    <h3>Tax Totals</h3>
    <table class="table table-striped">
      <thead><tr><th>Tax</th><th>Total</th></tr></thead>
      <tbody>${taxes.map(t=>`<tr><td>${t.tax}</td><td>$${parseFloat(t.total).toFixed(2)}</td></tr>`).join('')}</tbody>
    </table>

    <h3>Leave Counts</h3>
    <table class="table table-striped">
      <thead><tr><th>User ID</th><th>Count</th></tr></thead>
      <tbody>${leave.map(l=>`<tr><td>${l.user_id}</td><td>${l.leave_count}</td></tr>`).join('')}</tbody>
    </table>

    <h3>Cashflow</h3>
    <table class="table table-striped">
      <thead><tr><th>Date</th><th>Start</th><th>Received</th><th>Paid</th><th>Deposit</th><th>End</th></tr></thead>
      <tbody>${cashflow.map(c=>`<tr>
        <td>${new Date(c.date).toLocaleDateString()}</td>
        <td>$${parseFloat(c.start_of_day_cash).toFixed(2)}</td>
        <td>$${parseFloat(c.payments_received).toFixed(2)}</td>
        <td>$${parseFloat(c.expenses_paid).toFixed(2)}</td>
        <td>$${parseFloat(c.bank_deposit).toFixed(2)}</td>
        <td>$${parseFloat(c.end_of_day_cash).toFixed(2)}</td>
      </tr>`).join('')}</tbody>
    </table>
  `;
}

// ——— LOGOUT ———
function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// initial load
loadView('users');
