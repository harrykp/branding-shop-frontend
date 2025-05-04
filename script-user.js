// script-user.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-user');

// helper to GET and parse JSON
async function fetchJSON(path) {
  const res = await fetch(API_BASE + path, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// wire nav
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
      case 'requests':   return showRequests();
      case 'invoices':   return showInvoices();
      case 'complaints': return showComplaints();
      default:            app.innerHTML = '<p>Unknown view</p>';
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

async function showDashboard() {
  app.innerHTML = `
    <h3>Welcome to your Dashboard</h3>
    <p>Use the menu to submit a new order, view invoices, or file complaints.</p>`;
}

async function showRequests() {
  const orders = await fetchJSON('/orders');
  app.innerHTML = `
    <h3>My Requests</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="newRequest()">New Request</button>
    ${orders.map(o => `
      <div class="card mb-2">
        <div class="card-body">
          <strong>#${o.id}</strong> — ${o.status} — $${o.total.toFixed(2)}
        </div>
      </div>`).join('')}
  `;
}

function newRequest() {
  app.innerHTML = `
    <h3>Submit New Order</h3>
    <form onsubmit="submitOrder(event)">
      <div class="mb-3">
        <label class="form-label">Description</label>
        <input id="req-desc" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Quantity</label>
        <input id="req-qty" type="number" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Unit Price</label>
        <input id="req-price" type="number" step="0.01" class="form-control" required>
      </div>
      <button class="btn btn-primary">Submit Order</button>
    </form>
  `;
}

async function submitOrder(e) {
  e.preventDefault();
  const desc  = document.getElementById('req-desc').value;
  const qty   = +document.getElementById('req-qty').value;
  const price = +document.getElementById('req-price').value;
  await fetch(API_BASE + '/orders', {
    method: 'POST',
    headers,
    body: JSON.stringify({ items: [{ description: desc, qty, unit_price: price }] })
  });
  alert('Order submitted!');
  loadUserView('requests');
}

async function showInvoices() {
  const [quotes, payments] = await Promise.all([
    fetchJSON('/quotes'),
    fetchJSON('/payments')
  ]);
  app.innerHTML = `
    <h3>Proforma Invoices</h3>
    ${quotes.map(q => `<div>#${q.id} — $${q.total.toFixed(2)} — ${q.status}</div>`).join('')}
    <h3 class="mt-4">Receipts</h3>
    ${payments.map(p => `<div>#${p.id} — $${p.amount.toFixed(2)} — ${new Date(p.received_at).toLocaleDateString()}</div>`).join('')}
  `;
}

async function showComplaints() {
  const [orders, complaints] = await Promise.all([
    fetchJSON('/orders'),
    fetchJSON('/complaints')
  ]);

  app.innerHTML = `
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
}

async function submitComplaint(e) {
  e.preventDefault();
  const order_id = +document.getElementById('cmp-order').value;
  const complaint_text = document.getElementById('cmp-text').value;
  await fetch(API_BASE + '/complaints', {
    method: 'POST',
    headers,
    body: JSON.stringify({ order_id, complaint_text })
  });
  alert('Complaint filed.');
  loadUserView('complaints');
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// initial view
loadUserView('dashboard');
