// frontend/script-admin.js

console.log('🔥 script-admin.js – metadata-driven CRUD with search, pagination & sorting');

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

// --- pagination sizes and state per resource ---
const PAGE_SIZES = [5, 10, 20, 50];
const state = {};
function initState(res) {
  if (!state[res]) {
    state[res] = { page:1, pageSize:10, search:'', sortKey:null, sortDir:'asc', _lastRecords:[] };
  }
}

// --- status options per resource ---
const STATUS_OPTIONS = {
  users: [], roles: [], products: [],
  quotes:['pending','approved','rejected','cancelled'],
  orders:['new','processing','shipped','delivered','cancelled'],
  jobs:['queued','in_progress','finished','cancelled'],
  suppliers:[], catalog:[],
  'purchase-orders':['pending','placed','received','cancelled'],
  purchaseOrders:['pending','placed','received','cancelled'],
  leads:['new','contacted','qualified','lost'],
  deals:['qualified','won','lost'], hr:[], finance:['pending','completed','failed','refunded'], reports:[]
};

// reusable columns
const jobsColumns = [
  { key:'id', label:'ID', readonly:true },
  { key:'deal_id', label:'Deal ID', type:'number' },
  { key:'deal_value', label:'Deal Value', type:'number' },
  { key:'customer_id', label:'Cust. ID', type:'number' },
  { key:'customer_name', label:'Customer' },
  { key:'customer_phone', label:'Phone' },
  { key:'order_id', label:'Order ID', type:'number' },
  { key:'order_total', label:'Order Value', type:'number' },
  { key:'payment_status', label:'Pay Status' },
  { key:'product_id', label:'Prod. ID', type:'number' },
  { key:'product_name', label:'Product' },
  { key:'product_code', label:'SKU' },
  { key:'qty_ordered', label:'Qty Ordered', type:'number' },
  { key:'qty_completed', label:'Qty Completed', type:'number' },
  { key:'pct_complete', label:'% Complete', type:'number' },
  { key:'start_date', label:'Start Date' },
  { key:'completion_date', label:'Completion Date' },
  { key:'due_date', label:'Due Date' },
  { key:'sales_rep', label:'Sales Rep' },
  { key:'department', label:'Dept' },
  { key:'completed_value', label:'Paid', type:'number' },
  { key:'balance_unpaid', label:'Balance', type:'number' },
  { key:'comments', label:'Comments' },
  { key:'updated_by_name', label:'Updated By' },
  { key:'updated_at', label:'Updated At', readonly:true },
  { key:'job_status', label:'Status', options: STATUS_OPTIONS.jobs }
];
const purchaseOrdersColumns = [ { key:'id', label:'ID', readonly:true }, { key:'supplier_id', label:'Supplier', type:'number' }, { key:'created_at', label:'Created At', readonly:true }, { key:'status', label:'Status', options:STATUS_OPTIONS.purchaseOrders } ];
const dailyTransactionsColumns = [ { key:'id', label:'ID', readonly:true }, { key:'date', label:'Date' }, { key:'start_of_day_cash', label:'Start Cash', type:'number' }, { key:'payments_received', label:'Received', type:'number' }, { key:'expenses_paid', label:'Expenses', type:'number' }, { key:'bank_deposit', label:'Bank Deposit', type:'number' }, { key:'end_of_day_cash', label:'End Cash', type:'number' }, { key:'updated_by', label:'Updated By', type:'number' }, { key:'updated_at', label:'Updated At', readonly:true } ];

// resource configs
const RESOURCES = {
  users:{ endpoint:'/users', columns:[{key:'id',label:'ID',readonly:true},{key:'name',label:'Name'},{key:'email',label:'Email',type:'email'},{key:'phone_number',label:'Phone'},{key:'department_id',label:'Dept ID',type:'number'}] },
  roles:{ endpoint:'/roles', columns:[{key:'id',label:'ID',readonly:true},{key:'name',label:'Role Name'}] },
  products:{ endpoint:'/products', columns:[{key:'id',label:'ID',readonly:true},{key:'name',label:'Name'},{key:'description',label:'Description'},{key:'price',label:'Price',type:'number'},{key:'category_id',label:'Category ID',type:'number'}] },
  pricingRules:{ endpoint:'/pricing-rules', columns:[{key:'id',label:'ID',readonly:true},{key:'name',label:'Name'},{key:'product_category_id',label:'Category ID',type:'number'},{key:'category_name',label:'Category'},{key:'rule_type',label:'Rule Type'},{key:'min_qty',label:'Min Qty',type:'number'},{key:'max_qty',label:'Max Qty',type:'number'},{key:'unit_price',label:'Unit Price',type:'number'},{key:'created_at',label:'Created At',readonly:true},{key:'updated_at',label:'Updated At',readonly:true}] },
  quotes:{ endpoint:'/quotes', columns:[{key:'id',label:'ID',readonly:true},{key:'customer_id',label:'Customer ID',type:'number'},{key:'customer_name',label:'Customer'},{key:'customer_phone',label:'Phone'},{key:'product_id',label:'Product ID',type:'number'},{key:'product_name',label:'Product'},{key:'quantity',label:'Quantity',type:'number'},{key:'unit_price',label:'Unit Price',type:'number'},{key:'total',label:'Total',type:'number',readonly:true},{key:'status',label:'Status',options:STATUS_OPTIONS.quotes},{key:'created_at',label:'Created At',readonly:true}] },
  orders:{ endpoint:'/orders', columns:[{key:'id',label:'ID',readonly:true},{key:'user_id',label:'Customer ID',type:'number'},{key:'quote_id',label:'Quote ID',type:'number'},{key:'total',label:'Total',type:'number'},{key:'status',label:'Status',options:STATUS_OPTIONS.orders},{key:'placed_at',label:'Placed At',readonly:true},{key:'payment_status',label:'Pay Status'}] },
  deals:{ endpoint:'/deals', idKey:'deal_id', columns:[{key:'deal_id',label:'Deal ID',readonly:true},{key:'lead_id',label:'Lead ID',type:'number'},{key:'lead_name',label:'Lead Name'},{key:'sales_rep_id',label:'Rep ID',type:'number'},{key:'sales_rep',label:'Sales Rep'},{key:'product_id',label:'Product ID',type:'number'},{key:'product',label:'Product Name'},{key:'product_code',label:'SKU'},{key:'quote_id',label:'Quote ID',type:'number'},{key:'quote_qty',label:'Qty Quoted',type:'number'},{key:'quote_unit_price',label:'Unit Price',type:'number'},{key:'quote_total',label:'Quote Total',type:'number',readonly:true},{key:'deal_value',label:'Deal Value',type:'number'},{key:'deal_status',label:'Status',options:STATUS_OPTIONS.deals},{key:'customer_id',label:'Cust. ID',type:'number'},{key:'customer_name',label:'Customer'},{key:'customer_phone',label:'Phone'},{key:'deal_date',label:'Created At',readonly:true}] },
  jobs:{ endpoint:'/jobs', columns:jobsColumns },
  production:{ endpoint:'/jobs', columns:jobsColumns },
  suppliers:{ endpoint:'/suppliers', columns:[{key:'id',label:'ID',readonly:true},{key:'name',label:'Name'},{key:'website',label:'Website'}] },
  catalog:{ endpoint:'/catalog', columns:[{key:'id',label:'ID',readonly:true},{key:'supplier_id',label:'Supplier',type:'number'},{key:'sku',label:'SKU'},{key:'name',label:'Name'},{key:'cost',label:'Cost',type:'number'}] },
  'purchase-orders':{ endpoint:'/purchase-orders', columns:purchaseOrdersColumns },
  purchaseOrders:{ endpoint:'/purchase-orders', columns:purchaseOrdersColumns },
  leads:{ endpoint:'/leads', columns:[{key:'id',label:'ID',readonly:true},{key:'created_by',label:'Created By',type:'number'},{key:'name',label:'Name'},{key:'email',label:'Email',type:'email'},{key:'phone',label:'Phone'},{key:'status',label:'Status',options:STATUS_OPTIONS.leads},{key:'created_at',label:'Created At',readonly:true}] },
  hr:{ endpoint:'/hr', columns:[{key:'id',label:'ID',readonly:true},{key:'user_id',label:'User ID',type:'number'},{key:'ssn',label:'SSN'},{key:'hire_date',label:'Hire Date'},{key:'position',label:'Position'},{key:'salary',label:'Salary',type:'number'}] },
  finance:{ endpoint:'/payments', columns:[{key:'id',label:'ID',readonly:true},{key:'order_id',label:'Order ID',type:'number'},{key:'gateway',label:'Gateway'},{key:'transaction_id',label:'Txn ID'},{key:'amount',label:'Amount',type:'number'},{key:'status',label:'Status',options:STATUS_OPTIONS.finance},{key:'paid_at',label:'Paid At'},{key:'created_at',label:'Created At',readonly:true}] },
  reports:{ endpoint:'/daily-transactions', columns:dailyTransactionsColumns }
};

// Generic fetch helper
async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

// Wire nav clicks
document.querySelectorAll('[data-view]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); loadAdminView(el.dataset.view); }));

// Main loader
async function loadAdminView(view) {
  initState(view);
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  if (view === 'production') {
    return showProductionBoard();
  }
  const cfg = RESOURCES[view];
  if (!cfg || !cfg.endpoint) {
    app.innerHTML = `<h3>${view}</h3><p>Under construction…</p>`;
    return;
  }
  const list = await fetchJSON(cfg.endpoint);
  state[view]._lastRecords = list;
  renderList(view, list);
}

// Show production board with grouping & coloring
async function showProductionBoard() {
  const jobs = await fetchJSON('/jobs');
  // group by status
  const groups = { queued:[], in_progress:[], finished:[], cancelled:[] };
  jobs.forEach(j => { const st=j.job_status; if(!groups[st]) groups[st]=[]; groups[st].push(j); });
  const labels = { queued:'Queued', in_progress:'In Progress', finished:'Finished', cancelled:'Cancelled' };
  const colors = { queued:'bg-secondary', in_progress:'bg-primary', finished:'bg-success', cancelled:'bg-danger' };

  let html = '<h3>Production Job Board</h3><div class="row">';
  Object.keys(groups).forEach(st => {
    html += `<div class="col"><h4>${labels[st]}</h4>`;
    groups[st].forEach(j => {
      html += `<div class="card mb-3 ${colors[st]} text-white"><div class="card-body p-2">` +
              `<strong>#${j.id}</strong><br>Qty: ${j.qty}<br>Due: ${new Date(j.due_date).toLocaleDateString()}` +
              `<div class="mt-2"><select class="form-select form-select-sm" onchange="changeJobStatus(${j.id}, this.value)">` +
              ['queued','in_progress','finished','cancelled'].map(s => `<option value="${s}" ${j.job_status===s?'selected':''}>${labels[s]}</option>`).join('') +
              `</select></div></div></div>`;
    });
    html += '</div>';
  });
  html += '</div>';
  app.innerHTML = html;
}

// Change job status action
async function changeJobStatus(jobId, newStatus) {
  try {
    await fetchJSON(`/jobs/${jobId}`, { method:'PATCH', body: JSON.stringify({ status: newStatus }) });
    showProductionBoard();
  } catch (err) {
    alert('Status update failed: '+err.message);
  }
}

// Generic list renderer and form CRUD (unchanged for brevity)
/* ... existing renderList, renderForm, newResource, editResource, deleteResource ... */

// Push deal to production (if still needed)
async function pushDeal(dealId) {
  if (!confirm(`Push deal #${dealId} to production?`)) return;
  try {
    const job = await fetchJSON(`/jobs/push/${dealId}`, { method:'POST' });
    alert(`Created production job #${job.id}`);
    showProductionBoard();
  } catch (err) {
    alert('Push failed: '+err.message);
  }
}

// Logout & initial load
function logout() { localStorage.removeItem('token'); window.location.href='login.html'; }
loadAdminView('users');
