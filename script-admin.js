// branding-shop-frontend/script-admin.js
console.log('🔥 script-admin.js – metadata-driven CRUD for all resources");

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
  users: { /* ... unchanged ... */ },
  roles: { /* ... unchanged ... */ },
  products: { /* ... unchanged ... */ },

  quotes: { /* ... unchanged ..., showing customer_name, customer_phone, product_name, product_code ... */ },

  orders: { /* ... unchanged ... */ },

  // original jobs endpoint
  jobs: {
    endpoint: '/jobs',
    columns: [
      { key: 'id',          label: 'ID',        readonly: true },
      { key: 'order_id',    label: 'Order ID',  type: 'number' },
      { key: 'type',        label: 'Type' },
      { key: 'status',      label: 'Status',    options: STATUS_OPTIONS.jobs },
      { key: 'department_id',label:'Dept ID',   type: 'number' },
      { key: 'assigned_to', label: 'Assigned',  type: 'number' },
      { key: 'qty',         label: 'Qty',       type: 'number' },
      { key: 'start_date',  label: 'Start Date' },
      { key: 'due_date',    label: 'Due Date' }
    ]
  },

  // alias "production" to jobs
  production: { 
    endpoint: '/jobs',
    columns: [ ...this.jobs.columns ] 
  },

  suppliers: { /* ... unchanged ... */ },
  catalog:   { /* ... unchanged ... */ },

  'purchase-orders': {
    endpoint: '/purchase-orders',
    columns: [
      { key: 'id',         label: 'ID',       readonly: true },
      { key: 'supplier_id',label: 'Supplier', type: 'number' },
      { key: 'created_at', label: 'Created',  readonly: true },
      { key: 'status',     label: 'Status',   options: STATUS_OPTIONS['purchase-orders'] }
    ]
  },

  // alias "purchaseOrders" to the hyphenated key
  purchaseOrders: { 
    endpoint: '/purchase-orders',
    columns: [ ...this['purchase-orders'].columns ]
  },

  leads: { /* ... unchanged ... */ },
  deals: { /* ... unchanged ... */ },
  crm:   { /* stub */ },
  hr:    { /* ... unchanged ... */ },
  finance:{ /* ... unchanged ... */ },

  // wire "reports" to daily transactions
  reports: {
    endpoint: '/daily-transactions',
    columns: [
      { key: 'id',               label: 'ID',               readonly: true },
      { key: 'date',             label: 'Date' },
      { key: 'start_of_day_cash',label: 'Start Cash',      type: 'number' },
      { key: 'payments_received',label: 'Received',        type: 'number' },
      { key: 'expenses_paid',    label: 'Expenses',        type: 'number' },
      { key: 'bank_deposit',     label: 'Bank Deposit',    type: 'number' },
      { key: 'end_of_day_cash',  label: 'End Cash',        type: 'number' },
      { key: 'updated_by',       label: 'Updated By',      type: 'number' },
      { key: 'updated_at',       label: 'Updated At',      readonly: true }
    ]
  }
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

// --- generic list renderer, form renderer, CRUD actions, logout, initial load ---
/* ... copy over the rest of your existing functions verbatim ... */

loadAdminView('users');
