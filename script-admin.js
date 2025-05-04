// script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

// helper: fetch JSON or throw
async function fetchJSON(path) {
  const res = await fetch(API_BASE + path, { headers });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.json();
}

// wire nav links
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
      case 'suppliers':       return showSuppliers();
      case 'catalog':         return showCatalog();
      case 'purchaseOrders':  return showPurchaseOrders();
      default:
        app.innerHTML = `<div class="alert alert-warning">Unknown view: ${view}</div>`;
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">Error loading ${view}: ${err.message}</div>`;
  }
}

// --- Suppliers ---
async function showSuppliers() {
  const sup = await fetchJSON('/suppliers');
  const rows = sup.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.website || '—'}</td>
    </tr>
  `).join('');
  app.innerHTML = `
    <h3 class="mb-4">Suppliers</h3>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Name</th><th>Website</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// --- Catalog Items ---
async function showCatalog() {
  const items = await fetchJSON('/catalog');
  const rows = items.map(i => `
    <tr>
      <td>${i.id}</td>
      <td>${i.sku}</td>
      <td>${i.name}</td>
      <td>${i.cost.toFixed(2)}</td>
      <td>${i.currency}</td>
      <td>${i.supplier_name}</td>
    </tr>
  `).join('');
  app.innerHTML = `
    <h3 class="mb-4">Catalog Items</h3>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>SKU</th><th>Name</th><th>Cost</th><th>Currency</th><th>Supplier</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// --- Purchase Orders ---
async function showPurchaseOrders() {
  const pos = await fetchJSON('/purchase-orders');
  const rows = pos.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.supplier_name}</td>
      <td>${p.status}</td>
      <td>${new Date(p.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
  app.innerHTML = `
    <h3 class="mb-4">Purchase Orders</h3>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Supplier</th><th>Status</th><th>Created</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// (Existing views remain unchanged…)

async function showUsers() { /* … */ }
async function showRoles() { /* … */ }
async function showProducts() { /* … */ }
async function showQuotes() { /* … */ }
async function showOrders() { /* … */ }
async function showJobs() { /* … */ }
async function showCRM() { /* … */ }
async function showHR() { /* … */ }
async function showFinance() { /* … */ }
async function showReports() { /* … */ }

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// initial load
loadAdminView('users');
