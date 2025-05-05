// script-admin.js
const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
const app = document.getElementById('app-admin');

async function fetchJSON(path, opts={}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Nav wiring
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => { e.preventDefault(); loadView(el.dataset.view); })
);

async function loadView(v) {
  app.innerHTML = `<h3>Loading ${v}…</h3>`;
  try {
    switch (v) {
      case 'users':           return usersView();
      case 'roles':           return rolesView();
      case 'products':        return productsView();
      case 'quotes':          return quotesView();
      case 'orders':          return ordersView();
      case 'jobs':            return jobsView();
      case 'leads':           return leadsView();
      case 'deals':           return dealsView();
      case 'hr':              return hrView();
      case 'finance':         return financeView();
      case 'reports':         return reportsView();
      case 'suppliers':       return suppliersView();
      case 'catalog':         return catalogView();
      case 'purchaseOrders':  return purchaseOrdersView();
      default:
        app.innerHTML = `<div class="alert alert-warning">Unknown view: ${v}</div>`;
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

// ——— USERS ———
async function usersView() {
  const u = await fetchJSON('/users');
  app.innerHTML = `
    <h3>Users</h3>
    <button class="btn btn-success mb-2" onclick="createUser()">+ Add</button>
    ${u.map(u=>`
      <div class="card p-2 mb-2">
        <strong>${u.name}</strong> (${u.email})<br>
        Phone: ${u.phone_number||'–'}<br>
        <button class="btn btn-sm btn-primary" onclick="editUser(${u.id})">Edit</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteUser(${u.id})">Delete</button>
      </div>`).join('')}
  `;
}
async function createUser() {
  const name = prompt('Name:'); if (!name) return;
  const email = prompt('Email:'); if (!email) return;
  const phone = prompt('Phone:');
  const pwd = prompt('Password:'); if (!pwd) return;
  await fetchJSON('/auth/register',{ method:'POST', body:JSON.stringify({name,email,phone_number:phone,password:pwd}) });
  loadView('users');
}
async function editUser(id) {
  const u = await fetchJSON(`/users/${id}`);
  const name  = prompt('Name:', u.name); if (name==null) return;
  const email = prompt('Email:',u.email); if (email==null) return;
  const phone = prompt('Phone:',u.phone_number);
  await fetchJSON(`/users/${id}`,{ method:'PATCH', body:JSON.stringify({name,email,phone_number:phone}) });
  loadView('users');
}
async function deleteUser(id) {
  if (!confirm('Delete user?')) return;
  await fetchJSON(`/users/${id}`,{ method:'DELETE' });
  loadView('users');
}

// ——— ROLES ———
async function rolesView() {
  const r = await fetchJSON('/roles');
  app.innerHTML = `
    <h3>Roles</h3>
    <button class="btn btn-success mb-2" onclick="createRole()">+ Add</button>
    ${r.map(r=>`
      <div class="d-flex justify-content-between mb-1">
        ${r.name}
        <span>
          <button class="btn btn-sm btn-primary" onclick="editRole(${r.id},'${r.name}')">Edit</button>
          <button class="btn btn-sm btn-danger"  onclick="deleteRole(${r.id})">Delete</button>
        </span>
      </div>`).join('')}
  `;
}
async function createRole() {
  const name = prompt('Role name:'); if (!name) return;
  await fetchJSON('/roles',{method:'POST',body:JSON.stringify({name})});
  loadView('roles');
}
async function editRole(id,old) {
  const name=prompt('Role name:',old); if(name==null)return;
  await fetchJSON(`/roles/${id}`,{method:'PATCH',body:JSON.stringify({name})});
  loadView('roles');
}
async function deleteRole(id) {
  if(!confirm('Delete?'))return;
  await fetchJSON(`/roles/${id}`,{method:'DELETE'});
  loadView('roles');
}

// ——— PRODUCTS ———
async function productsView() {
  const p = await fetchJSON('/products');
  app.innerHTML = `
    <h3>Products</h3>
    <button class="btn btn-success mb-2" onclick="createProduct()">+ Add</button>
    ${p.map(p=>`
      <div class="card p-2 mb-2">
        ${p.name} — $${p.price.toFixed(2)}
        <br>
        <button class="btn btn-sm btn-primary" onclick="editProduct(${p.id})">Edit</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteProduct(${p.id})">Delete</button>
      </div>`).join('')}
  `;
}
async function createProduct() {
  const name = prompt('Name:'); if(!name) return;
  const desc = prompt('Description:','');
  const price= parseFloat(prompt('Price:','0')); if(isNaN(price)) return;
  const cat  = parseInt(prompt('Category ID:'),10);
  const type = prompt('Type (service/stockable):','stockable');
  await fetchJSON('/products',{method:'POST',body:JSON.stringify({name,description:desc,price,category_id:cat,product_type:type})});
  loadView('products');
}
async function editProduct(id) {
  const p=await fetchJSON(`/products/${id}`);
  const name = prompt('Name:',p.name); if(name==null)return;
  const price= parseFloat(prompt('Price:',p.price)); if(isNaN(price))return;
  await fetchJSON(`/products/${id}`,{method:'PATCH',body:JSON.stringify({name,price})});
  loadView('products');
}
async function deleteProduct(id) {
  if(!confirm('Delete?'))return;
  await fetchJSON(`/products/${id}`,{method:'DELETE'});
  loadView('products');
}

// ——— QUOTES ———
async function quotesView() {
  const q = await fetchJSON('/quotes');
  app.innerHTML = `
    <h3>Quotes</h3>
    ${q.map(q=>`
      <div class="card p-2 mb-2">
        #${q.id} — ${q.customer_name} — $${q.total.toFixed(2)} — ${q.status}
        <br>
        <button class="btn btn-sm btn-primary" onclick="updateQuote(${q.id})">Edit</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteQuote(${q.id})">Delete</button>
      </div>`).join('')}
  `;
}
async function updateQuote(id) {
  const status=prompt('Status:'); if(status==null)return;
  await fetchJSON(`/quotes/${id}`,{method:'PATCH',body:JSON.stringify({status})});
  loadView('quotes');
}
async function deleteQuote(id) {
  if(!confirm('Delete?'))return;
  await fetchJSON(`/quotes/${id}`,{method:'DELETE'});
  loadView('quotes');
}

// ——— ORDERS ———
async function ordersView() {
  const o = await fetchJSON('/orders');
  app.innerHTML = `
    <h3>Orders</h3>
    ${o.map(o=>`
      <div class="card p-2 mb-2">
        #${o.id} — ${o.customer_name} — $${o.total.toFixed(2)} — ${o.status}
        <br>
        <button class="btn btn-sm btn-primary" onclick="updateOrder(${o.id})">Edit</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteOrder(${o.id})">Delete</button>
      </div>`).join('')}
  `;
}
async function updateOrder(id) {
  const status=prompt('Status:'); if(status==null)return;
  await fetchJSON(`/orders/${id}`,{method:'PATCH',body:JSON.stringify({status})});
  loadView('orders');
}
async function deleteOrder(id) {
  if(!confirm('Delete?'))return;
  await fetchJSON(`/orders/${id}`,{method:'DELETE'});
  loadView('orders');
}

// ——— PRODUCTION ———
async function jobsView() {
  const j = await fetchJSON('/jobs');
  app.innerHTML = `
    <h3>Production Jobs</h3>
    ${j.map(j=>`
      <div class="card p-2 mb-2">
        #${j.id} — ${j.type} — ${j.status} — Qty:${j.qty} — Due:${j.due_date||'–'}
        <br>
        <button class="btn btn-sm btn-primary" onclick="updateJob(${j.id})">Edit</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteJob(${j.id})">Delete</button>
      </div>`).join('')}
  `;
}
async function updateJob(id) {
  const status=prompt('Status:'); if(status==null)return;
  const due   =prompt('Due Date (YYYY-MM-DD):');
  const qty   =parseInt(prompt('Quantity:'),10);
  const asg   =parseInt(prompt('Assigned To User ID:'),10);
  await fetchJSON(`/jobs/${id}`,{
    method:'PATCH',
    body:JSON.stringify({status,due_date:due,qty,assigned_to:asg})
  });
  loadView('jobs');
}
async function deleteJob(id) {
  if(!confirm('Delete?'))return;
  await fetchJSON(`/jobs/${id}`,{method:'DELETE'});
  loadView('jobs');
}

// ——— LEADS & DEALS ———
async function leadsView() {
  const L = await fetchJSON('/leads');
  app.innerHTML = `
    <h3>Leads</h3>
    ${L.map(l=>`
      <div class="card p-2 mb-2">
        ${l.name} (${l.email}) — ${l.status}
        <button class="btn btn-sm btn-danger float-end" onclick="deleteLead(${l.id})">Delete</button>
      </div>`).join('')}
    <button class="btn btn-success" onclick="createLead()">+ Add Lead</button>
  `;
}
async function createLead() {
  const name   = prompt('Name:'); if(!name)return;
  const email  = prompt('Email:'); if(!email)return;
  const phone  = prompt('Phone:');
  const status = prompt('Status:','new');
  await fetchJSON('/leads',{method:'POST',body:JSON.stringify({name,email,phone,status})});
  loadView('leads');
}
async function deleteLead(id) {
  if(!confirm('Delete?'))return;
  await fetchJSON(`/leads/${id}`,{method:'DELETE'});
  loadView('leads');
}

async function dealsView() {
  const D = await fetchJSON('/deals');
  app.innerHTML = `
    <h3>Deals</h3>
    ${D.map(d=>`
      <div class="card p-2 mb-2">
        Lead#${d.lead_id} — $${d.value.toFixed(2)} — ${d.status}
        <button class="btn btn-sm btn-danger float-end" onclick="deleteDeal(${d.id})">Delete</button>
      </div>`).join('')}
    <button class="btn btn-success" onclick="createDeal()">+ Add Deal</button>
  `;
}
async function createDeal() {
  const lead_id = parseInt(prompt('Lead ID:'),10); if(isNaN(lead_id))return;
  const value   = parseFloat(prompt('Value:','0')); if(isNaN(value))return;
  const status  = prompt('Status:','qualified');
  await fetchJSON('/deals',{method:'POST',body:JSON.stringify({lead_id,value,status})});
  loadView('deals');
}
async function deleteDeal(id) {
  if(!confirm('Delete?'))return;
  await fetchJSON(`/deals/${id}`,{method:'DELETE'});
  loadView('deals');
}

// ——— HR ———
async function hrView() {
  const H = await fetchJSON('/hr');
  app.innerHTML = `
    <h3>HR Info</h3>
    ${H.map(h=>`
      <div class="card p-2 mb-2">
        User ${h.user_id} — ${h.position} — $${h.salary.toFixed(2)}
        <button class="btn btn-sm btn-primary float-end" onclick="editHR(${h.id})">Edit</button>
      </div>`).join('')}
  `;
}
async function editHR(id) {
  const h = await fetchJSON(`/hr/${id}`);
  const pos    = prompt('Position:',h.position); if(pos==null)return;
  const salary = parseFloat(prompt('Salary:',h.salary)); if(isNaN(salary))return;
  await fetchJSON(`/hr/${id}`,{method:'PATCH',body:JSON.stringify({position:pos,salary})});
  loadView('hr');
}

// ——— FINANCE ———
async function financeView() {
  const [P,E] = await Promise.all([fetchJSON('/payments'),fetchJSON('/expenses')]);
  app.innerHTML = `
    <h3>Payments</h3>
    ${P.map(p=>`<div>#${p.id} — $${p.amount.toFixed(2)} via ${p.gateway}</div>`).join('')}
    <h3 class="mt-4">Expenses</h3>
    ${E.map(e=>`<div>#${e.id} — $${e.amount.toFixed(2)} — ${e.category}</div>`).join('')}
  `;
}

// ——— REPORTS ———
async function reportsView() {
  const [S,F,T,L,C] = await Promise.all([
    fetchJSON('/sales'),
    fetchJSON('/finance'),
    fetchJSON('/taxes'),
    fetchJSON('/leave'),
    fetchJSON('/cashflow')
  ]);
  app.innerHTML = `
    <h3>Sales by Month</h3>
    <pre>${JSON.stringify(S,null,2)}</pre>
    <h3>Finance Summary</h3>
    <pre>${JSON.stringify(F,null,2)}</pre>
    <h3>Tax Totals</h3>
    <pre>${JSON.stringify(T,null,2)}</pre>
    <h3>Leave Counts</h3>
    <pre>${JSON.stringify(L,null,2)}</pre>
    <h3>Cashflow</h3>
    <pre>${JSON.stringify(C,null,2)}</pre>
  `;
}

// ——— SUPPLIERS ———
async function suppliersView() {
  const S = await fetchJSON('/suppliers');
  app.innerHTML = `
    <h3>Suppliers</h3>
    ${S.map(s=>`<div>#${s.id} — ${s.name} — ${s.website||'–'}</div>`).join('')}
  `;
}

// ——— CATALOG ———
async function catalogView() {
  const C = await fetchJSON('/catalog');
  app.innerHTML = `
    <h3>Catalog Items</h3>
    ${C.map(i=>`<div>#${i.id} ${i.sku} — ${i.name} — $${i.cost.toFixed(2)}</div>`).join('')}
  `;
}

// ——— PURCHASE ORDERS ———
async function purchaseOrdersView() {
  const P = await fetchJSON('/purchase-orders');
  app.innerHTML = `
    <h3>Purchase Orders</h3>
    ${P.map(p=>`<div>#${p.id} — ${p.supplier_name} — ${p.status}</div>`).join('')}
  `;
}

// logout
function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// start
loadView('users');
