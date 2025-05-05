// script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

const app = document.getElementById('app-admin');

// Enhanced fetchJSON with logging and error details
async function fetchJSON(path, opts = {}) {
  const url = API_BASE + path;
  console.log('[fetchJSON] →', url, opts);
  try {
    const res = await fetch(url, { headers, ...opts });
    console.log(`[fetchJSON] ← ${url} status=${res.status}`);
    if (!res.ok) {
      const text = await res.text();
      console.error(`[fetchJSON] !!!! ${url} error response:`, text);
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const data = await res.json();
    console.log(`[fetchJSON] ✓ ${url} data:`, data);
    return data;
  } catch (err) {
    console.error(`[fetchJSON] ✗ Network or CORS error on ${url}:`, err);
    throw err;
  }
}

// Wire up nav links
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadView(el.dataset.view);
  })
);

async function loadView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  try {
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
      case 'reports':         return reportsView();
      case 'suppliers':       return suppliersView();
      case 'catalog':         return catalogView();
      case 'purchaseOrders':  return purchaseOrdersView();
      default:
        app.innerHTML = `<div class="alert alert-warning">Unknown view: ${view}</div>`;
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">Error loading ${view}: ${err.message}</div>`;
  }
}

// — USERS —
// ... (rest of your CRUD functions unchanged) ...

// — CRM — Leads
async function leadsView() {
  console.log('[leadsView] fetching /leads');
  const leads = await fetchJSON('/leads');
  app.innerHTML = `
    <h3>Leads</h3>
    ${leads.map(l => `
      <div class="card p-2 mb-2">
        ${l.name} (${l.email}) — ${l.status}
        <button class="btn btn-sm btn-danger float-end" onclick="deleteLead(${l.id})">Delete</button>
      </div>
    `).join('')}
    <button class="btn btn-success" onclick="createLead()">+ Add Lead</button>
  `;
}

// ... (all your other view functions) ...

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// Initial load
loadView('users');
