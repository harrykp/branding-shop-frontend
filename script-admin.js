// branding-shop-frontend/script-admin.js

console.log('🔥 script-admin.js – metadata-driven CRUD with search, pagination & sorting');

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

// Bootstrap modal instance
const jobModal = new bootstrap.Modal(document.getElementById('jobModal'));

// --- pagination sizes and state per resource ---
const PAGE_SIZES = [5, 10, 20, 50];
const state = {};
function initState(resource) {
  if (!state[resource]) {
    state[resource] = {
      page: 1,
      pageSize: 10,
      search: '',
      sortKey: null,
      sortDir: 'asc',
      filterStatus: '',
      _lastRecords: []
    };
  }
}

// --- status options per resource ---
const STATUS_OPTIONS = {
  users: [],
  roles: [],
  products: [],
  pricingRules: [],
  quotes: ['pending','approved','rejected','cancelled'],
  orders: ['new','processing','shipped','delivered','cancelled'],
  jobs: ['queued','in_progress','finished','cancelled'],
  suppliers: [],
  catalog: [],
  'purchase-orders': ['pending','placed','received','cancelled'],
  purchaseOrders: ['pending','placed','received','cancelled'],
  leads: ['new','contacted','qualified','lost'],
  deals: ['qualified','won','lost'],
  hr: [],
  finance: ['pending','completed','failed','refunded'],
  reports: []
};

// --- reusable column sets for jobs ---
const jobsColumns = [
  { key: 'id', label: 'ID', readonly: true },
  { key: 'type', label: 'Type' },
  { key: 'qty', label: 'Qty', type: 'number' },
  { key: 'assigned_to', label: 'Assigned To', type: 'number' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'status', label: 'Status', options: STATUS_OPTIONS.jobs },
  { key: 'pct_complete', label: '% Complete', type: 'number' }
];

// --- resource definitions ---
const RESOURCES = {
  users: {
    endpoint: '/users',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone_number', label: 'Phone' },
      { key: 'department_id', label: 'Dept ID', type: 'number' }
    ]
  },
  roles: {
    endpoint: '/roles',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'name', label: 'Role Name' }
    ]
  },
  products: {
    endpoint: '/products',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'category_id', label: 'Category ID', type: 'number' }
    ]
  },
  pricingRules: {
    endpoint: '/pricing-rules',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'name', label: 'Name' },
      { key: 'product_category_id', label: 'Category ID', type: 'number' },
      { key: 'category_name', label: 'Category' },
      { key: 'rule_type', label: 'Rule Type' },
      { key: 'min_qty', label: 'Min Qty', type: 'number' },
      { key: 'max_qty', label: 'Max Qty', type: 'number' },
      { key: 'unit_price', label: 'Unit Price', type: 'number' },
      { key: 'created_at', label: 'Created At', readonly: true },
      { key: 'updated_at', label: 'Updated At', readonly: true }
    ]
  },
  quotes: {
    endpoint: '/quotes',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'customer_id', label: 'Customer ID', type: 'number' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'product_id', label: 'Product ID', type: 'number' },
      { key: 'product_name', label: 'Product' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'unit_price', label: 'Unit Price', type: 'number' },
      { key: 'total', label: 'Total', type: 'number', readonly: true },
      { key: 'status', label: 'Status', options: STATUS_OPTIONS.quotes },
      { key: 'created_at', label: 'Created At', readonly: true }
    ]
  },
  orders: {
    endpoint: '/orders',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'quote_id', label: 'Quote ID', type: 'number' },
      { key: 'total', label: 'Total', type: 'number' },
      { key: 'status', label: 'Status', options: STATUS_OPTIONS.orders },
      { key: 'placed_at', label: 'Placed At', readonly: true },
      { key: 'payment_status', label: 'Pay Status' }
    ]
  },
  deals: {
    endpoint: '/deals',
    idKey: 'deal_id',
    columns: [
      { key: 'deal_id', label: 'Deal ID', readonly: true },
      { key: 'lead_id', label: 'Lead ID', type: 'number' },
      { key: 'lead_name', label: 'Lead Name' },
      { key: 'product_id', label: 'Product ID', type: 'number' },
      { key: 'product', label: 'Product Name' },
      { key: 'quote_total', label: 'Quote Total', type: 'number' },
      { key: 'deal_value', label: 'Deal Value', type: 'number' },
      { key: 'deal_status', label: 'Status', options: STATUS_OPTIONS.deals },
      { key: 'deal_date', label: 'Deal Date', readonly: true }
    ]
  },
  jobs: { endpoint: '/jobs', columns: jobsColumns },
  production: { endpoint: '/jobs', columns: jobsColumns, statusKey: 'status' },
  suppliers: {
    endpoint: '/suppliers',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'name', label: 'Name' },
      { key: 'website', label: 'Website' }
    ]
  },
  catalog: {
    endpoint: '/catalog',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'supplier_id', label: 'Supplier', type: 'number' },
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Name' },
      { key: 'cost', label: 'Cost', type: 'number' }
    ]
  },
  'purchase-orders': {
    endpoint: '/purchase-orders',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'supplier_id', label: 'Supplier', type: 'number' },
      { key: 'status', label: 'Status', options: STATUS_OPTIONS['purchase-orders'] }
    ]
  },
  leads: {
    endpoint: '/leads',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'status', label: 'Status', options: STATUS_OPTIONS.leads }
    ]
  },
  hr: {
    endpoint: '/hr',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'user_id', label: 'User ID', type: 'number' },
      { key: 'position', label: 'Position' },
      { key: 'salary', label: 'Salary', type: 'number' }
    ]
  },
  finance: {
    endpoint: '/payments',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'order_id', label: 'Order ID', type: 'number' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'status', label: 'Status', options: STATUS_OPTIONS.finance },
      { key: 'paid_at', label: 'Paid At' }
    ]
  },
  reports: {
    endpoint: '/daily-transactions',
    columns: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'date', label: 'Date' },
      { key: 'payments_received', label: 'Received', type: 'number' },
      { key: 'expenses_paid', label: 'Expenses', type: 'number' },
      { key: 'end_of_day_cash', label: 'End Cash', type: 'number' }
    ]
  }
};

// --- generic fetch helper ---
async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

// --- wire nav clicks ---
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

// --- load view ---
async function loadAdminView(view) {
  initState(view);
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  if (view === 'production') {
    const data = await fetchJSON(RESOURCES.production.endpoint);
    state.production._lastRecords = data;
    return renderProduction();
  }
  // ... (generic CRUD for other views) ...
}

// --- render Production board ---
function renderProduction() {
  const s = state.production;
  let arr = s._lastRecords
    .filter(j => !s.search || Object.values(j).some(v => String(v).toLowerCase().includes(s.search.toLowerCase())));
  if (s.filterStatus) arr = arr.filter(j => j.status === s.filterStatus);
  if (s.sortKey) {
    arr.sort((a,b) => {
      const va = a[s.sortKey], vb = b[s.sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      return (isNaN(va) ? String(va).localeCompare(vb) : va - vb) * (s.sortDir==='asc'?1:-1);
    });
  }
  const total = arr.length;
  const pages = Math.max(1, Math.ceil(total / s.pageSize));
  s.page = Math.min(s.page, pages);
  const page = arr.slice((s.page-1)*s.pageSize, (s.page-1)*s.pageSize + s.pageSize);

  let html = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <input class="form-control me-2" style="width:250px" placeholder="Search…"
             value="${s.search}" oninput="onSearch('production',this.value)">
      <select class="form-select me-2" style="width:150px"
              onchange="onFilter('production',this.value)">
        <option value="">All Statuses</option>
        ${STATUS_OPTIONS.jobs.map(o => `<option value="${o}"${s.filterStatus===o?' selected':''}>${o}</option>`).join('')}
      </select>
      <button class="btn btn-success" onclick="openJobModal()">+ New Job</button>
    </div>`;

  ['queued','in_progress','finished','cancelled'].forEach(status => {
    const group = page.filter(j => j.status === status);
    if (!group.length) return;
    html += `<h5 class="mt-4 text-${
      { queued:'secondary', in_progress:'primary', finished:'success', cancelled:'danger' }[status]
    }">${status.replace('_',' ')}</h5>
      <table class="table table-bordered">
        <thead>
          <tr>${jobsColumns.map(c => `<th>${c.label}</th>`).join('')}
              <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${group.map(j => {
            const pct = j.qty ? Math.round((j.qty_completed||0)/j.qty*100) : 0;
            return `<tr>
              ${jobsColumns.map(c => {
                if (c.key==='pct_complete') {
                  return `<td>
                    <div class="progress">
                      <div class="progress-bar" role="progressbar"
                           style="width:${pct}%"
                           aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
                        ${pct}%
                      </div>
                    </div>
                  </td>`;
                }
                return `<td>${j[c.key] ?? ''}</td>`;
              }).join('')}
              <td>
                <button class="btn btn-sm btn-outline-secondary me-1"
                        onclick="openJobModal(${j.id})">Edit</button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  });

  html += `
    <div class="d-flex justify-content-between align-items-center mt-3">
      <button class="btn btn-sm btn-outline-primary"${s.page<=1?' disabled':''}
              onclick="changePage('production',${s.page-1})">Prev</button>
      <span>Page ${s.page} of ${pages}</span>
      <button class="btn btn-sm btn-outline-primary"${s.page>=pages?' disabled':''}
              onclick="changePage('production',${s.page+1})">Next</button>
      <select class="form-select form-select-sm" style="width:70px"
              onchange="changePageSize('production',this.value)">
        ${PAGE_SIZES.map(sz => `<option value="${sz}"${sz===s.pageSize?' selected':''}>${sz}</option>`).join('')}
      </select>
    </div>`;

  app.innerHTML = html;
}

// --- open modal for new/edit ---
function openJobModal(id) {
  document.getElementById('jobModalLabel').textContent = id ? 'Edit Job' : 'New Job';
  if (!id) {
    ['job-id','job-type','job-qty','job-assigned','job-due'].forEach(f => document.getElementById(f).value = '');
  } else {
    const job = state.production._lastRecords.find(j => j.id === id);
    document.getElementById('job-id').value       = job.id;
    document.getElementById('job-type').value     = job.type;
    document.getElementById('job-qty').value      = job.qty;
    document.getElementById('job-assigned').value = job.assigned_to || '';
    document.getElementById('job-due').value      = job.due_date?.split('T')[0] || '';
  }
  jobModal.show();
}

// --- save from modal ---
document.getElementById('save-job').addEventListener('click', async () => {
  const id       = document.getElementById('job-id').value;
  const payload  = {
    type:        document.getElementById('job-type').value,
    qty:         +document.getElementById('job-qty').value,
    assigned_to:+document.getElementById('job-assigned').value||null,
    due_date:    document.getElementById('job-due').value||null
  };
  const url      = id ? `/jobs/${id}` : '/jobs';
  const method   = id ? 'PATCH'    : 'POST';
  await fetchJSON(url, { method, body: JSON.stringify(payload) });
  jobModal.hide();
  loadAdminView('production');
});

// --- table controls reused ---
function onSearch(r,t)   { state[r].search       = t; state[r].page=1; renderProduction(); }
function onFilter(r,s)   { state[r].filterStatus = s; state[r].page=1; renderProduction(); }
function changePage(r,p) { state[r].page    = p; renderProduction(); }
function changePageSize(r,s){ state[r].pageSize=Number(s); state[r].page=1; renderProduction(); }

// --- logout & initial load ---
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}
loadAdminView('users');
