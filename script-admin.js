// branding-shop-frontend/script-admin.js
console.log('🔥 script-admin.js v6 loaded – Products, Quotes & Orders CRUD live');

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
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
  console.log('🔄 Loading view:', view);
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

// ===== PRODUCTS CRUD =====
// ... (unchanged from v5) ...

// ===== QUOTES CRUD =====
// ... (unchanged from v5) ...

// ===== ORDERS CRUD =====

async function showOrders() {
  // fetch orders plus users to display customer info
  const [orders, users] = await Promise.all([
    fetchJSON('/orders'),
    fetchJSON('/users')
  ]);

  const rows = orders.map(o => {
    const user = users.find(u => u.id === o.user_id);
    return `
      <tr>
        <td>${o.id}</td>
        <td>${user ? user.name : '—'}</td>
        <td>$${Number(o.total).toFixed(2)}</td>
        <td>${o.status}</td>
        <td>${new Date(o.placed_at).toLocaleDateString()}</td>
        <td>${o.payment_status}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary me-1"
                  onclick="editOrderForm(${o.id})">Edit</button>
          <button class="btn btn-sm btn-outline-danger"
                  onclick="deleteOrder(${o.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  app.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Orders</h3>
      <button class="btn btn-success" onclick="newOrderForm()">+ New Order</button>
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th><th>Customer</th><th>Total</th>
          <th>Status</th><th>Placed</th><th>Payment</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function newOrderForm() {
  const [users, quotes] = await Promise.all([
    fetchJSON('/users'),
    fetchJSON('/quotes')
  ]);
  renderOrderForm(users, quotes);
}

async function editOrderForm(id) {
  const [users, quotes, order] = await Promise.all([
    fetchJSON('/users'),
    fetchJSON('/quotes'),
    fetchJSON(`/orders/${id}`)
  ]);
  renderOrderForm(users, quotes, order);
}

function renderOrderForm(users, quotes, order = {}) {
  const isEdit = Boolean(order.id);
  const userId = order.user_id || '';
  const quoteId= order.quote_id || '';
  const total  = order.total != null ? order.total : '';
  const status = order.status || 'new';
  const payStat= order.payment_status || 'pending';

  app.innerHTML = `
    <h3>${isEdit ? 'Edit' : 'New'} Order</h3>
    <form id="order-form" class="mt-3">
      <div class="mb-3">
        <label class="form-label">Customer</label>
        <select id="o-user" class="form-select" required>
          <option value="">-- select customer --</option>
          ${users.map(u=>
            `<option value="${u.id}" ${u.id===userId?'selected':''}>${u.name}</option>`
          ).join('')}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Quote</label>
        <select id="o-quote" class="form-select" required>
          <option value="">-- select quote --</option>
          ${quotes.map(q=>
            `<option value="${q.id}" ${q.id===quoteId?'selected':''}>
              #${q.id} — $${Number(q.total).toFixed(2)}
            </option>`
          ).join('')}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Total</label>
        <input id="o-total" type="number" step="0.01" class="form-control" required value="${total}">
      </div>
      <div class="mb-3">
        <label class="form-label">Status</label>
        <input id="o-status" class="form-control" required value="${status}">
      </div>
      <div class="mb-3">
        <label class="form-label">Payment Status</label>
        <input id="o-paystat" class="form-control" required value="${payStat}">
      </div>
      <button type="submit" class="btn btn-primary">
        ${isEdit ? 'Save Changes' : 'Create Order'}
      </button>
      <button type="button" class="btn btn-secondary ms-2" onclick="showOrders()">Cancel</button>
    </form>
  `;

  document.getElementById('order-form').onsubmit = async e => {
    e.preventDefault();
    const payload = {
      user_id:         parseInt(document.getElementById('o-user').value,10),
      quote_id:        parseInt(document.getElementById('o-quote').value,10),
      total:           parseFloat(document.getElementById('o-total').value),
      status:          document.getElementById('o-status').value,
      payment_status:  document.getElementById('o-paystat').value
    };
    try {
      if (isEdit) {
        await fetchJSON(`/orders/${order.id}`, {
          method: 'PATCH', body: JSON.stringify(payload)
        });
        alert('Order updated.');
      } else {
        await fetchJSON('/orders', {
          method: 'POST', body: JSON.stringify(payload)
        });
        alert('Order created.');
      }
      showOrders();
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };
}

async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  try {
    await fetchJSON(`/orders/${id}`, { method: 'DELETE' });
    alert('Deleted.');
    showOrders();
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

// ===== other stubs =====
async function showUsers()          { app.innerHTML = '<h3>Users</h3><p>…stub…</p>'; }
async function showRoles()          { app.innerHTML = '<h3>Roles</h3><p>…stub…</p>'; }
async function showJobs()           { app.innerHTML = '<h3>Production</h3><p>…stub…</p>'; }
async function showSuppliers()      { app.innerHTML = '<h3>Suppliers</h3><p>…stub…</p>'; }
async function showCatalog()        { app.innerHTML = '<h3>Catalog</h3><p>…stub…</p>'; }
async function showPurchaseOrders() { app.innerHTML = '<h3>Purchase Orders</h3><p>…stub…</p>'; }
async function showLeads()          { app.innerHTML = '<h3>Leads</h3><p>…stub…</p>'; }
async function showDeals()          { app.innerHTML = '<h3>Deals</h3><p>…stub…</p>'; }
async function showCRM()            { app.innerHTML = '<h3>CRM Home</h3><p>Use Leads/Deals above.</p>'; }
async function showHR()             { app.innerHTML = '<h3>HR</h3><p>…stub…</p>'; }
async function showFinance()        { app.innerHTML = '<h3>Finance</h3><p>…stub…</p>'; }
async function showReports()        { app.innerHTML = '<h3>Reports</h3><p>…stub…</p>'; }

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// initial load
loadAdminView('products');
