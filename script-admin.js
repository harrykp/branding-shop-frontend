// frontend/script-admin.js

console.log('🔥 script-admin.js – Admin Portal');

// --- Base API Configuration ---
const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

// --- Inject Bootstrap modal for Job create/edit ---
const modalHtml = `
<div class="modal fade" id="jobModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <form id="jobForm" class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="jobModalLabel">Job</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Order ID</label>
          <input type="number" id="job-order-id" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Type</label>
          <input type="text" id="job-type" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Quantity</label>
          <input type="number" id="job-qty" class="form-control" min="1" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Assigned To (User ID)</label>
          <input type="number" id="job-assigned-to" class="form-control">
        </div>
        <div class="mb-3">
          <label class="form-label">Due Date</label>
          <input type="date" id="job-due-date" class="form-control">
        </div>
        <div class="mb-3">
          <label class="form-label">Status</label>
          <select id="job-status" class="form-select">
            <option value="queued">Queued</option>
            <option value="in_progress">In Progress</option>
            <option value="finished">Finished</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      </div>
    </form>
  </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', modalHtml);
const jobModal = new bootstrap.Modal(document.getElementById('jobModal'));
const jobForm  = document.getElementById('jobForm');

// --- State & Config ---
const PAGE_SIZES = [5, 10, 20, 50];
const STATUS_OPTIONS = {
  production: ['queued','in_progress','finished','cancelled']
  // Add other status arrays if needed
};
const state = {};
function initState(view) {
  if (!state[view]) {
    state[view] = {
      page: 1,
      pageSize: 10,
      search: '',
      filterStatus: '',
      sortKey: null,
      sortDir: 'asc',
      _lastRecords: []
    };
  }
}

// --- Column Definitions ---
const jobsColumns = [
  { key: 'id',         label: 'Job ID' },
  { key: 'order_id',   label: 'Order ID' },
  { key: 'type',       label: 'Type' },
  { key: 'qty',        label: 'Quantity' },
  { key: 'job_status', label: 'Status' },
  { key: 'assigned_to',label: 'Assigned To' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'due_date',   label: 'Due Date' },
  { key: 'finished_at',label: 'Finished At' }
];

// --- Resource Configuration ---
const RESOURCES = {
  users:      { endpoint: '/users', columns: [] },
  roles:      { endpoint: '/roles', columns: [] },
  products:   { endpoint: '/products', columns: [] },
  quotes:     { endpoint: '/quotes', columns: [] },
  orders:     { endpoint: '/orders', columns: [] },
  production: { endpoint: '/jobs', columns: jobsColumns, statusKey: 'job_status' },
  finance:    { endpoint: '/payments', columns: [] }
};

// --- Generic Fetch Helper ---
async function fetchJSON(path, opts = {}) {
  try {
    const res = await fetch(API_BASE + path, { headers, ...opts });
    const txt = await res.text();
    if (!res.ok) throw new Error(txt || res.statusText);
    return txt ? JSON.parse(txt) : [];
  } catch (err) {
    console.error(`Fetch ${path} failed:`, err);
    alert('Network error. Please try again later.');
    return [];
  }
}

// --- Navigation Wiring ---
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

// --- Main View Loader ---
async function loadAdminView(view) {
  initState(view);
  app.innerHTML = `<h3>Loading ${view.charAt(0).toUpperCase() + view.slice(1)}…</h3>`;

  const cfg = RESOURCES[view];
  if (!cfg) {
    app.innerHTML = `<h3>${view.charAt(0).toUpperCase() + view.slice(1)}</h3><p>Under construction…</p>`;
    return;
  }

  const list = await fetchJSON(cfg.endpoint);
  state[view]._lastRecords = Array.isArray(list) ? list : [];
  renderList(view, state[view]._lastRecords, cfg.columns, cfg.statusKey);
}

// --- List Renderer (search, filter, sort, paginate) ---
function renderList(view, records, columns, statusKey) {
  const s = state[view];
  let arr = records.slice();

  // search
  if (s.search) {
    arr = arr.filter(rec => Object.values(rec).some(v =>
      String(v).toLowerCase().includes(s.search.toLowerCase())
    ));
  }
  // status filter
  if (statusKey && s.filterStatus) {
    arr = arr.filter(rec => rec[statusKey] === s.filterStatus);
  }

  // sort
  if (s.sortKey) {
    arr.sort((a,b) => {
      const va = a[s.sortKey], vb = b[s.sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (!isNaN(va) && !isNaN(vb)) return (va - vb) * (s.sortDir === 'asc' ? 1 : -1);
      return String(va).localeCompare(vb) * (s.sortDir === 'asc' ? 1 : -1);
    });
  }

  // paginate
  const total = arr.length;
  const pages = Math.max(1, Math.ceil(total / s.pageSize));
  s.page = Math.min(s.page, pages);
  const start = (s.page - 1) * s.pageSize;
  const pageRecs = arr.slice(start, start + s.pageSize);

  // toolbar
  let toolbar = `<div class="d-flex justify-content-between mb-3">` +
    `<div class="input-group" style="width:350px">` +
      `<span class="input-group-text">🔍</span>` +
      `<input type="text" class="form-control" placeholder="Search…" value="${s.search}" oninput="onSearch('${view}',this.value)">`;

  if (statusKey) {
    toolbar += `<select class="form-select ms-2" style="width:150px" onchange="onFilter('${view}',this.value)">` +
      `<option value="">All Statuses</option>` +
      STATUS_OPTIONS[view].map(opt =>
        `<option value="${opt}" ${s.filterStatus === opt ? 'selected' : ''}>${opt.replace('_',' ')}</option>`
      ).join('') +
      `</select>`;
  }

  toolbar += `</div>` +
    `<button class="btn btn-success" onclick="newResource('${view}')">+ New</button>` +
  `</div>`;

  // header
  const header = columns.map(c => {
    const arrow = s.sortKey === c.key ? (s.sortDir === 'asc' ? ' ▲' : ' ▼') : '';
    return `<th style="cursor:pointer" onclick="onSort('${view}','${c.key}')">${c.label}${arrow}</th>`;
  }).join('');

  // rows
  const idKey = columns.find(c => c.key === 'id') ? 'id' : Object.keys(records[0] || {})[0];
  const rowsHtml = pageRecs.map(rec => {
    const cells = columns.map(c => `<td>${rec[c.key] != null ? rec[c.key] : ''}</td>`).join('');
    return `<tr>${cells}<td>` +
      `<button class="btn btn-sm btn-outline-secondary me-1" onclick="editResource('${view}',${rec[idKey]})">Edit</button>` +
      `<button class="btn btn-sm btn-outline-danger" onclick="deleteResource('${view}',${rec[idKey]})">Delete</button>` +
      `</td></tr>`;
  }).join('');

  // pagination
  const prev = s.page <= 1 ? 'disabled' : '';
  const next = s.page >= pages ? 'disabled' : '';
  const opts = PAGE_SIZES.map(sz => `<option value="${sz}" ${sz === s.pageSize ? 'selected' : ''}>${sz}</option>`).join('');
  const pager = `<div class="d-flex justify-content-between align-items-center mt-2">` +
    `<div>` +
      `<button class="btn btn-sm btn-outline-primary me-2" ${prev} onclick="onPage('${view}',${s.page-1})">Prev</button>` +
      `<span>Page ${s.page} of ${pages}</span>` +
      `<button class="btn btn-sm btn-outline-primary ms-2" ${next} onclick="onPage('${view}',${s.page+1})">Next</button>` +
    `</div>` +
    `<div class="d-flex align-items-center">` +
      `<label class="me-2 mb-0">Page size:</label>` +
      `<select class="form-select form-select-sm" style="width:70px" onchange="onPageSize('${view}',this.value)">${opts}</select>` +
    `</div>` +
  `</div>`;

  app.innerHTML = `<h3>${view.charAt(0).toUpperCase() + view.slice(1)}</h3>` + toolbar +
                 `<table class="table table-striped"><thead><tr>${header}<th>Actions</th></tr></thead><tbody>${rowsHtml}</tbody></table>` +
                 pager;
}

// --- Control Handlers ---
function onSearch(view,val)    { state[view].search=val; state[view].page=1; loadAdminView(view); }
function onFilter(view,val)    { state[view].filterStatus=val; state[view].page=1; loadAdminView(view); }
function onSort(view,key)      { const s=state[view]; s.sortKey===key? s.sortDir=s.sortDir==='asc'?'desc':'asc' : (s.sortKey=key,s.sortDir='asc'); renderList(view,state[view]._lastRecords,RESOURCES[view].columns,RESOURCES[view].statusKey); }
function onPage(view,pg)       { state[view].page=pg; renderList(view,state[view]._lastRecords,RESOURCES[view].columns,RESOURCES[view].statusKey); }
function onPageSize(view,sz)   { state[view].pageSize=Number(sz); state[view].page=1; renderList(view,state[view]._lastRecords,RESOURCES[view].columns,RESOURCES[view].statusKey); }

// --- Generic CRUD Stubs ---
function newResource(view) {
  if (view === 'production') return newJob();
  app.innerHTML = `<h3>New ${view.slice(0,-1)}</h3><p>Under construction…</p>`;
}
async function editResource(view,id) {
  if (view === 'production') return editJob(id);
  app.innerHTML = `<h3>Edit ${view.slice(0,-1)} #${id}</h3><p>Under construction…</p>`;
}
async function deleteResource(view,id) {
  if (!confirm('Delete this item?')) return;
  await fetchJSON(`${RESOURCES[view].endpoint}/${id}`, { method:'DELETE' });
  loadAdminView(view);
}

// --- CRUD for Jobs via Modal ---
function newJob() {
  jobForm.reset();
  document.getElementById('jobModalLabel').textContent = 'New Job';
  jobForm.onsubmit = async e => {
    e.preventDefault();
    const payload = {
      order_id:    +document.getElementById('job-order-id').value,
      type:        document.getElementById('job-type').value,
      qty:         +document.getElementById('job-qty').value,
      assigned_to: +document.getElementById('job-assigned-to').value || null,
      due_date:    document.getElementById('job-due-date').value || null,
      job_status:  document.getElementById('job-status').value
    };
    await fetchJSON('/jobs',{ method:'POST', body: JSON.stringify(payload) });
    jobModal.hide();
    loadAdminView('production');
  };
  jobModal.show();
}
async function editJob(id) {
  const rec = await fetchJSON(`/jobs/${id}`);
  document.getElementById('jobModalLabel').textContent = `Edit Job #${id}`;
  document.getElementById('job-order-id').value    = rec.order_id;
  document.getElementById('job-type').value        = rec.type;
  document.getElementById('job-qty').value         = rec.qty;
  document.getElementById('job-assigned-to').value = rec.assigned_to || '';
  document.getElementById('job-due-date').value    = rec.due_date ? rec.due_date.slice(0,10) : '';
  document.getElementById('job-status').value      = rec.job_status;
  jobForm.onsubmit = async e => {
    e.preventDefault();
    const payload = {
      type:        document.getElementById('job-type').value,
      qty:         +document.getElementById('job-qty').value,
      assigned_to: +document.getElementById('job-assigned-to').value || null,
      due_date:    document.getElementById('job-due-date').value || null,
      job_status:  document.getElementById('job-status').value
    };
    await fetchJSON(`/jobs/${id}`,{ method:'PATCH', body:JSON.stringify(payload) });
    jobModal.hide();
    loadAdminView('production');
  };
  jobModal.show();
}
async function deleteJob(id) {
  if (!confirm('Delete this job?')) return;
  await fetchJSON(`/jobs/${id}`,{ method:'DELETE' });
  loadAdminView('production');
}

// --- Initialize App ---
loadAdminView('users');
