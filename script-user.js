// branding-shop-frontend/script-user.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

const app = document.getElementById('app-user');

// Helper to perform authenticated fetch and parse JSON
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

// "+ Request Quote" button
const newQuoteBtn = document.getElementById('btn-new-quote');
if (newQuoteBtn) newQuoteBtn.addEventListener('click', () => newQuote());

// Load the specified view
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
    <p>Use the menu to request quotes, view invoices, place orders, or file complaints.</p>
  `;
}

// My Quotes
async function showQuotes() {
  const quotes = await fetchJSON('/quotes');
  app.innerHTML = `
    <h3>My Quotes</h3>
    <button class="btn btn-primary mb-3" onclick="newQuote()">+ Request Quote</button>
    ${quotes.map(q => `
      <div class="card mb-2">
        <div class="card-body">
          <strong>#${q.id}</strong>
          — ${q.product_name}
          — qty ${q.quantity}
          — GHS ${parseFloat(q.total).toFixed(2)}
          — ${q.status}
          ${q.status === 'pending'
            ? `<button class="btn btn-sm btn-success ms-2" onclick="submitOrderFromQuote(${q.id})">
                 Convert to Order
               </button>`
            : ''}
        </div>
      </div>
    `).join('')}
  `;
}

// New Quote Form
async function newQuote() {
  const categories = await fetchJSON('/product-categories');
  app.innerHTML = `
    <h3>Request a New Quote</h3>
    <form id="form-quote">
      <div class="mb-3">
        <label class="form-label">Category</label>
        <select id="category-select" class="form-select" required>
          <option value="">Choose category…</option>
          ${categories.map(c => `
            <option value="${c.id}">${c.name}</option>
          `).join('')}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Product</label>
        <select id="product-select" class="form-select" required disabled>
          <option value="">Select category first</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Quantity</label>
        <input type="number" id="quantity-input" class="form-control" min="1" value="1" required>
      </div>
      <div class="mb-3">
        <p>
          <strong>Unit Price:</strong> GHS <span id="unit-price-display">0.00</span><br>
          <strong>Total Price:</strong> GHS <span id="total-price-display">0.00</span>
        </p>
      </div>
      <button type="submit" class="btn btn-primary">Submit Quote</button>
    </form>
  `;

  const catSel = document.getElementById('category-select');
  const prodSel = document.getElementById('product-select');
  const qtyInp = document.getElementById('quantity-input');

  catSel.addEventListener('change', async e => {
    const cid = e.target.value;
    if (!cid) {
      prodSel.innerHTML = `<option value="">Select category first</option>`;
      prodSel.disabled = true;
      calculatePrice();
      return;
    }
    const prods = await fetchJSON(`/products?category_id=${cid}`);
    prodSel.innerHTML = `
      <option value="">Choose product…</option>
      ${prods.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
    `;
    prodSel.disabled = false;
    calculatePrice();
  });

  prodSel.addEventListener('change', calculatePrice);
  qtyInp.addEventListener('input', calculatePrice);
  document.getElementById('form-quote').addEventListener('submit', submitQuote);

  calculatePrice();
}

// Calculate & submit quote
async function calculatePrice() {
  const pid = +document.getElementById('product-select').value;
  const qty = +document.getElementById('quantity-input').value;
  if (!pid) {
    document.getElementById('unit-price-display').textContent = '0.00';
    document.getElementById('total-price-display').textContent = '0.00';
    return;
  }
  const res = await fetchJSON(`/pricing-rules/calc?product_id=${pid}&quantity=${qty}`);
  document.getElementById('unit-price-display').textContent = parseFloat(res.unit_price).toFixed(2);
  document.getElementById('total-price-display').textContent = parseFloat(res.total).toFixed(2);
}

async function submitQuote(e) {
  e.preventDefault();
  const payload = {
    product_id: +document.getElementById('product-select').value,
    quantity:   +document.getElementById('quantity-input').value
  };
  try {
    await fetchJSON('/quotes', { method: 'POST', body: JSON.stringify(payload) });
    alert('Quote submitted!');
    showQuotes();
  } catch (err) {
    alert('Failed to submit quote: ' + err.message);
  }
}

// Convert Quote → Order
function submitOrderFromQuote(quoteId) {
  if (!confirm(`Convert quote #${quoteId} into an order?`)) return;
  fetchJSON('/orders', {
    method: 'POST',
    body: JSON.stringify({ quote_id: quoteId })
  })
  .then(order => {
    alert(`Order #${order.id} created!`);
    loadUserView('requests');
  })
  .catch(err => alert('Conversion failed: ' + err.message));
}

// My Orders
async function showRequests() {
  const orders = await fetchJSON('/orders');
  app.innerHTML = `
    <h3>My Orders</h3>
    <button class="btn btn-sm btn-success mb-3" onclick="newOrder()">New Order</button>
    ${orders.map(o => `
      <div class="card mb-2">
        <div class="card-body">
          <strong>#${o.id}</strong> — ${o.status} — GHS ${parseFloat(o.total).toFixed(2)}
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
  try {
    await fetchJSON('/orders', { method: 'POST', body: JSON.stringify({ quote_id }) });
    alert('Order created!');
    loadUserView('requests');
  } catch (err) {
    alert('Order creation failed: ' + err.message);
  }
}

// Invoices & Payments
async function showInvoices() {
  const [orders, payments] = await Promise.all([
    fetchJSON('/orders'),
    fetchJSON('/payments')
  ]);
  app.innerHTML = `
    <h3>Invoices</h3>
    <table class="table table-striped">
      <thead><tr>
        <th>ID</th><th>Total</th><th>Payment Status</th><th>Action</th>
      </tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>#${o.id}</td>
            <td>GHS ${parseFloat(o.total).toFixed(2)}</td>
            <td>${o.payment_status}</td>
            <td>${
              o.payment_status === 'pending'
                ? `<button class="btn btn-sm btn-primary"
                            onclick="payOrder(${o.id},${o.total})">Pay</button>`
                : 'Paid'
            }</td>
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
            <td>GHS ${parseFloat(p.amount).toFixed(2)}</td>
            <td>${new Date(p.paid_at).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function payOrder(order_id, total) {
  const amount = prompt(`Amount for Order #${order_id}`, total);
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

// Complaints
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
          #${c.id} on Order ${c.order_id}: ${c.complaint_text}<br>
          <small>${new Date(c.created_at).toLocaleString()}</small>
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
}

async function submitComplaint(e) {
  e.preventDefault();
  const payload = {
    order_id: +document.getElementById('cmp-order').value,
    complaint_text: document.getElementById('cmp-text').value
  };
  try {
    await fetchJSON('/complaints', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    alert('Complaint filed.');
    loadUserView('complaints');
  } catch (err) {
    alert('Failed to file complaint: ' + err.message);
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// Initial view
loadUserView('dashboard');
