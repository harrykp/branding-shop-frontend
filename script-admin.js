// branding-shop-frontend/script-admin.js
console.log('🔥 script-admin.js – metadata‐driven CRUD with search, pagination & sorting');

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
    state[res] = {
      page: 1,
      pageSize: 10,
      search: '',
      sortKey: null,
      sortDir: 'asc',
      _lastRecords: []
    };
  }
}

// --- status options per resource ---
const STATUS_OPTIONS = {
  users: [], roles: [], products: [],
  quotes: ['pending','approved','rejected','cancelled'],
  orders: ['new','processing','shipped','delivered','cancelled'],
  jobs: ['queued','in_progress','finished','cancelled'],
  suppliers: [], catalog: [],
  'purchase-orders': ['pending','placed','received','cancelled'],
  purchaseOrders: ['pending','placed','received','cancelled'],
  leads: ['new','contacted','qualified','lost'],
  deals: ['qualified','won','lost'],
  crm: [], hr: [],
  finance: ['pending','completed','failed','refunded'],
  reports: []
};

// --- reusable column sets ---
const jobsColumns = [
  { key: 'id',           label: 'ID',          readonly: true },
  { key: 'order_id',     label: 'Order ID',    type: 'number' },
  { key: 'type',         label: 'Type' },
  { key: 'status',       label: 'Status',      options: STATUS_OPTIONS.jobs },
  { key: 'department_id',label: 'Dept ID',     type: 'number' },
  { key: 'assigned_to',  label: 'Assigned To', type: 'number' },
  { key: 'qty',          label: 'Qty',         type: 'number' },
  { key: 'start_date',   label: 'Start Date' },
  { key: 'due_date',     label: 'Due Date' }
];

const purchaseOrdersColumns = [
  { key: 'id',          label: 'ID',         readonly: true },
  { key: 'supplier_id', label: 'Supplier',   type: 'number' },
  { key: 'created_at',  label: 'Created At', readonly: true },
  { key: 'status',      label: 'Status',     options: STATUS_OPTIONS.purchaseOrders }
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

// --- define every resource, its API path, and fields to show/edit ---
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
  pricingRules: { 
    endpoint: '/pricing-rules', 
    columns: [ 
      { key: 'id',                  label: 'ID',           readonly: true }, 
      { key: 'name',                label: 'Name' }, 
      { key: 'product_category_id', label: 'Category ID',  type: 'number' }, 
      { key: 'category_name',       label: 'Category' }, 
      { key: 'rule_type',           label: 'Rule Type' }, 
      { key: 'min_qty',             label: 'Min Qty',      type: 'number' }, 
      { key: 'max_qty',             label: 'Max Qty',      type: 'number' }, 
      { key: 'unit_price',          label: 'Unit Price',   type: 'number' }, 
      { key: 'created_at',          label: 'Created At',   readonly: true }, 
      { key: 'updated_at',          label: 'Updated At',   readonly: true } 
    ] 
  },
  quotes: {
    endpoint: '/quotes',
    columns: [
      { key: 'id',             label: 'ID',          readonly: true },
      { key: 'customer_id',    label: 'Customer ID', type: 'number' },
      { key: 'customer_name',  label: 'Customer' },
      { key: 'customer_phone', label: 'Phone' },
      { key: 'product_id',     label: 'Product ID',  type: 'number' },
      { key: 'product_name',   label: 'Product' },
      { key: 'quantity',       label: 'Quantity',    type: 'number' },
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
      { key: 'user_id',        label: 'Customer ID', type: 'number' },
      { key: 'quote_id',       label: 'Quote ID',    type: 'number' },
      { key: 'total',          label: 'Total',       type: 'number' },
      { key: 'status',         label: 'Status',      options: STATUS_OPTIONS.orders },
      { key: 'placed_at',      label: 'Placed At',   readonly: true },
      { key: 'payment_status', label: 'Pay Status' }
    ]
  },
  jobs: {
    endpoint: '/jobs',
    columns: jobsColumns
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
  'purchase-orders': {
    endpoint: '/purchase-orders',
    columns: purchaseOrdersColumns
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
      { key: 'lead_id',    label: 'Lead ID',   type: 'number' },
      { key: 'assigned_to',label: 'Assigned To', type: 'number' },
      { key: 'value',      label: 'Value',     type: 'number' },
      { key: 'status',     label: 'Status',    options: STATUS_OPTIONS.deals },
      { key: 'created_at', label: 'Created At',readonly: true }
    ]
  },
  crm: { /* stub until needed */ },
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

// --- generic fetch helper ---
async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

// --- wire menu clicks ---
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

// --- main view loader ---
async function loadAdminView(view) {
  initState(view);
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  const cfg = RESOURCES[view];
  if (!cfg || !cfg.endpoint) {
    app.innerHTML = `<h3>${view.charAt(0).toUpperCase() + view.slice(1)}</h3>
                     <p>Under construction…</p>`;
    return;
  }
  const list = await fetchJSON(cfg.endpoint);
  state[view]._lastRecords = list;
  renderList(view, list);
}

// --- render table + controls ---
function renderList(resource, records) {
  const { columns } = RESOURCES[resource];
  const s = state[resource];

  // 1) apply search
  let arr = records.filter(rec =>
    s.search === '' ||
    Object.values(rec).some(v =>
      String(v).toLowerCase().includes(s.search.toLowerCase())
    )
  );

  // 2) apply sort
  if (s.sortKey) {
    arr = [...arr].sort((a,b) => {
      const va = a[s.sortKey], vb = b[s.sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (!isNaN(va) && !isNaN(vb)) {
        return (va - vb)*(s.sortDir==='asc'?1:-1);
      }
      return String(va).localeCompare(vb)*(s.sortDir==='asc'?1:-1);
    });
  }

  // 3) paginate
  const total = arr.length;
  const totalPages = Math.max(1, Math.ceil(total / s.pageSize));
  s.page = Math.min(s.page, totalPages);
  const start = (s.page-1)*s.pageSize;
  const pageRecs = arr.slice(start, start + s.pageSize);

  // toolbar: search + new
  const toolbar = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="input-group" style="width:250px">
        <span class="input-group-text">🔍</span>
        <input type="text"
               class="form-control"
               placeholder="Search…"
               value="${s.search}"
               oninput="onSearch('${resource}',this.value)">
        <button
          class="btn btn-outline-secondary"
          type="button"
          title="Clear"
          onclick="onSearch('${resource}','')"
        >✖</button>
      </div>
      <button class="btn btn-success" onclick="newResource('${resource}')">
        + New
      </button>
    </div>`;

  // header with sort arrows
  const header = columns.map(c => {
    const arrow = s.sortKey===c.key
      ? (s.sortDir==='asc'?' ▲':' ▼')
      : '';
    return `<th style="cursor:pointer"
                onclick="onSort('${resource}','${c.key}')">
              ${c.label}${arrow}
            </th>`;
  }).join('');

  // rows
  const rows = pageRecs.map(rec => {
    const cells = columns.map(c =>
      `<td>${rec[c.key]!=null ? rec[c.key] : ''}</td>`
    ).join('');
    return `<tr>${cells}
      <td>
        <button class="btn btn-sm btn-outline-secondary me-1"
                onclick="editResource('${resource}',${rec.id})">
          Edit
        </button>
        <button class="btn btn-sm btn-outline-danger"
                onclick="deleteResource('${resource}',${rec.id})">
          Delete
        </button>
      </td>
    </tr>`;
  }).join('');

  // pagination controls
  const prevD = s.page<=1?'disabled':'';
  const nextD = s.page>=totalPages?'disabled':'';
  const sizeOpts = PAGE_SIZES.map(sz =>
    `<option value="${sz}" ${sz===s.pageSize?'selected':''}>${sz}</option>`
  ).join('');
  const pager = `
    <div class="d-flex justify-content-between align-items-center mt-2">
      <div>
        <button class="btn btn-sm btn-outline-primary me-2" ${prevD}
                onclick="changePage('${resource}',${s.page-1})">
          Prev
        </button>
        <span>Page ${s.page} of ${totalPages}</span>
        <button class="btn btn-sm btn-outline-primary ms-2" ${nextD}
                onclick="changePage('${resource}',${s.page+1})">
          Next
        </button>
      </div>
      <div class="d-flex align-items-center">
        <label class="me-2 mb-0">Page size:</label>
        <select class="form-select form-select-sm" style="width:70px"
                onchange="changePageSize('${resource}',this.value)">
          ${sizeOpts}
        </select>
      </div>
    </div>`;

  app.innerHTML = `
    ${toolbar}
    <table class="table table-striped">
      <thead><tr>${header}<th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${pager}
  `;
}

// --- control handlers ---
function onSearch(resource, text) {
  state[resource].search = text;
  state[resource].page = 1;
  renderList(resource, state[resource]._lastRecords);
}
function onSort(resource, key) {
  const s = state[resource];
  if (s.sortKey===key) {
    s.sortDir = s.sortDir==='asc'?'desc':'asc';
  } else {
    s.sortKey = key;
    s.sortDir = 'asc';
  }
  renderList(resource, state[resource]._lastRecords);
}
function changePage(resource, pg) {
  state[resource].page = pg;
  renderList(resource, state[resource]._lastRecords);
}
function changePageSize(resource, sz) {
  state[resource].pageSize = Number(sz);
  state[resource].page = 1;
  renderList(resource, state[resource]._lastRecords);
}

// --- form renderer & CRUD actions ---
function renderForm(resource, record = {}) {
  const { columns, endpoint } = RESOURCES[resource];
  const isEdit = Boolean(record.id);
  const fields = columns.map(c => {
    const val = record[c.key] != null ? record[c.key] : '';
    if (c.options) {
      return `
        <div class="mb-3">
          <label class="form-label">${c.label}</label>
          <select id="f_${c.key}" class="form-select" ${c.readonly ? 'disabled' : ''}>
            ${c.options.map(opt => `
              <option value="${opt}" ${opt===val?'selected':''}>${opt}</option>
            `).join('')}
          </select>
        </div>`;
    }
    return `
      <div class="mb-3">
        <label class="form-label">${c.label}</label>
        <input id="f_${c.key}"
               class="form-control"
               type="${c.type||'text'}"
               value="${val}"
               ${c.readonly?'readonly':''}
               ${c.readonly?'':'required'} />
      </div>`;
  }).join('');
  app.innerHTML = `
    <h3>${isEdit?'Edit':'New'} ${resource.slice(0,-1)}</h3>
    <form id="frm_${resource}">
      ${fields}
      <button type="submit" class="btn btn-primary">${isEdit?'Save':'Create'}</button>
      <button type="button" class="btn btn-secondary ms-2"
              onclick="loadAdminView('${resource}')">Cancel</button>
    </form>
  `;
  document.getElementById(`frm_${resource}`).onsubmit = async e => {
    e.preventDefault();
    const payload = {};
    columns.forEach(c => {
      if (!c.readonly) {
        let v = document.getElementById(`f_${c.key}`).value;
        if (c.type==='number') v = parseFloat(v);
        payload[c.key] = v;
      }
    });
    const url    = isEdit ? `${endpoint}/${record.id}` : endpoint;
    const method = isEdit ? 'PATCH' : 'POST';
    try {
      await fetchJSON(url, { method, body: JSON.stringify(payload) });
      loadAdminView(resource);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };
}

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

// --- logout & initial load ---
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}
loadAdminView('users');
