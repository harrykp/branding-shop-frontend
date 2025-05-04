const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-user');

// wire nav
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadUserView(el.dataset.view);
  })
);

async function loadUserView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  switch (view) {
    case 'dashboard':  return showDashboard();
    case 'requests':   return showRequests();
    case 'invoices':   return showInvoices();
    case 'complaints': return showComplaints();
    default:            app.innerHTML = `<p>Unknown view</p>`;
  }
}

async function showDashboard() {
  app.innerHTML = `
    <h3>Welcome!</h3>
    <p>Use the menu to submit requests, view invoices, or file complaints.</p>
  `;
}

async function showRequests() {
  const res = await fetch(`${API_BASE}/orders`, { headers });
  const orders = await res.json();
  app.innerHTML = `
    <h3>My Requests</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="newRequest()">New Request</button>
    ${orders.map(o=>`
      <div class="card mb-2">
        <div class="card-body">
          <strong>#${o.id}</strong> — ${o.status} — $${o.total.toFixed(2)}
        </div>
      </div>
    `).join('')}
  `;
}

function newRequest() {
  app.innerHTML = `
    <h3>Submit New Request</h3>
    <form onsubmit="submitRequest(event)">
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
      <button class="btn btn-primary">Submit</button>
    </form>
  `;
}

async function submitRequest(e) {
  e.preventDefault();
  const desc  = document.getElementById('req-desc').value;
  const qty   = +document.getElementById('req-qty').value;
  const price = +document.getElementById('req-price').value;
  const res = await fetch(`${API_BASE}/quotes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ user_id: null, items: [{ description: desc, qty, unit_price: price }] })
  });
  if (!res.ok) return alert('Failed to submit');
  alert('Request submitted!');
  loadUserView('requests');
}

async function showInvoices() {
  const [qs, ps] = await Promise.all([
    fetch(`${API_BASE}/quotes`, { headers }).then(r=>r.json()),
    fetch(`${API_BASE}/payments`, { headers }).then(r=>r.json())
  ]);
  app.innerHTML = `
    <h3>Proforma Invoices</h3>
    ${qs.map(q=>`<div>#${q.id} — $${q.total.toFixed(2)} — ${q.status}</div>`).join('')}

    <h3 class="mt-4">Receipts</h3>
    ${ps.map(p=>`<div>#${p.id} — $${p.amount.toFixed(2)} — ${new Date(p.received_at).toLocaleDateString()}</div>`).join('')}
  `;
}

async function showComplaints() {
  const [orders, complaints] = await Promise.all([
    fetch(`${API_BASE}/orders`, { headers }).then(r=>r.json()),
    fetch(`${API_BASE}/complaints`, { headers }).then(r=>r.json())
  ]);

  app.innerHTML = `
    <h3>My Complaints</h3>
    ${complaints.map(c=>`
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
          ${orders.map(o=>`<option value="${o.id}">#${o.id} — ${o.status}</option>`).join('')}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Complaint</label>
        <textarea id="cmp-text" class="form-control" required></textarea>
      </div>
      <button class="btn btn-danger">Submit</button>
    </form>
  `;
}

async function submitComplaint(e) {
  e.preventDefault();
  const order_id = +document.getElementById('cmp-order').value;
  const complaint_text = document.getElementById('cmp-text').value;
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ order_id, complaint_text })
  });
  if (!res.ok) return alert('Failed to submit');
  alert('Complaint filed.');
  loadUserView('complaints');
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// kick off
loadUserView('dashboard');
