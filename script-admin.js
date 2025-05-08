// branding-shop-frontend/script-admin.js
console.log('🔥 script-admin.js – metadata-driven CRUD for all resources');

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

// --- global status options per resource ---
const STATUS_OPTIONS = {
  users: [],
  roles: [],
  products: [],
  quotes: ['pending','approved','rejected','cancelled'],
  orders: ['new','processing','shipped','delivered','cancelled'],
  jobs: ['queued','in_progress','finished','cancelled'],
  suppliers: [],
  catalog: [],
  'purchase-orders': ['pending','placed','received','cancelled'],
  leads: ['new','contacted','qualified','lost'],
  deals: ['qualified','won','lost'],
  crm: [],
  hr: [],
  finance: ['pending','completed','failed','refunded'],
  reports: []
};

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

  // ← updated quotes: show names & codes instead of IDs
  quotes: {
    endpoint: '/quotes',
    columns: [
      { key: 'id',              label: 'ID',             readonly: true },
      { key: 'customer_name',   label: 'Customer',       readonly: true },
      { key: 'customer_phone',  label: 'Phone',          readonly: true },
      { key: 'product_name',    label: 'Product',        readonly: true },
      { key: 'product_code',    label: 'Code',           readonly: true },
      { key: 'quantity',        label: 'Quantity',       type: 'number' },
      { key: 'unit_price',      label: 'Unit Price',     type: 'number' },
      { key: 'total',           label: 'Total',          type: 'number', readonly: true },
      { key: 'status',          label: 'Status',         options: STATUS_OPTIONS.quotes },
      { key: 'created_at',      label: 'Created At',     readonly: true }
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
    columns: [
      { key: 'id',            label: 'ID',        readonly: true },
      { key: 'order_id',      label: 'Order ID',  type: 'number' },
      { key: 'type',          label: 'Type' },
      { key: 'status',        label: 'Status',    options: STATUS_OPTIONS.jobs },
      { key: 'department_id', label: 'Dept ID',   type: 'number' },
      { key: 'assigned_to',   label: 'Assigned',  type: 'number' },
      { key: 'qty',           label: 'Qty',       type: 'number' },
      { key: 'start_date',    label: 'Start Date' },
      { key: 'due_date',      label: 'Due Date' }
    ]
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
    columns: [
      { key: 'id',          label: 'ID',       readonly: true },
      { key: 'supplier_id', label: 'Supplier', type: 'number' },
      { key: 'created_at',  label: 'Created',  readonly: true },
      { key: 'status',      label: 'Status',   options: STATUS_OPTIONS['purchase-orders'] }
    ]
  },

  leads: {
    endpoint: '/leads',
    columns: [
      { key: 'id',         label: 'ID',         readonly: true },
      { key: 'created_by', label: 'Created By', type: 'number' },
      { key: 'name',       label: 'Name' },
      { key: 'email',      label: 'Email',      type: 'email' },
      { key: 'phone',      label: 'Phone' },
      { key: 'status',     label: 'Status',     options: STATUS_OPTIONS.leads },
      { key: 'created_at', label: 'Created At', readonly: true }
    ]
  },

  deals: {
    endpoint: '/deals',
    columns: [
      { key: 'id',          label: 'ID',        readonly: true },
      { key: 'lead_id',     label: 'Lead ID',   type: 'number' },
      { key: 'assigned_to', label: 'Assigned',  type: 'number' },
      { key: 'value',       label: 'Value',     type: 'number' },
      { key: 'status',      label: 'Status',    options: STATUS_OPTIONS.deals },
      { key: 'created_at',  label: 'Created At',readonly: true }
    ]
  },

  crm: { /* stub until you wire /crm if desired */ },

  hr: {
    endpoint: '/hr',
    columns: [
      { key: 'id',         label: 'ID',     readonly: true },
      { key: 'user_id',    label: 'User ID',type: 'number' },
      { key: 'ssn',        label: 'SSN' },
      { key: 'hire_date',  label: 'Hire Date' },
      { key: 'position',   label: 'Position' },
      { key: 'salary',     label: 'Salary',   type: 'number' }
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

  reports: { /* stub until you wire /sales, /taxes, etc. */ }
};

// --- generic fetch helper ---
async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  const text = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
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
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  const cfg = RESOURCES[view];
  if (cfg && cfg.endpoint) {
    const list = await fetchJSON(cfg.endpoint);
    app.innerHTML = renderList(view, list);
  } else {
    app.innerHTML = `<h3>${view.charAt(0).toUpperCase()+view.slice(1)}</h3>
                     <p>Under construction…</p>`;
  }
}

// --- generic list renderer ---
function renderList(resource, records) {
  const { columns } = RESOURCES[resource];
  const header = columns.map(c => `<th>${c.label}</th>`).join('');
  const rows = records.map(rec => {
    const cells = columns.map(c =>
      `<td>${rec[c.key] != null ? rec[c.key] : ''}</td>`
    ).join('');
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

  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>${resource.charAt(0).toUpperCase()+resource.slice(1)}</h3>
      <button class="btn btn-success" onclick="newResource('${resource}')">+ New</button>
    </div>
    <table class="table table-striped">
      <thead><tr>${header}<th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// --- generic form renderer ---
function renderForm(resource, record = {}) {
  const { columns, endpoint } = RESOURCES[resource];
  const isEdit = Boolean(record.id);

  const fields = columns.map(c => {
    const val = record[c.key] != null ? record[c.key] : '';
    if (c.options) {
      return `
        <div class="mb-3">
          <label class="form-label">${c.label}</label>
          <select id="f_${c.key}" class="form-select" ${c.readonly?'disabled':''}>
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
        if (c.type === 'number') v = parseFloat(v);
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

// --- CRUD actions ---
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

// --- logout ---
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// --- initial load ---
loadAdminView('users');
