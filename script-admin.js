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

// wire up nav links
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

// === Users & Roles ===
async function showUsers() {
  const users    = await fetchJSON('/users');
  const allRoles = await fetchJSON('/roles');

  const html = users.map(u => {
    const assigned = Array.isArray(u.roles) ? u.roles : [];
    return `
      <div class="card mb-3 p-3">
        <strong>${u.name} &lt;${u.email}&gt;</strong>
        <div class="mt-2">
          <label for="roles-${u.id}" class="form-label">Role:</label>
          <select id="roles-${u.id}" class="form-select form-select-sm">
            ${allRoles.map(r =>
              `<option value="${r.id}" ${assigned.includes(r.name)?'selected':''}>
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

// === Products ===
async function showProducts() {
  const cats     = await fetchJSON('/product-categories');
  const products = await fetchJSON('/products');

  const html = products.map(p => {
    const cat = cats.find(c => c.id === p.category_id);
    return `
      <div class="card mb-2 p-3">
        <strong>${p.name}</strong> (SKU: ${p.sku || '—'})<br>
        Category: ${cat ? cat.name : '—'}<br>
        Price: $${Number(p.price).toFixed(2)}<br>
        <button class="btn btn-sm btn-outline-secondary mt-2"
                onclick="editProduct(${p.id})">
          Edit
        </button>
      </div>
    `;
  }).join('');
  app.innerHTML = `<h3>Products</h3>${html}`;
}

// stub for edit
function editProduct(id) { alert('Edit Product '+id); }

// === Quotes ===
async function showQuotes() {
  const quotes = await fetchJSON('/quotes');
  const html = quotes.map(q => `
    <div>#${q.id}: ${q.category_name} ×${q.quantity} @ $${Number(q.unit_price).toFixed(2)} = $${Number(q.total).toFixed(2)}
      <br>Status: ${q.status}
      <button class="btn btn-sm btn-outline-secondary mt-1"
              onclick="editQuote(${q.id})">Edit</button>
    </div>
  `).join('<hr>');
  app.innerHTML = `<h3>Quotes</h3>${html}`;
}
function editQuote(id){ alert('Edit Quote '+id); }

// === Orders ===
async function showOrders() {
  const orders = await fetchJSON('/orders');
  const html = orders.map(o => `
    <div>#${o.id}: $${Number(o.total).toFixed(2)} — ${o.status}
      <button class="btn btn-sm btn-outline-secondary mt-1"
              onclick="editOrder(${o.id})">Edit</button>
    </div>
  `).join('<hr>');
  app.innerHTML = `<h3>Orders</h3>${html}`;
}
function editOrder(id){ alert('Edit Order '+id); }

// === Production Jobs ===
async function showJobs() {
  const jobs = await fetchJSON('/jobs');
  const html = jobs.map(j => `
    <div>#${j.id}: ${j.type} — ${j.status}
      <button class="btn btn-sm btn-outline-secondary mt-1"
              onclick="editJob(${j.id})">Edit</button>
    </div>
  `).join('<hr>');
  app.innerHTML = `<h3>Production Jobs</h3>${html}`;
}
function editJob(id){ alert('Edit Job '+id); }

// === Suppliers ===
async function showSuppliers() {
  const sup = await fetchJSON('/suppliers');
  app.innerHTML = `<h3>Suppliers</h3>` + sup.map(s =>
    `<div>${s.name} (<a href="${s.website}" target="_blank">site</a>)</div>`
  ).join('');
}

// === Catalog ===
async function showCatalog() {
  const items = await fetchJSON('/catalog');
  app.innerHTML = `<h3>Catalog</h3>` + items.map(i =>
    `<div>${i.name} — Cost: $${Number(i.cost).toFixed(2)}</div>`
  ).join('');
}

// === Purchase Orders ===
async function showPurchaseOrders() {
  const pos = await fetchJSON('/purchase-orders');
  app.innerHTML = `<h3>Purchase Orders</h3>` + pos.map(po =>
    `<div>#${po.id}: ${po.status}</div>`
  ).join('');
}

// === Leads ===
async function showLeads() {
  const leads = await fetchJSON('/leads');
  const html = leads.map(l => `
    <div>#${l.id}: ${l.name} — ${l.email} — ${l.phone} — ${l.status}
      <button class="btn btn-sm btn-outline-secondary mt-1"
              onclick="editLead(${l.id})">Edit</button>
    </div>
  `).join('<hr>');
  app.innerHTML = `<h3>CRM: Leads</h3>${html}`;
}
function editLead(id){ alert('Edit Lead '+id); }

// === Deals ===
async function showDeals() {
  const deals = await fetchJSON('/deals');
  const html = deals.map(d => `
    <div>#${d.id}: Lead #${d.lead_id} — Assigned to ${d.assigned_to} — ${d.status}
      <button class="btn btn-sm btn-outline-secondary mt-1"
              onclick="editDeal(${d.id})">Edit</button>
    </div>
  `).join('<hr>');
  app.innerHTML = `<h3>CRM: Deals</h3>${html}`;
}
function editDeal(id){ alert('Edit Deal '+id); }

// === CRM (combined stub) ===
async function showCRM() {
  app.innerHTML = `
    <h3>CRM</h3>
    <p>Use the “Leads” & “Deals” links in the menu to manage your pipeline.</p>
  `;
}

// === HR, Finance, Reports stubs ===
async function showHR()      { app.innerHTML = '<h3>HR</h3><p>…<p>'; }
async function showFinance(){ app.innerHTML = '<h3>Finance</h3><p>…<p>'; }
async function showReports(){ app.innerHTML = '<h3>Reports</h3><p>…<p>'; }

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// initial load
loadAdminView('users');
