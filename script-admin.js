// script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

// helper to GET & parse JSON
async function fetchJSON(path) {
  const res = await fetch(API_BASE + path, { headers });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

// wire up nav links
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

// main loader
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
          <label for="roles-${u.id}">Role:</label>
          <select id="roles-${u.id}" class="form-select form-select-sm">
            ${allRoles.map(r =>
              `<option value="${r.id}" ${assigned.includes(r.name)?'selected':''}>${r.name}</option>`
            ).join('')}
          </select>
          <button class="btn btn-sm btn-primary mt-2"
            onclick="updateUserRole(${u.id})">Update Role</button>
        </div>
      </div>
    `;
  }).join('');
  app.innerHTML = `<h3>Manage Users & Roles</h3>${html}`;
}
async function updateUserRole(id) {
  const roleId = document.getElementById(`roles-${id}`).value;
  await fetch(`${API_BASE}/users/${id}/roles`, {
    method: 'PATCH', headers, body: JSON.stringify({ roles: [roleId] })
  });
  alert('Role updated.');
}

// === Roles CRUD Stub ===
async function showRoles() {
  const roles = await fetchJSON('/roles');
  const html = roles.map(r => `
    <div class="card mb-2 p-3">
      <strong>${r.name}</strong>
      <button class="btn btn-sm btn-outline-secondary ms-2"
        onclick="editRole(${r.id})">Edit</button>
      <button class="btn btn-sm btn-outline-danger ms-1"
        onclick="deleteRole(${r.id})">Delete</button>
    </div>
  `).join('');
  app.innerHTML = `
    <h3>Roles</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="newRole()">New Role</button>
    ${html}
  `;
}
function newRole()    { alert('Create new role'); }
function editRole(id) { alert('Edit role '+id); }
function deleteRole(id){ if(confirm('Delete role?')) alert('Deleted '+id); }

// === Products ===
async function showProducts() {
  const cats  = await fetchJSON('/product-categories');
  const prods = await fetchJSON('/products');
  const html = prods.map(p => {
    const cat = cats.find(c=>c.id===p.category_id);
    return `
      <div class="card mb-2 p-3">
        <strong>${p.name}</strong><br>
        Category: ${cat?.name||'—'}<br>
        Price: $${Number(p.price).toFixed(2)}<br>
        <button class="btn btn-sm btn-outline-secondary mt-2"
          onclick="editProduct(${p.id})">Edit</button>
      </div>`;
  }).join('');
  app.innerHTML = `<h3>Products</h3>${html}`;
}
function editProduct(id){ alert('Edit Product '+id); }

// === Quotes ===
async function showQuotes() {
  const qs = await fetchJSON('/quotes');
  const html = qs.map(q => `
    <div>#${q.id}: ${q.category_name}×${q.quantity} @ $${Number(q.unit_price).toFixed(2)} = $${Number(q.total).toFixed(2)}
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
  const os = await fetchJSON('/orders');
  const html = os.map(o => `
    <div>#${o.id}: $${Number(o.total).toFixed(2)} — ${o.status}
      <button class="btn btn-sm btn-outline-secondary mt-1"
        onclick="editOrder(${o.id})">Edit</button>
    </div>
  `).join('<hr>');
  app.innerHTML = `<h3>Orders</h3>${html}`;
}
function editOrder(id){ alert('Edit Order '+id); }

// === Production ===
async function showJobs() {
  const js = await fetchJSON('/jobs');
  const html = js.map(j => `
    <div>#${j.id}: ${j.type} — ${j.status}
      <button class="btn btn-sm btn-outline-secondary mt-1"
        onclick="editJob(${j.id})">Edit</button>
    </div>
  `).join('<hr>');
  app.innerHTML = `<h3>Production Jobs</h3>${html}`;
}
function editJob(id){ alert('Edit Job '+id); }

// === Suppliers, Catalog, Purchase Orders ===
async function showSuppliers() {
  const s = await fetchJSON('/suppliers');
  app.innerHTML = `<h3>Suppliers</h3>${s.map(x=>`<div>${x.name} (<a href="${x.website}" target="_blank">site</a>)</div>`).join('')}`;
}
async function showCatalog() {
  const c = await fetchJSON('/catalog');
  app.innerHTML = `<h3>Catalog</h3>${c.map(x=>`<div>${x.name} — $${Number(x.cost).toFixed(2)}</div>`).join('')}`;
}
async function showPurchaseOrders() {
  const po = await fetchJSON('/purchase-orders');
  app.innerHTML = `<h3>Purchase Orders</h3>${po.map(x=>`<div>#${x.id} — ${x.status}</div>`).join('')}`;
}

// === CRM: Leads & Deals ===
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

// === CRM Home, HR, Finance, Reports stubs ===
async function showCRM()     { app.innerHTML = '<h3>CRM Home</h3><p>Use Leads/Deals above.</p>'; }
async function showHR()      { app.innerHTML = '<h3>HR</h3><p>…</p>'; }
async function showFinance(){ app.innerHTML = '<h3>Finance</h3><p>…</p>'; }
async function showReports(){ app.innerHTML = '<h3>Reports</h3><p>…</p>'; }

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// initial load
loadAdminView('users');
