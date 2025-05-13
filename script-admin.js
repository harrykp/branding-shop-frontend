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

// --- reusable column sets for jobs ---
const jobsColumns = [
  { key: 'id',             label: 'ID',           readonly: true },
  { key: 'deal_id',        label: 'Deal ID',      type: 'number' },
  { key: 'deal_value',     label: 'Deal Value',   type: 'number' },
  { key: 'customer_id',    label: 'Cust. ID',     type: 'number' },
  { key: 'customer_name',  label: 'Customer' },
  { key: 'customer_phone', label: 'Phone' },
  { key: 'order_id',       label: 'Order ID',     type: 'number' },
  { key: 'order_total',    label: 'Order Value',  type: 'number' },
  { key: 'payment_status', label: 'Pay Status' },
  { key: 'product_id',     label: 'Prod. ID',     type: 'number' },
  { key: 'product_name',   label: 'Product' },
  { key: 'product_code',   label: 'SKU' },
  { key: 'quote_qty',      label: 'Qty Ordered',  type: 'number' },
  { key: 'qty_completed',  label: 'Qty Completed',type: 'number' },
  { key: 'pct_complete',   label: '% Complete',   type: 'number' },
  { key: 'start_date',     label: 'Start Date' },
  { key: 'due_date',       label: 'Due Date' },
  { key: 'sales_rep',      label: 'Sales Rep' },
  { key: 'department',     label: 'Dept' },
  { key: 'completed_value',label: 'Paid',         type: 'number' },
  { key: 'balance_unpaid', label: 'Balance',      type: 'number' },
  { key: 'comments',       label: 'Comments' },
  { key: 'updated_by_name',label: 'Updated By' },
  { key: 'updated_at',     label: 'Updated At',   readonly: true },
  { key: 'job_status',     label: 'Status',       options: STATUS_OPTIONS.jobs }
];

// --- resource definitions ---
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
      { key: 'quote_id',       label: 'Quote ID',    type: 'number' },
      { key: 'total',          label: 'Total',       type: 'number' },
      { key: 'status',         label: 'Status',      options: STATUS_OPTIONS.orders },
      { key: 'placed_at',      label: 'Placed At',   readonly: true },
      { key: 'payment_status', label: 'Pay Status' }
    ]
  },
  leads: {
    endpoint: '/leads',
    columns: [
      { key: 'id',          label: 'ID',      readonly: true },
      { key: 'name',        label: 'Name' },
      { key: 'email',       label: 'Email',   type: 'email' },
      { key: 'status',      label: 'Status',  options: STATUS_OPTIONS.leads }
    ]
  },
  deals: {
    endpoint: '/deals',
    idKey: 'deal_id',
    columns: [
      { key: 'deal_id',     label: 'Deal ID',     readonly: true, type: 'number' },
      { key: 'lead_id',     label: 'Lead ID',     type: 'number' },
      { key: 'lead_name',   label: 'Lead Name' },
      { key: 'product_id',  label: 'Product ID',  type: 'number' },
      { key: 'product',     label: 'Product Name' },
      { key: 'quote_total', label: 'Quote Total', type: 'number' },
      { key: 'deal_value',  label: 'Deal Value',  type: 'number' },
      { key: 'deal_status', label: 'Status',      options: STATUS_OPTIONS.deals },
      { key: 'deal_date',   label: 'Deal Date',   readonly: true }
    ]
  },
  jobs:       { endpoint: '/jobs',      columns: jobsColumns },
  production: { endpoint: '/jobs',      columns: jobsColumns, statusKey: 'job_status' },
  suppliers:  { endpoint: '/suppliers', columns: [
      { key: 'id',      label: 'ID',   readonly: true },
      { key: 'name',    label: 'Name' },
      { key: 'website', label: 'Website' }
    ]
  },
  catalog:    { endpoint: '/catalog',   columns: [
      { key: 'id',         label: 'ID',        readonly: true },
      { key: 'supplier_id',label: 'Supplier',  type: 'number' },
      { key: 'sku',        label: 'SKU' },
      { key: 'name',       label: 'Name' },
      { key: 'cost',       label: 'Cost',      type: 'number' }
    ]
  },
  'purchase-orders': {
    endpoint: '/purchase-orders',
    columns: [
      { key: 'id',          label: 'ID',       readonly: true },
      { key: 'supplier_id', label: 'Supplier', type: 'number' },
      { key: 'status',      label: 'Status',   options: STATUS_OPTIONS['purchase-orders'] }
    ]
  },
  hr:         { endpoint: '/hr',        columns: [
      { key: 'id',       label: 'ID',      readonly: true },
      { key: 'user_id',  label: 'User ID', type: 'number' },
      { key: 'position', label: 'Position' },
      { key: 'salary',   label: 'Salary',  type: 'number' }
    ]
  },
  finance:    {
    endpoint: '/payments',
    columns: [
      { key: 'id',          label: 'ID',       readonly: true },
      { key: 'order_id',    label: 'Order ID', type: 'number' },
      { key: 'amount',      label: 'Amount',   type: 'number' },
      { key: 'status',      label: 'Status',   options: STATUS_OPTIONS.finance },
      { key: 'paid_at',     label: 'Paid At' },
      { key: 'job_id',      label: 'Job ID',   type: 'number' },
      { key: 'job_status',  label: 'Job Status'}
    ]
  },
  reports:    { endpoint: '/daily-transactions', columns: [
      { key: 'id',               label: 'ID',               readonly: true },
      { key: 'date',             label: 'Date' },
      { key: 'payments_received',label: 'Received',        type: 'number' },
      { key: 'expenses_paid',    label: 'Expenses',        type: 'number' },
      { key: 'end_of_day_cash',  label: 'End Cash',        type: 'number' }
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

// --- main view loader (supports dashboard + resource views) ---
async function loadAdminView(view) {
  initState(view);
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  if (view === 'dashboard') {
    return renderDashboard();
  }
  const cfg = RESOURCES[view];
  if (!cfg || !cfg.endpoint) {
    app.innerHTML = `<h3>${view.charAt(0).toUpperCase()+view.slice(1)}</h3><p>Under construction…</p>`;
    return;
  }
  const data = await fetchJSON(cfg.endpoint);
  state[view]._lastRecords = Array.isArray(data)
    ? data
    : Array.isArray(data.jobs)
      ? data.jobs
      : [];
  renderList(view);
}

// --- render the dashboard with four Chart.js charts ---
async function renderDashboard() {
  // fetch all data in parallel
  const [deals, orders, jobs, payments] = await Promise.all([
    fetchJSON('/deals'),
    fetchJSON('/orders'),
    fetchJSON('/jobs'),
    fetchJSON('/payments'),
  ]);

  // prepare pipeline data
  const pipelineCounts = { qualified:0, won:0, lost:0 };
  deals.forEach(d => pipelineCounts[d.deal_status]++);

  // prepare revenue over time (by order.placed_at)
  const revenueMap = {};
  orders.forEach(o => {
    const date = o.placed_at.split('T')[0];
    revenueMap[date] = (revenueMap[date]||0) + parseFloat(o.total);
  });
  const revenueDates = Object.keys(revenueMap).sort();
  const revenueValues = revenueDates.map(d => revenueMap[d]);

  // jobs by status
  const jobCounts = { queued:0, in_progress:0, finished:0, cancelled:0 };
  jobs.forEach(j => jobCounts[j.job_status]++);

  // payments by gateway
  const payCounts = {};
  payments.forEach(p => payCounts[p.gateway] = (payCounts[p.gateway]||0) + 1);

  // render HTML skeleton
  app.innerHTML = `
    <h3>Dashboard</h3>
    <div class="row g-4">
      <div class="col-md-6"><canvas id="chart-pipeline"></canvas></div>
      <div class="col-md-6"><canvas id="chart-jobs"></canvas></div>
      <div class="col-md-6"><canvas id="chart-revenue"></canvas></div>
      <div class="col-md-6"><canvas id="chart-payments"></canvas></div>
    </div>
  `;

  // instantiate charts
  new Chart(document.getElementById('chart-pipeline').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(pipelineCounts).map(s => s.toUpperCase()),
      datasets: [{ data: Object.values(pipelineCounts) }]
    }
  });

  new Chart(document.getElementById('chart-jobs').getContext('2d'), {
    type: 'bar',
    data: {
      labels: Object.keys(jobCounts).map(s => s.replace('_',' ').toUpperCase()),
      datasets: [{ label: 'Jobs', data: Object.values(jobCounts) }]
    },
    options: { scales: { y: { beginAtZero:true } } }
  });

  new Chart(document.getElementById('chart-revenue').getContext('2d'), {
    type: 'line',
    data: {
      labels: revenueDates,
      datasets: [{ label: 'Revenue', data: revenueValues, fill:false }]
    },
    options: { scales: { y: { beginAtZero:true } } }
  });

  new Chart(document.getElementById('chart-payments').getContext('2d'), {
    type: 'pie',
    data: {
      labels: Object.keys(payCounts),
      datasets: [{ data: Object.values(payCounts) }]
    }
  });
}

// --- render table + toolbar ---
function renderList(resource) {
  const cfg = RESOURCES[resource];
  const cols = cfg.columns;
  const s    = state[resource];

  // filter + search
  let arr = s._lastRecords.filter(rec =>
    !s.search ||
    Object.values(rec).some(v =>
      String(v).toLowerCase().includes(s.search.toLowerCase())
    )
  );
  // status filter
  if (cfg.statusKey) {
    arr = arr.filter(rec => !s.filterStatus || rec[cfg.statusKey] === s.filterStatus);
  }
  // sort
  if (s.sortKey) {
    arr.sort((a,b) => {
      const va=a[s.sortKey], vb=b[s.sortKey];
      if (va==null) return 1;
      if (vb==null) return -1;
      if (!isNaN(va)&&!isNaN(vb)) return (va-vb)*(s.sortDir==='asc'?1:-1);
      return String(va).localeCompare(vb)*(s.sortDir==='asc'?1:-1);
    });
  }
  // paginate
  const total = arr.length;
  const pages = Math.max(1, Math.ceil(total/s.pageSize));
  s.page = Math.min(s.page,pages);
  const start = (s.page-1)*s.pageSize;
  const pageData = arr.slice(start, start+s.pageSize);

  // toolbar
  let html = `
    <div class="d-flex justify-content-between mb-3">
      <input class="form-control" style="width:250px"
             placeholder="Search…" value="${s.search}"
             oninput="onSearch('${resource}',this.value)" />`;
  if (cfg.statusKey) {
    const opts = cfg.statusKey==='job_status'
      ? STATUS_OPTIONS.jobs
      : STATUS_OPTIONS[resource]||[];
    html += `
      <select class="form-select ms-2" style="width:150px"
              onchange="onFilter('${resource}',this.value)">
        <option value="">All Statuses</option>
        ${opts.map(o=>
          `<option value="${o}"${s.filterStatus===o?' selected':''}>${o.replace('_',' ')}</option>`
        ).join('')}
      </select>`;
  }
  html += `
      <button class="btn btn-success" onclick="newResource('${resource}')">+ New</button>
    </div>`;

  // table
  html += `
    <table class="table table-striped">
      <thead><tr>
        ${cols.map(c=>
          `<th style="cursor:pointer" onclick="onSort('${resource}','${c.key}')">${c.label}</th>`
        ).join('')}
        <th>Actions</th>
      </tr></thead>
      <tbody>
        ${pageData.map(rec=>{
          const idVal = rec[cfg.idKey||'id'];
          return `
            <tr>
              ${cols.map(c=>
                `<td>${rec[c.key]!=null?rec[c.key]:''}</td>`
              ).join('')}
              <td>
                <button class="btn btn-sm btn-outline-secondary me-1"
                        onclick="editResource('${resource}',${idVal})">Edit</button>
                <button class="btn btn-sm btn-outline-danger me-1"
                        onclick="deleteResource('${resource}',${idVal})">Delete</button>
                ${
                  // Finance view: show job badge or Create Job
                  resource==='finance'
                    ? (rec.job_id
                        ? `<span class="badge bg-success">Job ${rec.job_id}</span>`
                        : `<button class="btn btn-sm btn-outline-primary"
                                    onclick="createJobForPayment(${rec.order_id})">
                             Create Job
                           </button>`
                      )
                    : ''
                }
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>
    <div class="d-flex justify-content-between align-items-center mt-2">
      <button class="btn btn-sm btn-outline-primary" ${s.page<=1?'disabled':''}
              onclick="changePage('${resource}',${s.page-1})">Prev</button>
      <span>Page ${s.page} of ${pages}</span>
      <button class="btn btn-sm btn-outline-primary" ${s.page>=pages?'disabled':''}
              onclick="changePage('${resource}',${s.page+1})">Next</button>
      <select class="form-select form-select-sm" style="width:70px"
              onchange="changePageSize('${resource}',this.value)">
        ${PAGE_SIZES.map(sz=>
          `<option value="${sz}"${sz===s.pageSize?' selected':''}>${sz}</option>`
        ).join('')}
      </select>
    </div>`;

  app.innerHTML = html;
}

// --- table controls ---
function onSearch(resource, text) {
  state[resource].search = text;
  state[resource].page = 1;
  renderList(resource);
}
function onFilter(resource, status) {
  state[resource].filterStatus = status;
  state[resource].page = 1;
  renderList(resource);
}
function onSort(resource, key) {
  const s = state[resource];
  if (s.sortKey===key) s.sortDir = s.sortDir==='asc'?'desc':'asc';
  else { s.sortKey=key; s.sortDir='asc'; }
  renderList(resource);
}
function changePage(resource, page) {
  state[resource].page = page;
  renderList(resource);
}
function changePageSize(resource, size) {
  state[resource].pageSize = Number(size);
  state[resource].page = 1;
  renderList(resource);
}

// --- manual Create Job for orphaned payments ---
async function createJobForPayment(orderId) {
  try {
    const job = await fetchJSON('/jobs', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, type: 'production', qty: 1 })
    });
    alert(`Created production job #${job.id}`);
    loadAdminView('finance');
  } catch (err) {
    alert('Create job failed: ' + err.message);
  }
}

// --- CRUD form renderer ---
function renderForm(resource, record={}) {
  const cfg = RESOURCES[resource];
  if (cfg.idKey) record.id = record[cfg.idKey];
  const isEdit = Boolean(record.id);
  let html = `<h3>${isEdit?'Edit':'New'} ${resource}</h3>
              <form id="frm_${resource}">`;
  cfg.columns.forEach(c => {
    const val = record[c.key]!=null?record[c.key]:'';
    html += `<div class="mb-3">
               <label for="f_${c.key}" class="form-label">${c.label}</label>`;
    if (c.options) {
      html += `<select id="f_${c.key}" class="form-select"${c.readonly?' disabled':''}>` +
                c.options.map(o=>`<option value="${o}"${o===val?' selected':''}>${o}</option>`).join('') +
              `</select>`;
    } else {
      html += `<input id="f_${c.key}" class="form-control" type="${c.type||'text'}"
                     value="${val}"${c.readonly?' readonly':' required'}>`;
    }
    html += `</div>`;
  });
  html += `<button type="submit" class="btn btn-primary">${isEdit?'Save':'Create'}</button>
           <button type="button" class="btn btn-secondary ms-2"
                   onclick="loadAdminView('${resource}')">Cancel</button>
           </form>`;
  app.innerHTML = html;

  document.getElementById(`frm_${resource}`).onsubmit = async e => {
    e.preventDefault();
    const payload = {};
    cfg.columns.forEach(c => {
      if (!c.readonly) {
        let v = document.getElementById(`f_${c.key}`).value;
        if (c.type==='number') v = parseFloat(v);
        payload[c.key] = v;
      }
    });
    const url = cfg.endpoint + (isEdit?`/${record.id}`:'');
    const method = isEdit?'PATCH':'POST';
    await fetchJSON(url, { method, body: JSON.stringify(payload) });
    loadAdminView(resource);
  };
}

// --- new/edit/delete/push helpers ---
async function newResource(resource) { renderForm(resource); }
async function editResource(resource, id) {
  const rec = await fetchJSON(`${RESOURCES[resource].endpoint}/${id}`);
  renderForm(resource, rec);
}
async function deleteResource(resource, id) {
  if (!confirm('Delete this item?')) return;
  await fetchJSON(`${RESOURCES[resource].endpoint}/${id}`, { method: 'DELETE' });
  loadAdminView(resource);
}
async function pushDeal(dealId) {
  if (!confirm(`Push deal #${dealId} to production?`)) return;
  const job = await fetchJSON('/jobs/push/'+dealId, { method: 'POST' });
  alert(`Created production job #${job.id}`);
  loadAdminView('production');
}

// --- logout & init ---
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

loadAdminView('users');
