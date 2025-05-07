// branding-shop-frontend/script-admin.js
console.log('🔥 script-admin.js – all menus, Products/Quotes/Orders CRUD intact');

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

// ===== USERS CRUD (stubbed) =====
async function showUsers() {
  app.innerHTML = '<h3>Users</h3><p>…stub – implement full CRUD here…</p>';
}

// ===== ROLES CRUD (stubbed) =====
async function showRoles() {
  app.innerHTML = '<h3>Roles</h3><p>…stub – implement full CRUD here…</p>';
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
          <button class="btn btn-sm btn-outline-secondary me-1" onclick="editProduct(${p.id})">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>`;
  }).join('');
  app.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Products</h3>
      <button class="btn btn-success" onclick="newProduct()">+ New Product</button>
    </div>
    <table class="table table-striped">
      <thead><tr>
        <th>ID</th><th>Name</th><th>Description</th>
        <th>Price</th><th>Category</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}
function newProduct() { renderProductForm(); }
async function editProduct(id) {
  const [cats, prod] = await Promise.all([
    fetchJSON('/product-categories'),
    fetchJSON(`/products/${id}`)
  ]);
  renderProductForm(cats, prod);
}
function renderProductForm(categories = [], product = {}) {
  const name  = product.name||'',
        desc  = product.description||'',
        price = product.price!=null?product.price:'',
        catId = product.category_id||'';
  app.innerHTML = `
    <h3>${product.id?'Edit':'New'} Product</h3>
    <form id="product-form" class="mt-3">
      <div class="mb-3"><label class="form-label">Name</label>
        <input id="p-name" class="form-control" required value="${name}">
      </div>
      <div class="mb-3"><label class="form-label">Description</label>
        <textarea id="p-desc" class="form-control">${desc}</textarea>
      </div>
      <div class="mb-3"><label class="form-label">Price</label>
        <input id="p-price" type="number" step="0.01" class="form-control" required value="${price}">
      </div>
      <div class="mb-3"><label class="form-label">Category</label>
        <select id="p-cat" class="form-select" required>
          <option value="">-- choose --</option>
          ${categories.map(c=>
            `<option value="${c.id}" ${c.id===catId?'selected':''}>${c.name}</option>`
          ).join('')}
        </select>
      </div>
      <button type="submit" class="btn btn-primary">${product.id?'Save':'Create'}</button>
      <button type="button" class="btn btn-secondary ms-2" onclick="showProducts()">Cancel</button>
    </form>`;
  // lazy‐load cats if needed:
  if (!categories.length) fetchJSON('/product-categories').then(cats=>{
    document.getElementById('p-cat').innerHTML = `
      <option value="">-- choose --</option>
      ${cats.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}`;
  });
  document.getElementById('product-form').onsubmit = async e=>{
    e.preventDefault();
    const payload = {
      name:        document.getElementById('p-name').value,
      description: document.getElementById('p-desc').value,
      price:       parseFloat(document.getElementById('p-price').value),
      category_id: +document.getElementById('p-cat').value
    };
    try {
      if (product.id) {
        await fetchJSON(`/products/${product.id}`, { method:'PATCH', body:JSON.stringify(payload) });
        alert('Product updated.');
      } else {
        await fetchJSON('/products',              { method:'POST',  body:JSON.stringify(payload) });
        alert('Product created.');
      }
      showProducts();
    } catch(err) {
      alert('Save failed: '+err.message);
    }
  };
}
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await fetchJSON(`/products/${id}`, { method:'DELETE' });
    alert('Deleted.');
    showProducts();
  } catch(err) {
    alert('Delete failed: '+err.message);
  }
}

// ===== QUOTES CRUD =====
async function showQuotes() {
  const quotes = await fetchJSON('/quotes');
  const rows = quotes.map(q=>`
    <tr>
      <td>${q.id}</td><td>${q.customer_name}</td><td>${q.category_name}</td>
      <td>${q.quantity}</td><td>$${Number(q.unit_price).toFixed(2)}</td>
      <td>$${Number(q.total).toFixed(2)}</td><td>${q.status}</td>
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
      <thead><tr>
        <th>ID</th><th>Customer</th><th>Category</th>
        <th>Qty</th><th>Unit Price</th><th>Total</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}
async function newQuoteForm() {
  const [cats, users] = await Promise.all([fetchJSON('/product-categories'), fetchJSON('/users')]);
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
function renderQuoteForm(categories, users, quote={}) {
  const isEdit=!!quote.id, cust=quote.customer_id||'', cat=quote.product_category_id||'', qty=quote.quantity||1, status=quote.status||'pending';
  app.innerHTML=`
    <h3>${isEdit?'Edit':'New'} Quote</h3>
    <form id="quote-form" class="mt-3">
      <div class="mb-3"><label class="form-label">Customer</label>
        <select id="q-cust" class="form-select" required>
          <option value="">-- select customer --</option>
          ${users.map(u=>`<option value="${u.id}" ${u.id===cust?'selected':''}>${u.name} (${u.email})</option>`).join('')}
        </select>
      </div>
      <div class="mb-3"><label class="form-label">Category</label>
        <select id="q-cat" class="form-select" required>
          <option value="">-- select category --</option>
          ${categories.map(c=>`<option value="${c.id}" ${c.id===cat?'selected':''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="mb-3"><label class="form-label">Quantity</label>
        <input id="q-qty" type="number" class="form-control" required value="${qty}">
      </div>
      <div class="mb-3"><label class="form-label">Status</label>
        <input id="q-status" class="form-control" required value="${status}">
      </div>
      <button type="submit" class="btn btn-primary">${isEdit?'Save Changes':'Create Quote'}</button>
      <button type="button" class="btn btn-secondary ms-2" onclick="showQuotes()">Cancel</button>
    </form>`;
  document.getElementById('quote-form').onsubmit=async e=>{
    e.preventDefault();
    const payload={
      customer_id:         +document.getElementById('q-cust').value,
      product_category_id: +document.getElementById('q-cat').value,
      quantity:            +document.getElementById('q-qty').value,
      status:              document.getElementById('q-status').value
    };
    try {
      if(isEdit){
        await fetchJSON(`/quotes/${quote.id}`,{method:'PATCH',body:JSON.stringify({status:payload.status})});
        alert('Quote updated.');
      } else {
        await fetchJSON('/quotes',{method:'POST',body:JSON.stringify(payload)});
        alert('Quote created.');
      }
      showQuotes();
    }catch(err){
      alert('Save failed: '+err.message);
    }
  };
}
async function deleteQuote(id){
  if(!confirm('Delete this quote?'))return;
  try{await fetchJSON(`/quotes/${id}`,{method:'DELETE'});alert('Deleted.');showQuotes();}
  catch(err){alert('Delete failed: '+err.message);}
}

// ===== ORDERS CRUD =====
async function showOrders(){
  const [orders, users]=await Promise.all([fetchJSON('/orders'),fetchJSON('/users')]);
  const rows=orders.map(o=>{
    const u=users.find(x=>x.id===o.user_id);
    return`
      <tr>
        <td>${o.id}</td><td>${u?u.name:'—'}</td><td>$${Number(o.total).toFixed(2)}</td>
        <td>${o.status}</td><td>${new Date(o.placed_at).toLocaleDateString()}</td>
        <td>${o.payment_status}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary me-1" onclick="editOrderForm(${o.id})">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder(${o.id})">Delete</button>
        </td>
      </tr>`;
  }).join('');
  app.innerHTML=`
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Orders</h3>
      <button class="btn btn-success" onclick="newOrderForm()">+ New Order</button>
    </div>
    <table class="table table-striped">
      <thead><tr>
        <th>ID</th><th>Customer</th><th>Total</th>
        <th>Status</th><th>Placed</th><th>Payment</th><th>Actions</th>
      </tr></thead><tbody>${rows}</tbody></table>`;
}
async function newOrderForm(){
  const [users,quotes]=await Promise.all([fetchJSON('/users'),fetchJSON('/quotes')]);
  renderOrderForm(users,quotes);
}
async function editOrderForm(id){
  const [users,quotes,order]=await Promise.all([fetchJSON('/users'),fetchJSON('/quotes'),fetchJSON(`/orders/${id}`)]);
  renderOrderForm(users,quotes,order);
}
function renderOrderForm(users,quotes,order={}){
  const isEdit=!!order.id,u=order.user_id||'',q=order.quote_id||'',t=order.total!=null?order.total:'',s=order.status||'new',p=order.payment_status||'pending';
  app.innerHTML=`
    <h3>${isEdit?'Edit':'New'} Order</h3>
    <form id="order-form" class="mt-3">
      <div class="mb-3"><label class="form-label">Customer</label>
        <select id="o-user" class="form-select" required>
          <option value="">-- select customer --</option>
          ${users.map(x=>`<option value="${x.id}" ${x.id===u?'selected':''}>${x.name}</option>`).join('')}
        </select>
      </div>
      <div class="mb-3"><label class="form-label">Quote</label>
        <select id="o-quote" class="form-select" required>
          <option value="">-- select quote --</option>
          ${quotes.map(x=>`<option value="${x.id}" ${x.id===q?'selected':''}>#${x.id} – $${Number(x.total).toFixed(2)}</option>`).join('')}
        </select>
      </div>
      <div class="mb-3"><label class="form-label">Total</label>
        <input id="o-total" type="number" step="0.01" class="form-control" required value="${t}">
      </div>
      <div class="mb-3"><label class="form-label">Status</label>
        <input id="o-status" class="form-control" required value="${s}">
      </div>
      <div class="mb-3"><label class="form-label">Payment Status</label>
        <input id="o-paystat" class="form-control" required value="${p}">
      </div>
      <button type="submit" class="btn btn-primary">${isEdit?'Save Changes':'Create Order'}</button>
      <button type="button" class="btn btn-secondary ms-2" onclick="showOrders()">Cancel</button>
    </form>`;
  document.getElementById('order-form').onsubmit=async e=>{
    e.preventDefault();
    const payload={
      user_id:        +document.getElementById('o-user').value,
      quote_id:       +document.getElementById('o-quote').value,
      total:          +document.getElementById('o-total').value,
      status:         document.getElementById('o-status').value,
      payment_status: document.getElementById('o-paystat').value
    };
    try{
      if(isEdit){
        await fetchJSON(`/orders/${order.id}`,{method:'PATCH',body:JSON.stringify(payload)});
        alert('Order updated.');
      } else {
        await fetchJSON('/orders',{method:'POST',body:JSON.stringify(payload)});
        alert('Order created.');
      }
      showOrders();
    }catch(err){
      alert('Save failed: '+err.message);
    }
  };
}
async function deleteOrder(id){
  if(!confirm('Delete this order?'))return;
  try{await fetchJSON(`/orders/${id}`,{method:'DELETE'});alert('Deleted.');showOrders();}
  catch(err){alert('Delete failed: '+err.message);}
}

// ===== PRODUCTION (stub) =====
async function showJobs() {
  app.innerHTML = '<h3>Production</h3><p>…stub – implement CRUD…</p>';
}

// ===== SUPPLIERS (stub) =====
async function showSuppliers() {
  app.innerHTML = '<h3>Suppliers</h3><p>…stub – implement CRUD…</p>';
}

// ===== CATALOG (stub) =====
async function showCatalog() {
  app.innerHTML = '<h3>Catalog</h3><p>…stub – implement CRUD…</p>';
}

// ===== PURCHASE ORDERS (stub) =====
async function showPurchaseOrders() {
  app.innerHTML = '<h3>Purchase Orders</h3><p>…stub – implement CRUD…</p>';
}

// ===== LEADS (stub) =====
async function showLeads() {
  app.innerHTML = '<h3>Leads</h3><p>…stub – implement CRUD…</p>';
}

// ===== DEALS (stub) =====
async function showDeals() {
  app.innerHTML = '<h3>Deals</h3><p>…stub – implement CRUD…</p>';
}

// ===== CRM HOME (stub) =====
async function showCRM() {
  app.innerHTML = '<h3>CRM Home</h3><p>…Use Leads/Deals above…</p>';
}

// ===== HR (stub) =====
async function showHR() {
  app.innerHTML = '<h3>HR</h3><p>…stub – implement CRUD…</p>';
}

// ===== FINANCE (stub) =====
async function showFinance() {
  app.innerHTML = '<h3>Finance</h3><p>…stub – implement CRUD…</p>';
}

// ===== REPORTS (stub) =====
async function showReports() {
  app.innerHTML = '<h3>Reports</h3><p>…stub – implement reports endpoints…</p>';
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// initial load
loadAdminView('products');
