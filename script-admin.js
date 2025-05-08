// branding-shop-frontend/script-admin.js
console.log('🔥 script-admin.js – metadata-driven CRUD for all resources with pagination');

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

const app = document.getElementById('app-admin');

// simple pagination state
const PAGE_SIZES = [5, 10, 20, 50];
const pageState = {}; // will hold { page, pageSize } per resource

function initPage(resource) {
  if (!pageState[resource]) {
    pageState[resource] = { page: 1, pageSize: PAGE_SIZES[1] }; // default 10
  }
}

// global status options per resource
const STATUS_OPTIONS = {
  users: [],
  roles: [],
  products: [],
  quotes: ['pending','approved','rejected','cancelled'],
  orders: ['new','processing','shipped','delivered','cancelled'],
  production: ['queued','in_progress','finished','cancelled'],
  suppliers: [],
  catalog: [],
  purchaseOrders: ['pending','placed','received','cancelled'],
  leads: ['new','contacted','qualified','lost'],
  deals: ['qualified','won','lost'],
  crm: [],
  hr: [],
  finance: ['pending','completed','failed','refunded'],
  reports: []
};

// reusable column definitions
const jobsColumns = [
  { key: 'id',          label: 'ID',        readonly: true },
  { key: 'order_id',    label: 'Order ID',  type: 'number' },
  { key: 'type',        label: 'Type' },
  { key: 'status',      label: 'Status',    options: STATUS_OPTIONS.production },
  { key: 'department_id', label: 'Dept ID', type: 'number' },
  { key: 'assigned_to', label: 'Assigned To', type: 'number' },
  { key: 'qty',         label: 'Qty',       type: 'number' },
  { key: 'start_date',  label: 'Start Date' },
  { key: 'due_date',    label: 'Due Date' }
];

const purchaseOrdersColumns = [
  { key: 'id',         label: 'ID',       readonly: true },
  { key: 'supplier_id',label: 'Supplier', type: 'number' },
  { key: 'created_at', label: 'Created At', readonly: true },
  { key: 'status',     label: 'Status',   options: STATUS_OPTIONS.purchaseOrders }
];

const dailyTransactionsColumns = [
  { key: 'id',               label: 'ID',               readonly: true },
  { key: 'date',             label: 'Date' },
  { key: 'start_of_day_cash',label: 'Start Cash',      type: 'number' },
  { key: 'payments_received',label: 'Received',        type: 'number' },
  { key: 'expenses_paid',    label: 'Expenses',        type: 'number' },
  { key: 'bank_deposit',     label: 'Bank Deposit',    type: 'number' },
  { key: 'end_of_day_cash',  label: 'End Cash',        type: 'number' },
  { key: 'updated_by',       label: 'Updated By',      type: 'number' },
  { key: 'updated_at',       label: 'Updated At',      readonly: true }
];

// describe all resources
const RESOURCES = {
  users: {
    endpoint: '/users',
    columns: [
      { key: 'id',           label: 'ID',         readonly: true },
      { key: 'name',         label: 'Name' },
      { key: 'email',        label: 'Email',      type: 'email' },
      { key: 'phone_number', label: 'Phone' },
      { key: 'department_id',label: 'Dept ID',    type: 'number' }
    ]
  },
  roles: {
    endpoint: '/roles',
    columns: [
      { key: 'id',   label: 'ID',       readonly: true },
      { key: 'name', label: 'Role Name' }
    ]
  },
  products: {
    endpoint: '/products',
    columns: [
      { key: 'id',           label: 'ID',          readonly: true },
      { key: 'name',         label: 'Name' },
      { key: 'description',  label: 'Description' },
      { key: 'price',        label: 'Price',       type: 'number' },
      { key: 'category_id',  label: 'Category ID', type: 'number' }
    ]
  },
  quotes: {
    endpoint: '/quotes',
    columns: [
      { key: 'id',             label: 'ID',          readonly: true },
      { key: 'customer_name',  label: 'Customer' },
      { key: 'customer_phone', label: 'Phone' },
      { key: 'product_name',   label: 'Product' },
      { key: 'quantity',       label: 'Qty',         type: 'number' },
      { key: 'unit_price',     label: 'Unit Price',  type: 'number' },
      { key: 'total',          label: 'Total',       type: 'number', readonly: true },
      { key: 'status',         label: 'Status',      options: STATUS_OPTIONS.quotes },
      { key: 'created_at',     label: 'Created At',  readonly: true }
    ]
  },
  orders: {
    endpoint: '/orders',
    columns: [
      { key: 'id',             label: 'ID',          readonly: true },
      { key: 'user_name',      label: 'Customer' },
      { key: 'quote_id',       label: 'Quote ID',    type: 'number' },
      { key: 'total',          label: 'Total',       type: 'number' },
      { key: 'status',         label: 'Status',      options: STATUS_OPTIONS.orders },
      { key: 'placed_at',      label: 'Placed At',   readonly: true },
      { key: 'payment_status', label: 'Pay Status' }
    ]
  },
  production: {
    endpoint: '/jobs',
    columns: jobsColumns
  },
  suppliers: {
    endpoint: '/suppliers',
    columns: [
      { key: 'id',      label: 'ID',   readonly: true },
      { key: 'name',    label: 'Name' },
      { key: 'website', label: 'Website' }
    ]
  },
  catalog: {
    endpoint: '/catalog',
    columns: [
      { key: 'id',          label: 'ID',        readonly: true },
      { key: 'supplier_id', label: 'Supplier',  type: 'number' },
      { key: 'sku',         label: 'SKU' },
      { key: 'name',        label: 'Name' },
      { key: 'cost',        label: 'Cost',      type: 'number' }
    ]
  },
  purchaseOrders: {
    endpoint: '/purchase-orders',
    columns: purchaseOrdersColumns
  },
  leads: {
    endpoint: '/leads',
    columns: [
      { key: 'id',          label: 'ID',      readonly: true },
      { key: 'created_by',  label: 'Created By', type: 'number' },
      { key: 'name',        label: 'Name' },
      { key: 'email',       label: 'Email',   type: 'email' },
      { key: 'phone',       label: 'Phone' },
      { key: 'status',      label: 'Status',  options: STATUS_OPTIONS.leads },
      { key: 'created_at',  label: 'Created At', readonly: true }
    ]
  },
  deals: {
    endpoint: '/deals',
    columns: [
      { key: 'id',         label: 'ID',        readonly: true },
      { key: 'lead_name',  label: 'Lead' },
      { key: 'assigned_to',label: 'Assigned',  type: 'number' },
      { key: 'value',      label: 'Value',     type: 'number' },
      { key: 'status',     label: 'Status',    options: STATUS_OPTIONS.deals },
      { key: 'created_at', label: 'Created At',readonly: true }
    ]
  },
  crm: { /* stub */ },
  hr: {
    endpoint: '/hr',
    columns: [
      { key: 'id',        label: 'ID',     readonly: true },
      { key: 'user_id',   label: 'User ID',type: 'number' },
      { key: 'ssn',       label: 'SSN' },
      { key: 'hire_date', label: 'Hire Date' },
      { key: 'position',  label: 'Position' },
      { key: 'salary',    label: 'Salary',   type: 'number' }
    ]
  },
  finance: {
    endpoint: '/payments',
    columns: [
      { key: 'id',             label: 'ID',       readonly: true },
      { key: 'order_id',       label: 'Order ID', type: 'number' },
      { key: 'gateway',        label: 'Gateway' },
      { key: 'transaction_id', label: 'Txn ID' },
      { key: 'amount',         label: 'Amount',   type: 'number' },
      { key: 'status',         label: 'Status',   options: STATUS_OPTIONS.finance },
      { key: 'paid_at',        label: 'Paid At' },
      { key: 'created_at',     label: 'Created At', readonly: true }
    ]
  },
  reports: {
    endpoint: '/daily-transactions',
    columns: dailyTransactionsColumns
  }
};

// generic fetch helper
async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

// wire menu clicks
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

// main view loader
async function loadAdminView(view) {
  initPage(view);
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  const cfg = RESOURCES[view];
  if (!cfg || !cfg.endpoint) {
    app.innerHTML = `<h3>${view.charAt(0).toUpperCase()+view.slice(1)}</h3><p>Under construction…</p>`;
    return;
  }

  const { page, pageSize } = pageState[view];
  const offset = (page - 1) * pageSize;
  const list = await fetchJSON(`${cfg.endpoint}?limit=${pageSize}&offset=${offset}`);
  app.innerHTML = renderList(view, list, page, pageSize);
}

// render table + pagination
function renderList(resource, records, page, pageSize) {
  const { columns } = RESOURCES[resource];

  // header
  const header = columns.map(c => `<th>${c.label}</th>`).join('');
  // rows
  const rows = records.map(rec => {
    const cells = columns.map(c => `<td>${rec[c.key] ?? ''}</td>`).join('');
    return `<tr>
      ${cells}
      <td>
        <button class="btn btn-sm btn-outline-secondary me-1"
                onclick="editResource('${resource}',${rec.id})">Edit</button>
        <button class="btn btn-sm btn-outline-danger"
                onclick="deleteResource('${resource}',${rec.id})">Delete</button>
      </td>
    </tr>`;
  }).join('');

  // pagination controls
  const prevDisabled = page <= 1 ? 'disabled' : '';
  const nextDisabled = records.length < pageSize ? 'disabled' : '';
  const pageSizeOptions = PAGE_SIZES.map(sz =>
    `<option value="${sz}" ${sz===pageSize?'selected':''}>${sz}</option>`
  ).join('');

  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>${resource.charAt(0).toUpperCase()+resource.slice(1)}</h3>
      <button class="btn btn-success" onclick="newResource('${resource}')">+ New</button>
    </div>
    <table class="table table-striped">
      <thead><tr>${header}<th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <button class="btn btn-sm btn-outline-primary me-2" ${prevDisabled}
                onclick="changePage('${resource}',${page-1})">Prev</button>
        <button class="btn btn-sm btn-outline-primary" ${nextDisabled}
                onclick="changePage('${resource}',${page+1})">Next</button>
      </div>
      <div>
        <label>Page size:</label>
        <select onchange="changePageSize('${resource}',this.value)">
          ${pageSizeOptions}
        </select>
      </div>
    </div>
  `;
}

// pagination helpers
function changePage(resource, newPage) {
  pageState[resource].page = newPage;
  loadAdminView(resource);
}
function changePageSize(resource, newSize) {
  pageState[resource] = { page: 1, pageSize: Number(newSize) };
  loadAdminView(resource);
}

// render a form for New/Edit
function renderForm(resource, record = {}) {
  const { columns, endpoint } = RESOURCES[resource];
  const isEdit = Boolean(record.id);

  const fieldsHtml = columns.map(c => {
    const val = record[c.key] ?? '';
    if (c.options) {
      return `<div class="mb-3">
        <label class="form-label">${c.label}</label>
        <select id="f_${c.key}" class="form-select" ${c.readonly?'disabled':''}>
          ${c.options.map(opt =>
            `<option value="${opt}" ${opt===val?'selected':''}>${opt}</option>`
          ).join('')}
        </select>
      </div>`;
    }
    return `<div class="mb-3">
      <label class="form-label">${c.label}</label>
      <input id="f_${c.key}" class="form-control" type="${c.type||'text'}"
             value="${val}" ${c.readonly?'readonly':''} ${c.readonly?'':'required'}>
    </div>`;
  }).join('');

  app.innerHTML = `
    <h3>${isEdit?'Edit':'New'} ${resource.slice(0,-1)}</h3>
    <form id="frm_${resource}">
      ${fieldsHtml}
      <button type="submit" class="btn btn-primary">${isEdit?'Save':'Create'}</button>
      <button type="button" class="btn btn-secondary ms-2"
              onclick="loadAdminView('${resource}')">Cancel</button>
    </form>
  `;
  document.getElementById(`frm_${resource}`).onsubmit = async e => {
    e.preventDefault();
    const payload = {};
    RESOURCES[resource].columns.forEach(c => {
      if (!c.readonly) {
        let v = document.getElementById(`f_${c.key}`).value;
        if (c.type === 'number') v = parseFloat(v);
        payload[c.key] = v;
      }
    });
    const url = isEdit 
      ? `${RESOURCES[resource].endpoint}/${record.id}` 
      : RESOURCES[resource].endpoint;
    const method = isEdit ? 'PATCH' : 'POST';
    await fetchJSON(url, { method, body: JSON.stringify(payload) });
    loadAdminView(resource);
  };
}

// CRUD actions
function newResource(resource) {
  renderForm(resource);
}
async function editResource(resource, id) {
  const rec = await fetchJSON(`${RESOURCES[resource].endpoint}/${id}`);
  renderForm(resource, rec);
}
async function deleteResource(resource, id) {
  if (!confirm('Delete this item?')) return;
  await fetchJSON(`${RESOURCES[resource].endpoint}/${id}`, { method: 'DELETE' });
  loadAdminView(resource);
}

// logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// initial load
loadAdminView('users');
