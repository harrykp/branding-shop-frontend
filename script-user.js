// script-user.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-user');
const quoteResults = document.getElementById('quote-results');

// --- fetch helper ---
async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  const text = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// --- wire nav clicks ---
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadUserView(el.dataset.view);
  })
);

// --- quick button for quotes ---
document.getElementById('btn-new-quote')
  .addEventListener('click', () => loadUserView('quotes'));

// --- main loader ---
async function loadUserView(view) {
  quoteResults.innerHTML = '';       // clear any old quote result
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  try {
    switch (view) {
      case 'dashboard':  return showDashboard();
      case 'quotes':     return showQuotes();
      case 'requests':   return showRequests();
      case 'invoices':   return showInvoices();
      case 'complaints': return showComplaints();
      default:            app.innerHTML = '<p>Unknown view</p>';
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

// --- Dashboard ---
function showDashboard() {
  app.innerHTML = `
    <h3>Welcome to your Dashboard</h3>
    <p>Use the menu to request a quote, submit orders, view invoices, or file complaints.</p>`;
}

// --- Request Quote ---
async function showQuotes() {
  // fetch all categories
  const cats = await fetchJSON('/product-categories');
  app.innerHTML = `
    <h3>Request a Quote</h3>
    <form id="frm-quote">
      <div class="mb-3">
        <label class="form-label">Decoration Type</label>
        <select id="q_cat" class="form-select" required>
          <option value="">Select type…</option>
          ${cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Quantity</label>
        <input id="q_qty" type="number" class="form-control" min="1" value="1" required>
      </div>
      <button class="btn btn-primary">Get Quote</button>
    </form>
  `;
  document.getElementById('frm-quote').onsubmit = submitQuote;
}

async function submitQuote(e) {
  e.preventDefault();
  const cat = +document.getElementById('q_cat').value;
  const qty = +document.getElementById('q_qty').value;
  try {
    const q = await fetchJSON('/quotes', {
      method: 'POST',
      body: JSON.stringify({ product_category_id: cat, quantity: qty })
    });
    quoteResults.innerHTML = `
      <div class="alert alert-success">
        Quote #${q.id} — <strong>$${parseFloat(q.total).toFixed(2)}</strong> (status: ${q.status})
      </div>
    `;
    loadUserView('requests');
  } catch (err) {
    quoteResults.innerHTML = `<div class="alert alert-danger">Quote request failed: ${err.message}</div>`;
  }
}

// --- My Requests (Orders) ---
async function showRequests() {
  const orders = await fetchJSON('/orders');
  app.innerHTML = `
    <h3>My Orders</h3>
    ${orders.map(o => `
      <div class="card mb-2">
        <div class="card-body">
          <strong>#${o.id}</strong> — ${o.status} — $${parseFloat(o.total).toFixed(2)}
        </div>
      </div>`).join('')}
  `;
}

// --- Invoices & Receipts ---
async function showInvoices() {
  const [quotes, payments] = await Promise.all([
    fetchJSON('/quotes'),
    fetchJSON('/payments')
  ]);
  app.innerHTML = `
    <h3>Proforma Invoices</h3>
    ${quotes.map(q => `<div>#${q.id} — $${parseFloat(q.total).toFixed(2)} — ${q.status}</div>`).join('')}
    <h3 class="mt-4">Receipts</h3>
    ${payments.map(p => `<div>#${p.id} — $${parseFloat(p.amount).toFixed(2)} — ${new Date(p.received_at).toLocaleDateString()}</div>`).join('')}
  `;
}

// --- Complaints ---
async function showComplaints() {
  const [orders, complaints] = await Promise.all([
    fetchJSON('/orders'),
    fetchJSON('/complaints')
  ]);

  app.innerHTML = `
    <h3>My Complaints</h3>
    ${complaints.map(c => `
      <div class="card mb-2">
        <div class="card-body">
          Complaint #${c.id} on Order ${c.order_id}: ${c.complaint_text}
          <br><small>${new Date(c.created_at).toLocaleString()}</small>
        </div>
      </div>`).join('')}

    <h4 class="mt-4">File a Complaint</h4>
    <form id="frm-complaint">
      <div class="mb-3">
        <label class="form-label">Order</label>
        <select id="cmp-order" class="form-select" required>
          ${orders.map(o => `<option value="${o.id}">#${o.id} — ${o.status}</option>`).join('')}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Complaint</label>
        <textarea id="cmp-text" class="form-control" required></textarea>
      </div>
      <button class="btn btn-danger">Submit Complaint</button>
    </form>
  `;
  document.getElementById('frm-complaint').onsubmit = submitComplaint;
}

async function submitComplaint(e) {
  e.preventDefault();
  const order_id = +document.getElementById('cmp-order').value;
  const complaint_text = document.getElementById('cmp-text').value;
  await fetchJSON('/complaints', {
    method: 'POST',
    body: JSON.stringify({ order_id, complaint_text })
  });
  alert('Complaint filed.');
  loadUserView('complaints');
}

// --- Logout ---
function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// --- kick off ---
loadUserView('dashboard');
