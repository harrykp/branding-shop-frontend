// branding-shop-frontend/script-admin.js
console.log('🔥 script-admin.js v5 loaded – Products & Quotes full CRUD');

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
      case 'orders':         return showOrders();
      case 'production':     return showJobs();
      case 'suppliers':      return showSuppliers();
      case 'catalog':        return showCatalog();
      case 'purchaseOrders': return showPurchaseOrders();
      case 'leads':          return showLeads();
      case 'deals':          return showDeals();
      case 'crm':            return showCRM();
      case 'hr':             return showHR();
      case 'finance':        return showFinance();
      case 'reports':        return showReports();
      default:
        app.innerHTML = `<div class="alert alert-warning">Unknown view: ${view}</div>`;
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">Error loading ${view}: ${err.message}</div>`;
  }
}

// ===== PRODUCTS CRUD =====

async function showProducts() {
  const [cats, prods] = await Promise.all([
    fetchJSON('/product-categories'),
    fetchJSON('/products')
  ]);

  const rows = prods.map(p => {
    const cat = cats.find(c => c.id === p.category_id);
    return `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.description||''}</td>
        <td>$${Number(p.price).toFixed(2)}</td>
        <td>${cat?.name||'—'}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary me-1"
                  onclick="editProduct(${p.id})">Edit</button>
          <button class="btn btn-sm btn-outline-danger"
                  onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  app.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Products</h3>
      <button class="btn btn-success" onclick="newProduct()">+ New Product</button>
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Description</th>
          <th>Price</th><th>Category</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function newProduct() {
  renderProductForm();
}

async function editProduct(id) {
  const [cats, prod] = await Promise.all([
    fetchJSON('/product-categories'),
    fetchJSON(`/products/${id}`)
  ]);
  renderProductForm(cats, prod);
}

function renderProductForm(categories = [], product = {}) {
  const name     = product.name || '';
  const desc     = product.description || '';
  const price    = product.price  != null ? product.price : '';
  const catId    = product.category_id || '';

  app.innerHTML = `
    <h3>${product.id ? 'Edit' : 'New'} Product</h3>
    <form id="product-form" class="mt-3">
      <div class="mb-3">
        <label class="form-label">Name</label>
        <input id="p-name" class="form-control" required value="${name}">
      </div>
      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea id="p-desc" class="form-control">${desc}</textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Price</label>
        <input id="p-price" type="number" step="0.01" class="form-control" required value="${price}">
      </div>
      <div class="mb-3">
        <label class="form-label">Category</label>
        <select id="p-cat" class="form-select" required>
          <option value="">-- choose --</option>
          ${categories.map(c=>
            `<option value="${c.id}" ${c.id===catId?'selected':''}>${c.name}</option>`
          ).join('')}
        </select>
      </div>
      <button type="submit" class="btn btn-primary">
        ${product.id ? 'Save Changes' : 'Create Product'}
      </button>
      <button type="button" class="btn btn-secondary ms-2" onclick="showProducts()">Cancel</button>
    </form>
  `;

  if (!categories.length) {
    fetchJSON('/product-categories').then(cats2 => {
      const sel = document.getElementById('p-cat');
      sel.innerHTML = `
        <option value="">-- choose --</option>
        ${cats2.map(c=>
          `<option value="${c.id}" ${c.id===catId?'selected':''}>${c.name}</option>`
        ).join('')}
      `;
    });
  }

  document.getElementById('product-form').onsubmit = async e => {
    e.preventDefault();
    const payload = {
      name:        document.getElementById('p-name').value,
      description: document.getElementById('p-desc').value,
      price:       parseFloat(document.getElementById('p-price').value),
      category_id: parseInt(document.getElementById('p-cat').value,10)
    };
    try {
      if (product.id) {
        await fetchJSON(`/products/${product.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        alert('Product updated.');
      } else {
        await fetchJSON('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        alert('Product created.');
      }
      showProducts();
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await fetchJSON(`/products/${id}`, { method: 'DELETE' });
    alert('Deleted.');
    showProducts();
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

// ===== QUOTES CRUD with Edit Form =====

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
        <input id="q-qty" type="number" class="form-control" required value="${qty}">
      </div>
      <div class="mb-3">
        <label class="form-label">Status</label>
        <input id="q-status" class="form-control" required value="${status}">
      </div>
      <button type="submit" class="btn btn-primary">
        ${isEdit ? 'Save Changes' : 'Create Quote'}
      </button>
      <button type="button" class="btn btn-secondary ms-2" onclick="showQuotes()">Cancel</button>
    </form>
  `;

  document.getElementById('quote-form').onsubmit = async e => {
    e.preventDefault();
    const payload = {
      customer_id:         parseInt(document.getElementById('q-cust').value,10),
      product_category_id: parseInt(document.getElementById('q-cat').value,10),
      quantity:            parseInt(document.getElementById('q-qty').value,10),
      status:              document.getElementById('q-status').value
    };
    try {
      if (isEdit) {
        await fetchJSON(`/quotes/${quote.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: payload.status })
        });
        alert('Quote updated.');
      } else {
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

// ===== other stubs =====
async function showUsers()          { app.innerHTML = '<h3>Users</h3><p>…stub…</p>'; }
async function showRoles()          { app.innerHTML = '<h3>Roles</h3><p>…stub…</p>'; }
async function showOrders()         { app.innerHTML = '<h3>Orders</h3><p>…stub…</p>'; }
async function showJobs()           { app.innerHTML = '<h3>Production</h3><p>…stub…</p>'; }
async function showSuppliers()      { app.innerHTML = '<h3>Suppliers</h3><p>…stub…</p>'; }
async function showCatalog()        { app.innerHTML = '<h3>Catalog</h3><p>…stub…</p>'; }
async function showPurchaseOrders() { app.innerHTML = '<h3>Purchase Orders</h3><p>…stub…</p>'; }
async function showLeads()          { app.innerHTML = '<h3>Leads</h3><p>…stub…</p>'; }
async function showDeals()          { app.innerHTML = '<h3>Deals</h3><p>…stub…</p>'; }
async function showCRM()            { app.innerHTML = '<h3>CRM Home</h3><p>Use Leads/Deals above.</p>'; }
async function showHR()             { app.innerHTML = '<h3>HR</h3><p>…stub…</p>'; }
async function showFinance()        { app.innerHTML = '<h3>Finance</h3><p>…stub…</p>'; }
async function showReports()        { app.innerHTML = '<h3>Reports</h3><p>…stub…</p>'; }

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// initial load
loadAdminView('products');
