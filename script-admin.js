// branding-shop-frontend/script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const app = document.getElementById('app-admin');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

// helper to GET JSON or throw
async function fetchJSON(path) {
  const res = await fetch(API_BASE + path, { headers });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// side‐nav wiring
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

// dispatcher
async function loadAdminView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  switch (view) {
    case 'users':    return showUsers();
    case 'roles':    return showRoles();
    case 'products': return showProducts();
    case 'quotes':   return showQuotes();
    case 'orders':   return showOrders();
    case 'jobs':     return showProduction();
    case 'crm':      return showCRM();
    case 'hr':       return showHR();
    case 'finance':  return showFinance();
    case 'reports':  return showReports();
    default: app.innerHTML = '<p>Unknown view</p>';
  }
}

// ─── USERS (unchanged) ─────────────────────────────────────────────────────────

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
    method: 'PATCH', headers, body: JSON.stringify({ roles: [roleId] })
  });
  showUsers();
}

// ─── ROLES ─────────────────────────────────────────────────────────────────────

async function showRoles() {
  const roles = await fetchJSON('/roles');
  app.innerHTML = `
    <h3>Manage Roles</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="createRole()">New Role</button>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Name</th><th>Actions</th></tr></thead>
      <tbody>
        ${roles.map(r => `
          <tr>
            <td>${r.id}</td>
            <td>
              <input id="role-name-${r.id}" class="form-control form-control-sm" value="${r.name}">
            </td>
            <td>
              <button class="btn btn-sm btn-primary me-1" onclick="updateRole(${r.id})">Save</button>
              <button class="btn btn-sm btn-danger" onclick="deleteRole(${r.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

async function createRole() {
  const name = prompt('New role name');
  if (!name) return;
  await fetch(`${API_BASE}/roles`, {
    method: 'POST', headers, body: JSON.stringify({ name })
  });
  showRoles();
}

async function updateRole(id) {
  const name = document.getElementById(`role-name-${id}`).value;
  await fetch(`${API_BASE}/roles/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify({ name })
  });
  showRoles();
}

async function deleteRole(id) {
  if (!confirm('Delete this role?')) return;
  await fetch(`${API_BASE}/roles/${id}`, { method: 'DELETE', headers });
  showRoles();
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

async function showProducts() {
  const [products, categories] = await Promise.all([
    fetchJSON('/products'),
    fetchJSON('/product-categories')
  ]);
  app.innerHTML = `
    <h3>Products</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="createProduct()">New Product</button>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Price</th><th>Inventory</th><th>Category</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td>${p.id}</td>
            <td><input id="prod-name-${p.id}" class="form-control form-control-sm" value="${p.name}"></td>
            <td><input id="prod-price-${p.id}" type="number" step="0.01" class="form-control form-control-sm" value="${p.price}"></td>
            <td><input id="prod-inv-${p.id}" type="number" class="form-control form-control-sm" value="${p.inventory_count}"></td>
            <td>
              <select id="prod-cat-${p.id}" class="form-select form-select-sm">
                ${categories.map(c =>
                  `<option value="${c.id}" ${c.id===p.category_id?'selected':''}>${c.name}</option>`
                ).join('')}
              </select>
            </td>
            <td>
              <button class="btn btn-sm btn-primary me-1" onclick="updateProduct(${p.id})">Save</button>
              <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

async function createProduct() {
  const name = prompt('Name:');
  if (!name) return;
  const price = parseFloat(prompt('Price:', '0'))||0;
  const inv   = parseInt(prompt('Inventory:', '0'),10)||0;
  const categories = await fetchJSON('/product-categories');
  const cat = parseInt(prompt(
    'Category ID:\n' +
    categories.map(c=>`${c.id}: ${c.name}`).join('\n')
  ),10) || categories[0].id;
  await fetch(`${API_BASE}/products`, {
    method: 'POST', headers,
    body: JSON.stringify({ name, price, inventory_count: inv, category_id: cat })
  });
  showProducts();
}

async function updateProduct(id) {
  const name = document.getElementById(`prod-name-${id}`).value;
  const price = parseFloat(document.getElementById(`prod-price-${id}`).value)||0;
  const inv   = parseInt(document.getElementById(`prod-inv-${id}`).value,10)||0;
  const cat   = parseInt(document.getElementById(`prod-cat-${id}`).value,10);
  await fetch(`${API_BASE}/products/${id}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ name, price, inventory_count: inv, category_id: cat })
  });
  showProducts();
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers });
  showProducts();
}

// ─── QUOTES ──────────────────────────────────────────────────────────────────

async function showQuotes() {
  const quotes = await fetchJSON('/quotes');
  app.innerHTML = `
    <h3>Quotes</h3>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th><th>Customer</th><th>Category</th><th>Qty</th>
          <th>Unit Price</th><th>Total</th><th>Status</th><th>Created</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${quotes.map(q => `
          <tr>
            <td>${q.id}</td>
            <td>${q.customer_name}</td>
            <td>${q.category_name}</td>
            <td>${q.quantity}</td>
            <td>${parseFloat(q.unit_price).toFixed(2)}</td>
            <td>${parseFloat(q.total).toFixed(2)}</td>
            <td>
              <input id="quote-status-${q.id}" class="form-control form-control-sm" value="${q.status}">
            </td>
            <td>${new Date(q.created_at).toLocaleString()}</td>
            <td>
              <button class="btn btn-sm btn-primary me-1" onclick="updateQuote(${q.id})">Save</button>
              <button class="btn btn-sm btn-danger" onclick="deleteQuote(${q.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

async function updateQuote(id) {
  const status = document.getElementById(`quote-status-${id}`).value;
  await fetch(`${API_BASE}/quotes/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify({ status })
  });
  showQuotes();
}

async function deleteQuote(id) {
  if (!confirm('Delete this quote?')) return;
  await fetch(`${API_BASE}/quotes/${id}`, { method: 'DELETE', headers });
  showQuotes();
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

async function showOrders() {
  const orders = await fetchJSON('/orders');
  app.innerHTML = `
    <h3>Orders</h3>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th><th>Total</th><th>Status</th><th>Placed</th><th>Payment</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>${parseFloat(o.total).toFixed(2)}</td>
            <td>
              <input id="order-status-${o.id}" class="form-control form-control-sm" value="${o.status}">
            </td>
            <td>${new Date(o.placed_at).toLocaleString()}</td>
            <td>
              <input id="order-pay-${o.id}" class="form-control form-control-sm" value="${o.payment_status}">
            </td>
            <td>
              <button class="btn btn-sm btn-primary me-1" onclick="updateOrder(${o.id})">Save</button>
              <button class="btn btn-sm btn-danger" onclick="deleteOrder(${o.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

async function updateOrder(id) {
  const status = document.getElementById(`order-status-${id}`).value;
  const paySt = document.getElementById(`order-pay-${id}`).value;
  await fetch(`${API_BASE}/orders/${id}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ status, payment_status: paySt })
  });
  showOrders();
}

async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE', headers });
  showOrders();
}

// ─── PRODUCTION (JOBS) ───────────────────────────────────────────────────────

async function showProduction() {
  const [jobs, deps, users] = await Promise.all([
    fetchJSON('/jobs'),
    fetchJSON('/departments'),
    fetchJSON('/users')
  ]);
  app.innerHTML = `
    <h3>Production Jobs</h3>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th><th>Order</th><th>Type</th><th>Status</th>
          <th>Dept</th><th>Assigned To</th><th>Qty</th><th>Due</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${jobs.map(j => `
          <tr>
            <td>${j.id}</td>
            <td>${j.order_id}</td>
            <td>${j.type}</td>
            <td>
              <input id="job-status-${j.id}" class="form-control form-control-sm" value="${j.status}">
            </td>
            <td>${deps.find(d=>d.id===j.department_id)?.name||''}</td>
            <td>
              <select id="job-user-${j.id}" class="form-select form-select-sm">
                <option value="">Unassigned</option>
                ${users.map(u=>`<option value="${u.id}" ${u.id===j.assigned_to?'selected':''}>${u.name}</option>`).join('')}
              </select>
            </td>
            <td>${j.qty}</td>
            <td>
              <input id="job-due-${j.id}" type="date" class="form-control form-control-sm"
                value="${j.due_date?.slice(0,10)||''}">
            </td>
            <td>
              <button class="btn btn-sm btn-primary me-1" onclick="updateJob(${j.id})">Save</button>
              <button class="btn btn-sm btn-danger" onclick="deleteJob(${j.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

async function updateJob(id) {
  const status = document.getElementById(`job-status-${id}`).value;
  const assigned_to = document.getElementById(`job-user-${id}`).value || null;
  const due_date = document.getElementById(`job-due-${id}`).value||null;
  await fetch(`${API_BASE}/jobs/${id}`, {
    method:'PATCH', headers,
    body: JSON.stringify({ status, assigned_to, due_date })
  });
  showProduction();
}

async function deleteJob(id) {
  if (!confirm('Delete this job?')) return;
  await fetch(`${API_BASE}/jobs/${id}`, { method:'DELETE', headers });
  showProduction();
}

// ─── CRM (LEADS & DEALS) ──────────────────────────────────────────────────────

async function showCRM() {
  const [leads, deals, users] = await Promise.all([
    fetchJSON('/leads'),
    fetchJSON('/deals'),
    fetchJSON('/users')
  ]);
  let html = `<h3>Leads</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="createLead()">New Lead</button>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${leads.map(l=>`
          <tr>
            <td>${l.id}</td>
            <td><input id="lead-name-${l.id}" class="form-control form-control-sm" value="${l.name}"></td>
            <td><input id="lead-email-${l.id}" class="form-control form-control-sm" value="${l.email}"></td>
            <td><input id="lead-phone-${l.id}" class="form-control form-control-sm" value="${l.phone}"></td>
            <td>
              <input id="lead-status-${l.id}" class="form-control form-control-sm" value="${l.status}">
            </td>
            <td>
              <button class="btn btn-sm btn-primary me-1" onclick="updateLead(${l.id})">Save</button>
              <button class="btn btn-sm btn-danger" onclick="deleteLead(${l.id})">Delete</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  html += `<h3 class="mt-4">Deals</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="createDeal()">New Deal</button>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Lead</th><th>Assigned To</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${deals.map(d=>`
          <tr>
            <td>${d.id}</td>
            <td>${d.lead_id}</td>
            <td>
              <select id="deal-user-${d.id}" class="form-select form-select-sm">
                <option value="">None</option>
                ${users.map(u=>`<option value="${u.id}" ${u.id===d.assigned_to?'selected':''}>${u.name}</option>`).join('')}
              </select>
            </td>
            <td><input id="deal-value-${d.id}" type="number" step="0.01" class="form-control form-control-sm" value="${d.value}"></td>
            <td><input id="deal-status-${d.id}" class="form-control form-control-sm" value="${d.status}"></td>
            <td>
              <button class="btn btn-sm btn-primary me-1" onclick="updateDeal(${d.id})">Save</button>
              <button class="btn btn-sm btn-danger" onclick="deleteDeal(${d.id})">Delete</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  app.innerHTML = html;
}

async function createLead() {
  const name = prompt('Lead name'); if (!name) return;
  const email = prompt('Email'); if (!email) return;
  const phone = prompt('Phone'); if (!phone) return;
  await fetch(`${API_BASE}/leads`, {
    method:'POST', headers,
    body: JSON.stringify({ name, email, phone })
  });
  showCRM();
}

async function updateLead(id) {
  const name = document.getElementById(`lead-name-${id}`).value;
  const email = document.getElementById(`lead-email-${id}`).value;
  const phone = document.getElementById(`lead-phone-${id}`).value;
  const status= document.getElementById(`lead-status-${id}`).value;
  await fetch(`${API_BASE}/leads/${id}`, {
    method:'PATCH', headers,
    body: JSON.stringify({ name, email, phone, status })
  });
  showCRM();
}

async function deleteLead(id) {
  if (!confirm('Delete this lead?')) return;
  await fetch(`${API_BASE}/leads/${id}`,{method:'DELETE',headers});
  showCRM();
}

async function createDeal() {
  const lead_id = parseInt(prompt('Lead ID'),10); if (!lead_id) return;
  const assigned_to = parseInt(prompt('Assigned To User ID'),10)||null;
  const value = parseFloat(prompt('Value','0'))||0;
  await fetch(`${API_BASE}/deals`, {
    method:'POST', headers,
    body: JSON.stringify({ lead_id, assigned_to, value })
  });
  showCRM();
}

async function updateDeal(id) {
  const assigned_to = parseInt(document.getElementById(`deal-user-${id}`).value,10)||null;
  const value = parseFloat(document.getElementById(`deal-value-${id}`).value)||0;
  const status= document.getElementById(`deal-status-${id}`).value;
  await fetch(`${API_BASE}/deals/${id}`, {
    method:'PATCH', headers,
    body: JSON.stringify({ assigned_to, value, status })
  });
  showCRM();
}

async function deleteDeal(id) {
  if (!confirm('Delete this deal?')) return;
  await fetch(`${API_BASE}/deals/${id}`, { method:'DELETE', headers });
  showCRM();
}

// ─── HR ───────────────────────────────────────────────────────────────────────

async function showHR() {
  const hr = await fetchJSON('/hr');
  const users = await fetchJSON('/users');
  app.innerHTML = `
    <h3>HR Records</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="createHR()">New HR</button>
    <table class="table table-striped">
      <thead>
        <tr><th>ID</th><th>User</th><th>SSN</th><th>Hire Date</th><th>Position</th><th>Salary</th><th>Actions</th></tr>
      </thead>
      <tbody>
        ${hr.map(r=>`
          <tr>
            <td>${r.id}</td>
            <td>
              <select id="hr-user-${r.id}" class="form-select form-select-sm">
                ${users.map(u=>`<option value="${u.id}" ${u.id===r.user_id?'selected':''}>${u.name}</option>`).join('')}
              </select>
            </td>
            <td><input id="hr-ssn-${r.id}" class="form-control form-control-sm" value="${r.ssn||''}"></td>
            <td><input id="hr-hire-${r.id}" type="date" class="form-control form-control-sm" value="${r.hire_date?.slice(0,10)||''}"></td>
            <td><input id="hr-pos-${r.id}" class="form-control form-control-sm" value="${r.position||''}"></td>
            <td><input id="hr-sal-${r.id}" type="number" step="0.01" class="form-control form-control-sm" value="${r.salary||''}"></td>
            <td>
              <button class="btn btn-sm btn-primary me-1" onclick="updateHR(${r.id})">Save</button>
              <button class="btn btn-sm btn-danger" onclick="deleteHR(${r.id})">Delete</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

async function createHR() {
  const users = await fetchJSON('/users');
  const user_id = parseInt(prompt(
    'User ID:\n'+users.map(u=>`${u.id}: ${u.name}`).join('\n')
  ),10);
  if (!user_id) return;
  const ssn = prompt('SSN');
  const hire_date = prompt('Hire Date (YYYY-MM-DD)');
  const position  = prompt('Position');
  const salary    = parseFloat(prompt('Salary','0'))||0;
  await fetch(`${API_BASE}/hr`, {
    method:'POST', headers,
    body: JSON.stringify({ user_id, ssn, hire_date, position, salary })
  });
  showHR();
}

async function updateHR(id) {
  const user_id    = parseInt(document.getElementById(`hr-user-${id}`).value,10);
  const ssn        = document.getElementById(`hr-ssn-${id}`).value;
  const hire_date  = document.getElementById(`hr-hire-${id}`).value;
  const position   = document.getElementById(`hr-pos-${id}`).value;
  const salary     = parseFloat(document.getElementById(`hr-sal-${id}`).value)||0;
  await fetch(`${API_BASE}/hr/${id}`, {
    method:'PATCH', headers,
    body: JSON.stringify({ user_id, ssn, hire_date, position, salary })
  });
  showHR();
}

async function deleteHR(id) {
  if (!confirm('Delete this HR record?')) return;
  await fetch(`${API_BASE}/hr/${id}`, { method:'DELETE', headers });
  showHR();
}

// ─── FINANCE (PAYMENT TRANSACTIONS) ──────────────────────────────────────────

async function showFinance() {
  const [txns, types, users] = await Promise.all([
    fetchJSON('/payment-transactions'),
    fetchJSON('/payment-types'),
    fetchJSON('/users')
  ]);
  app.innerHTML = `
    <h3>Payment Transactions</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="createPayment()">New Payment</button>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th><th>Order</th><th>User</th><th>Type</th>
          <th>Gateway</th><th>Amount</th><th>Received</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${txns.map(t=>`
          <tr>
            <td>${t.id}</td>
            <td>${t.order_id}</td>
            <td>
              <select id="pay-user-${t.id}" class="form-select form-select-sm">
                ${users.map(u=>`<option value="${u.id}" ${u.id===t.user_id?'selected':''}>${u.name}</option>`).join('')}
              </select>
            </td>
            <td>
              <select id="pay-type-${t.id}" class="form-select form-select-sm">
                ${types.map(pt=>`<option value="${pt.id}" ${pt.id===t.payment_type_id?'selected':''}>${pt.name}</option>`).join('')}
              </select>
            </td>
            <td><input id="pay-gw-${t.id}" class="form-control form-control-sm" value="${t.gateway||''}"></td>
            <td><input id="pay-amt-${t.id}" type="number" step="0.01" class="form-control form-control-sm" value="${t.amount}"></td>
            <td><input id="pay-rec-${t.id}" type="datetime-local" class="form-control form-control-sm"
                   value="${new Date(t.received_at).toISOString().slice(0,16)}"></td>
            <td>
              <button class="btn btn-sm btn-primary me-1" onclick="updatePayment(${t.id})">Save</button>
              <button class="btn btn-sm btn-danger" onclick="deletePayment(${t.id})">Delete</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

async function createPayment() {
  const users = await fetchJSON('/users');
  const types = await fetchJSON('/payment-types');
  const order_id = parseInt(prompt('Order ID'),10); if (!order_id) return;
  const user_id  = parseInt(prompt(
    'User ID:\n'+users.map(u=>`${u.id}: ${u.name}`).join('\n')
  ),10);
  const type_id  = parseInt(prompt(
    'Payment Type ID:\n'+types.map(pt=>`${pt.id}: ${pt.name}`).join('\n')
  ),10);
  const gateway  = prompt('Gateway');
  const amount   = parseFloat(prompt('Amount','0'))||0;
  const received_at = prompt('Received at (YYYY-MM-DDTHH:MM)','');
  await fetch(`${API_BASE}/payment-transactions`, {
    method:'POST', headers,
    body: JSON.stringify({ order_id, user_id, payment_type_id: type_id, gateway, amount, received_at })
  });
  showFinance();
}

async function updatePayment(id) {
  const user_id  = parseInt(document.getElementById(`pay-user-${id}`).value,10);
  const type_id  = parseInt(document.getElementById(`pay-type-${id}`).value,10);
  const gateway  = document.getElementById(`pay-gw-${id}`).value;
  const amount   = parseFloat(document.getElementById(`pay-amt-${id}`).value)||0;
  const received_at = document.getElementById(`pay-rec-${id}`).value;
  await fetch(`${API_BASE}/payment-transactions/${id}`, {
    method:'PATCH', headers,
    body: JSON.stringify({ user_id, payment_type_id: type_id, gateway, amount, received_at })
  });
  showFinance();
}

async function deletePayment(id) {
  if (!confirm('Delete this payment?')) return;
  await fetch(`${API_BASE}/payment-transactions/${id}`, { method:'DELETE', headers });
  showFinance();
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────

async function showReports() {
  const [sales, financeSum, taxes, leave, cashflow] = await Promise.all([
    fetchJSON('/sales'),
    fetchJSON('/finance'),
    fetchJSON('/taxes'),
    fetchJSON('/leave'),
    fetchJSON('/cashflow'),
  ]);

  let html = `<h3>Sales by Month</h3>
    <table class="table table-striped">
      <thead><tr><th>Month</th><th>Total Sales</th></tr></thead>
      <tbody>${sales.map(s=>
        `<tr><td>${s.month}</td><td>${parseFloat(s.total_sales).toFixed(2)}</td></tr>`
      ).join('')}</tbody>
    </table>`;

  html += `<h3>Finance Summary</h3>
    <p>Total Received: $${parseFloat(financeSum.total_received).toFixed(2)}<br>
       Total Expenses: $${parseFloat(financeSum.total_expenses).toFixed(2)}</p>`;

  html += `<h3>Tax Totals</h3>
    <table class="table table-striped">
      <thead><tr><th>Tax</th><th>Total</th></tr></thead>
      <tbody>${taxes.map(t=>
        `<tr><td>${t.tax}</td><td>${parseFloat(t.total).toFixed(2)}</td></tr>`
      ).join('')}</tbody>
    </table>`;

  html += `<h3>Leave Counts</h3>
    <table class="table table-striped">
      <thead><tr><th>User ID</th><th>Count</th></tr></thead>
      <tbody>${leave.map(l=>
        `<tr><td>${l.user_id}</td><td>${l.leave_count}</td></tr>`
      ).join('')}</tbody>
    </table>`;

  html += `<h3>Cashflow</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>Date</th><th>Start Cash</th><th>Received</th>
        <th>Expenses</th><th>Deposit</th><th>End Cash</th>
      </tr></thead>
      <tbody>${cashflow.map(c=>
        `<tr>
          <td>${new Date(c.date).toLocaleDateString()}</td>
          <td>${parseFloat(c.start_of_day_cash).toFixed(2)}</td>
          <td>${parseFloat(c.payments_received).toFixed(2)}</td>
          <td>${parseFloat(c.expenses_paid).toFixed(2)}</td>
          <td>${parseFloat(c.bank_deposit).toFixed(2)}</td>
          <td>${parseFloat(c.end_of_day_cash).toFixed(2)}</td>
        </tr>`
      ).join('')}</tbody>
    </table>`;

  app.innerHTML = html;
}

// ─── LOGOUT ─────────────────────────────────────────────────────────────────

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// initial load
loadAdminView('roles');
