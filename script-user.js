// branding-shop-frontend/script-user.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-user');

async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

// wire nav
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadUserView(el.dataset.view);
  })
);

// main loader
async function loadUserView(view) {
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

// Dashboard
async function showDashboard() {
  app.innerHTML = `
    <h3>Welcome to your Dashboard</h3>
    <p>Use the menu to request quotes, place orders, view invoices, or file complaints.</p>
  `;
}

// === Quotes (Request & List) ===
async function showQuotes() {
  // fetch categories & existing quotes in parallel
  const [categories, quotes] = await Promise.all([
    fetchJSON('/product-categories'),
    fetchJSON('/quotes')
  ]);

  let html = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Request a Quote</h3>
      <button class="btn btn-success" onclick="renderQuoteForm()">+ New Quote</button>
    </div>
    <div id="quote-form-container"></div>
    <h4 class="mt-4">My Quotes</h4>
    <table class="table table-striped">
      <thead>
        <tr><th>ID</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Status</th><th>When</th></tr>
      </thead>
      <tbody>
        ${quotes.map(q => `
          <tr>
            <td>#${q.id}</td>
            <td>${q.category_name}</td>
            <td>${q.quantity}</td>
            <td>$${parseFloat(q.unit_price).toFixed(2)}</td>
            <td>$${parseFloat(q.total).toFixed(2)}</td>
            <td>${q.status}</td>
            <td>${new Date(q.created_at).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  app.innerHTML = html;

  // store categories in a closure
  app._categories = categories;
}

function renderQuoteForm() {
  const cats = app._categories || [];
  const options = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  document.getElementById('quote-form-container').innerHTML = `
    <form id="frm-quote" class="card p-3 mb-4">
      <div class="mb-3">
        <label class="form-label">Product Category</label>
        <select id="q-category" class="form-select" required>
          ${options}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Quantity</label>
        <input id="q-qty" type="number" class="form-control" min="1" value="1" required>
      </div>
      <button class="btn btn-primary">Submit Quote Request</button>
    </form>
  `;
  document.getElementById('frm-quote').onsubmit = submitQuote;
}

async function submitQuote(e) {
  e.preventDefault();
  const categoryId = +document.getElementById('q-category').value;
  const quantity   = +document.getElementById('q-qty').value;

  try {
    await fetchJSON('/quotes', {
      method: 'POST',
      body: JSON.stringify({ product_category_id: categoryId, quantity })
    });
    alert('Quote requested!');
    loadUserView('quotes');
  } catch (err) {
    alert('Quote request failed: ' + err.message);
  }
}

// === Orders (My Orders) ===
async function showRequests() {
  const orders = await fetchJSON('/orders');
  app.innerHTML = `
    <h3>My Orders</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="newOrder()">New Order</button>
    ${orders.map(o => `
      <div class="card mb-2">
        <div class="card-body">
          <strong>#${o.id}</strong> — ${o.status} — $${parseFloat(o.total).toFixed(2)}
        </div>
      </div>
    `).join('')}
  `;
}
function newOrder() {
  app.innerHTML = `
    <h3>Convert Quote to Order</h3>
    <form onsubmit="submitOrder(event)">
      <div class="mb-3">
        <label class="form-label">Quote ID</label>
        <input id="ord-quote" type="number" class="form-control" required>
      </div>
      <button class="btn btn-primary">Create Order</button>
    </form>
  `;
}
async function submitOrder(e) {
  e.preventDefault();
  const quote_id = +document.getElementById('ord-quote').value;
  await fetchJSON('/orders', { method: 'POST', body: JSON.stringify({ quote_id }) });
  alert('Order created!');
  loadUserView('requests');
}

// === Invoices & Payments ===
async function showInvoices() {
  const [orders, payments] = await Promise.all([
    fetchJSON('/orders'),
    fetchJSON('/payments')
  ]);

  let html = `
    <h3>Invoices</h3>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>#${o.id}</td>
            <td>$${parseFloat(o.total).toFixed(2)}</td>
            <td>${o.payment_status}</td>
            <td>
              ${o.payment_status === 'pending'
                ? `<button class="btn btn-sm btn-primary" onclick="payOrder(${o.id},${o.total})">Pay</button>`
                : 'Paid'
              }
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3 class="mt-4">Receipts</h3>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Order</th><th>Amount</th><th>Date</th></tr></thead>
      <tbody>
        ${payments.map(p => `
          <tr>
            <td>#${p.id}</td>
            <td>#${p.order_id}</td>
            <td>$${parseFloat(p.amount).toFixed(2)}</td>
            <td>${new Date(p.paid_at || p.received_at).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  app.innerHTML = html;
}

async function payOrder(order_id, total) {
  const amount = prompt(`Amount for Order #${order_id}`, total);
  if (!amount) return;
  const gateway = prompt('Payment gateway?');
  if (!gateway) return;

  try {
    await fetchJSON('/payments', {
      method: 'POST',
      body: JSON.stringify({ order_id, amount: parseFloat(amount), gateway })
    });
    alert('Payment successful!');
    loadUserView('invoices');
  } catch (err) {
    alert('Payment failed: ' + err.message);
  }
}

// === Complaints ===
async function showComplaints() {
  const [orders, complaints] = await Promise.all([
    fetchJSON('/orders'),
    fetchJSON('/complaints')
  ]);

  let html = `
    <h3>My Complaints</h3>
    ${complaints.map(c => `
      <div class="card mb-2"><div class="card-body">
        #${c.id} on Order ${c.order_id}: ${c.complaint_text}
        <br><small>${new Date(c.created_at).toLocaleString()}</small>
      </div></div>
    `).join('')}

    <h4 class="mt-4">File a Complaint</h4>
    <form onsubmit="submitComplaint(event)">
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
  app.innerHTML = html;
}

async function submitComplaint(e) {
  e.preventDefault();
  const order_id      = +document.getElementById('cmp-order').value;
  const complaint_text = document.getElementById('cmp-text').value;
  await fetchJSON('/complaints', {
    method: 'POST',
    body: JSON.stringify({ order_id, complaint_text })
  });
  alert('Complaint filed.');
  loadUserView('complaints');
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// kick things off
loadUserView('dashboard');
