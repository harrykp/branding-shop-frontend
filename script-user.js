// branding-shop-frontend/script-user.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-user');

// Generic fetch + JSON
async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

// Wire navigation links
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadUserView(el.dataset.view);
  })
);

// Main view loader
async function loadUserView(view) {
  app.innerHTML = `<h3 class="text-muted">Loading ${view}…</h3>`;
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
function showDashboard() {
  app.innerHTML = `
    <h3>Welcome to your Dashboard</h3>
    <p>Use the menu to request quotes, view orders, invoices, or file complaints.</p>
  `;
}

// Quotes: request form + listing
async function showQuotes() {
  const [categories, quotes] = await Promise.all([
    fetchJSON('/product_categories'),
    fetchJSON('/quotes')
  ]);

  const opts = categories
    .map(c => `<option value="${c.id}">${c.name}</option>`)
    .join('');

  app.innerHTML = `
    <h3>Request a Quote</h3>
    <form id="frm-quote" class="mb-4">
      <div class="mb-3">
        <label class="form-label">Category</label>
        <select id="q_cat" class="form-select" required>
          ${opts}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Quantity</label>
        <input id="q_qty" type="number" class="form-control" min="1" value="1" required>
      </div>
      <button class="btn btn-primary">Submit Quote</button>
    </form>
    <h3>My Quotes</h3>
    ${quotes.length
      ? quotes.map(q => `
        <div class="card mb-2">
          <div class="card-body">
            <strong>#${q.id}</strong> — ${q.category_name}
            — Qty: ${q.quantity} — $${parseFloat(q.total).toFixed(2)}
            — <em>${q.status}</em>
          </div>
        </div>
      `).join('')
      : `<p class="text-muted">No quotes yet.</p>`
    }
  `;

  document.getElementById('frm-quote')
          .addEventListener('submit', submitQuote);
}

async function submitQuote(e) {
  e.preventDefault();
  const product_category_id = +document.getElementById('q_cat').value;
  const quantity            = +document.getElementById('q_qty').value;
  try {
    await fetchJSON('/quotes', {
      method: 'POST',
      body: JSON.stringify({ product_category_id, quantity })
    });
    alert('Quote submitted!');
    loadUserView('quotes');
  } catch (err) {
    alert(`Quote request failed: ${err.message}`);
  }
}

// Requests → orders list
async function showRequests() {
  const orders = await fetchJSON('/orders');
  app.innerHTML = `
    <h3>My Orders</h3>
    ${orders.length
      ? orders.map(o => `
        <div class="card mb-2">
          <div class="card-body">
            <strong>#${o.id}</strong> — $${parseFloat(o.total).toFixed(2)}
            — <em>${o.status}</em>
          </div>
        </div>
      `).join('')
      : `<p class="text-muted">No orders yet.</p>`
    }
  `;
}

// Invoices → quotes & payments
async function showInvoices() {
  const [quotes, payments] = await Promise.all([
    fetchJSON('/quotes'),
    fetchJSON('/payments')
  ]);

  app.innerHTML = `
    <h3>Proforma Invoices</h3>
    ${quotes.length
      ? quotes.map(q => `<div>#${q.id} — $${parseFloat(q.total).toFixed(2)} — ${q.status}</div>`).join('')
      : `<p class="text-muted">No proforma invoices yet.</p>`
    }
    <h3 class="mt-4">Payments Received</h3>
    ${payments.length
      ? payments.map(p => `<div>#${p.id} — $${parseFloat(p.amount).toFixed(2)} — ${new Date(p.paid_at||p.received_at).toLocaleDateString()}</div>`).join('')
      : `<p class="text-muted">No payments recorded yet.</p>`
    }
  `;
}

// Complaints → list + file form
async function showComplaints() {
  const [orders, complaints] = await Promise.all([
    fetchJSON('/orders'),
    fetchJSON('/complaints')
  ]);

  app.innerHTML = `
    <h3>My Complaints</h3>
    ${complaints.length
      ? complaints.map(c => `
        <div class="card mb-2">
          <div class="card-body">
            Complaint #${c.id} on Order ${c.order_id}:<br>
            ${c.complaint_text}<br>
            <small>${new Date(c.created_at).toLocaleString()}</small>
          </div>
        </div>
      `).join('')
      : `<p class="text-muted">No complaints filed.</p>`
    }
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

  document.getElementById('frm-complaint')
          .addEventListener('submit', submitComplaint);
}

async function submitComplaint(e) {
  e.preventDefault();
  const order_id       = +document.getElementById('cmp-order').value;
  const complaint_text = document.getElementById('cmp-text').value;
  try {
    await fetchJSON('/complaints', {
      method: 'POST',
      body: JSON.stringify({ order_id, complaint_text })
    });
    alert('Complaint filed.');
    loadUserView('complaints');
  } catch (err) {
    alert(`Failed to file complaint: ${err.message}`);
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// Kick things off
loadUserView('dashboard');
