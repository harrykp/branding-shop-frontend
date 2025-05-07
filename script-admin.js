// branding-shop-frontend/script-admin.js
console.log('🔥 script-admin.js v4 loaded – Products & Quotes full CRUD with edit form');

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

async function loadAdminView(view) {
  console.log('🔄 Loading view:', view);
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  try {
    switch (view) {
      case 'users':          return showUsers();
      case 'roles':          return showRoles();
      case 'products':       return showProducts();
      case 'quotes':         return showQuotes();
      // ... other stubs ...
      default:
        app.innerHTML = `<div class="alert alert-warning">Unknown view: ${view}</div>`;
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">Error loading ${view}: ${err.message}</div>`;
  }
}

// ===== PRODUCTS CRUD (unchanged) =====
// ... (same as v3) ...

// ===== QUOTES CRUD w/ EDIT FORM =====

async function showQuotes() {
  const quotes = await fetchJSON('/quotes');
  const rows = quotes.map(q => `
    <tr>
      <td>${q.id}</td>
      <td>${q.customer_name}</td>
      <td>${q.category_name}</td>
      <td>${q.quantity}</td>
      <td>$${Number(q.unit_price).toFixed(2)}</td>
      <td>$${Number(q.total).toFixed(2)}</td>
      <td>${q.status}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary me-1"
                onclick="editQuoteForm(${q.id})">Edit</button>
        <button class="btn btn-sm btn-outline-danger"
                onclick="deleteQuote(${q.id})">Delete</button>
      </td>
    </tr>
  `).join('');

  app.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Quotes</h3>
      <button class="btn btn-success" onclick="newQuoteForm()">+ New Quote</button>
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th><th>Customer</th><th>Category</th>
          <th>Qty</th><th>Unit Price</th><th>Total</th>
          <th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function newQuoteForm() {
  const [cats, users] = await Promise.all([
    fetchJSON('/product-categories'),
    fetchJSON('/users')
  ]);
  renderQuoteForm(cats, users);
}

async function editQuoteForm(id) {
  const [cats, users, quote] = await Promise.all([
    fetchJSON('/product-categories'),
    fetchJSON('/users'),
    fetchJSON(`/quotes/${id}`)
  ]);
  renderQuoteForm(cats, users, quote);
}

function renderQuoteForm(categories, users, quote = {}) {
  const isEdit = Boolean(quote.id);
  const custId = quote.customer_id || '';
  const catId  = quote.product_category_id || '';
  const qty    = quote.quantity || 1;
  const status = quote.status || 'pending';

  app.innerHTML = `
    <h3>${isEdit ? 'Edit' : 'New'} Quote</h3>
    <form id="quote-form" class="mt-3">
      <div class="mb-3">
        <label class="form-label">Customer</label>
        <select id="q-cust" class="form-select" required>
          <option value="">-- select customer --</option>
          ${users.map(u=>
            `<option value="${u.id}" ${u.id===custId?'selected':''}>
              ${u.name} (${u.email})
            </option>`
          ).join('')}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Category</label>
        <select id="q-cat" class="form-select" required>
          <option value="">-- select category --</option>
          ${categories.map(c=>
            `<option value="${c.id}" ${c.id===catId?'selected':''}>
              ${c.name}
            </option>`
          ).join('')}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Quantity</label>
        <input id="q-qty" type="number" class="form-control" required
               value="${qty}">
      </div>
      <div class="mb-3">
        <label class="form-label">Status</label>
        <input id="q-status" class="form-control" required
               value="${status}">
      </div>
      <button type="submit" class="btn btn-primary">
        ${isEdit ? 'Save Changes' : 'Create Quote'}
      </button>
      <button type="button" class="btn btn-secondary ms-2"
              onclick="showQuotes()">Cancel</button>
    </form>
  `;

  document.getElementById('quote-form').onsubmit = async e => {
    e.preventDefault();
    const payload = {
      customer_id:           parseInt(document.getElementById('q-cust').value, 10),
      product_category_id:   parseInt(document.getElementById('q-cat').value, 10),
      quantity:              parseInt(document.getElementById('q-qty').value, 10),
      status:                document.getElementById('q-status').value
    };
    try {
      if (isEdit) {
        await fetchJSON(`/quotes/${quote.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: payload.status })
        });
        alert('Quote updated.');
      } else {
        // create applies pricing rules server‐side
        await fetchJSON('/quotes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        alert('Quote created.');
      }
      showQuotes();
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };
}

async function deleteQuote(id) {
  if (!confirm('Delete this quote?')) return;
  try {
    await fetchJSON(`/quotes/${id}`, { method: 'DELETE' });
    alert('Deleted.');
    showQuotes();
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

// ===== stubs remain =====
async function showUsers()    { app.innerHTML = '<h3>Users</h3><p>…stub…</p>'; }
async function showRoles()    { app.innerHTML = '<h3>Roles</h3><p>…stub…</p>'; }
async function showOrders()   { app.innerHTML = '<h3>Orders</h3><p>…stub…</p>'; }
// …etc…

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

loadAdminView('products');
