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

// wire up nav clicks
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadUserView(el.dataset.view);
  })
);

async function loadUserView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  try {
    switch (view) {
      case 'dashboard':  return showDashboard();
      case 'quotes':     return showQuotes();
      case 'requests':   return showRequests();
      case 'invoices':   return showInvoices();
      case 'complaints': return showComplaints();
      default:
        app.innerHTML = '<p>Unknown view</p>';
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
async function showDashboard() {
  app.innerHTML = `
    <h3>Welcome to your Dashboard</h3>
    <p>Use the menu to request a quote, view orders/invoices, or file complaints.</p>
  `;
}

// ─── Quotes (new) ───────────────────────────────────────────────────────────
async function showQuotes() {
  // 1) get product list
  const products = await fetchJSON('/products');
  // 2) render form
  app.innerHTML = `
    <h3>Request a Quote</h3>
    <form id="frm-quote">
      <div class="mb-3">
        <label class="form-label">Product</label>
        <select id="q_product" class="form-select" required>
          <option value="">— select —</option>
          ${products.map(p =>
            `<option value="${p.id}">
               ${p.name} (${p.sku}) — $${parseFloat(p.price).toFixed(2)} / ${p.usage_unit||'unit'}
             </option>`
          ).join('')}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Quantity</label>
        <input id="q_qty" type="number" class="form-control" min="1" value="1" required>
      </div>
      <button class="btn btn-primary">Get Quote</button>
    </form>

    <div id="quote-result" class="mt-4"></div>
  `;

  document.getElementById('frm-quote').onsubmit = async e => {
    e.preventDefault();
    const product_id = +document.getElementById('q_product').value;
    const quantity   = +document.getElementById('q_qty').value;
    try {
      const quote = await fetchJSON('/quotes', {
        method: 'POST',
        body: JSON.stringify({ product_id, quantity })
      });
      document.getElementById('quote-result').innerHTML = `
        <div class="alert alert-success">
          Quote #${quote.id}: 
          Unit Price $${parseFloat(quote.unit_price).toFixed(2)}, 
          Total $${parseFloat(quote.total).toFixed(2)},
          Status: ${quote.status}
        </div>
      `;
    } catch (err) {
      document.getElementById('quote-result').innerHTML = `
        <div class="alert alert-danger">Failed to get quote: ${err.message}</div>
      `;
    }
  };
}

// ─── My Orders (requests) ───────────────────────────────────────────────────
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
    <h3>Submit New Order</h3>
    <form onsubmit="submitOrder(event)">
      <div class="mb-3">
        <label class="form-label">Quote ID</label>
        <input id="ord-quote" type="number" class="form-control" required>
      </div>
      <button class="btn btn-primary">Convert to Order</button>
    </form>
  `;
}
async function submitOrder(e) {
  e.preventDefault();
  const quote_id = +document.getElementById('ord-quote').value;
  await fetchJSON('/orders', {
    method: 'POST',
    body: JSON.stringify({ quote_id })
  });
  alert('Order created!');
  loadUserView('requests');
}

// ─── Invoices & Payments ───────────────────────────────────────────────────
async function showInvoices() {
  const [orders, payments] = await Promise.all([
    fetchJSON('/orders'),
    fetchJSON('/payments')
  ]);

  let html = `
    <h3>Invoices</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>ID</th><th>Total</th><th>Status</th><th>Action</th>
      </tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>#${o.id}</td>
            <td>$${parseFloat(o.total).toFixed(2)}</td>
            <td>${o.status}</td>
            <td>
              ${o.payment_status === 'pending'
                ? `<button class="btn btn-sm btn-primary"
                            onclick="payOrder(${o.id},${o.total})">
                      Pay
                   </button>`
                : 'Paid'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3 class="mt-4">Receipts</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>ID</th><th>Order</th><th>Amount</th><th>Date</th>
      </tr></thead>
      <tbody>
        ${payments.map(p => `
          <tr>
            <td>#${p.id}</td>
            <td>#${p.order_id}</td>
            <td>$${parseFloat(p.amount).toFixed(2)}</td>
            <td>${new Date(p.paid_at||p.received_at).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  app.innerHTML = html;
}

async function payOrder(order_id, total) {
  const amount  = prompt(`Amount for Order #${order_id}`, total);
  if (!amount) return;
  const gateway = prompt('Payment gateway (e.g. Momo, PayPal)');
  if (!gateway) return;

  try {
    await fetchJSON('/payments', {
      method: 'POST',
      body: JSON.stringify({ order_id, amount: +amount, gateway })
    });
    alert('Payment successful!');
    loadUserView('invoices');
  } catch (err) {
    alert('Payment failed: ' + err.message);
  }
}

// ─── Complaints ─────────────────────────────────────────────────────────────
async function showComplaints() {
  const [orders, complaints] = await Promise.all([
    fetchJSON('/orders'),
    fetchJSON('/complaints')
  ]);

  let html = `
    <h3>My Complaints</h3>
    ${complaints.map(c => `
      <div class="card mb-2">
        <div class="card-body">
          #${c.id} on Order ${c.order_id}: ${c.complaint_text}
          <br><small>${new Date(c.created_at).toLocaleString()}</small>
        </div>
      </div>
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
  await fetchJSON('/complaints', {
    method: 'POST',
    body: JSON.stringify({
      order_id: +document.getElementById('cmp-order').value,
      complaint_text: document.getElementById('cmp-text').value
    })
  });
  alert('Complaint filed.');
  loadUserView('complaints');
}

// ─── Logout & kick off ──────────────────────────────────────────────────────
function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}
loadUserView('dashboard');
