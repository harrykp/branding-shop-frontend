// frontend/script-admin.js

console.log('🔥 script-admin.js – Admin Portal with Enhanced Production Jobs UI');

// Base API config
tconst API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

// Inject Bootstrap modal for Job creation/editing
document.body.insertAdjacentHTML('beforeend', `
<div class="modal fade" id="jobModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <form id="jobForm" class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="jobModalLabel">Job</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
`);
const jobModal = new bootstrap.Modal(document.getElementById('jobModal'));
const jobForm  = document.getElementById('jobForm');

// State and configuration
const PAGE_SIZES = [5, 10, 20, 50];
const JOB_STATUSES = ['queued','in_progress','finished','cancelled'];
const state = { production: null };
function initState() {
  if (!state.production) {
    state.production = {
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

// Generic fetch helper
async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : [];
}

// Load production view
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadProductionView();
  })
);

async function loadProductionView() {
  initState();
  app.innerHTML = `<h3>Loading Production Jobs…</h3>`;
  const jobs = await fetchJSON('/jobs');
  state.production._lastRecords = Array.isArray(jobs) ? jobs : [];
  renderProduction();
}

// Render production jobs table
function renderProduction() {
  const s = state.production;
  let recs = Array.isArray(s._lastRecords) ? s._lastRecords : [];

  // Search & filter
  if (s.search) {
    recs = recs.filter(j =>
      Object.values(j).some(v => String(v).toLowerCase().includes(s.search.toLowerCase()))
    );
  }
  if (s.filterStatus) {
    recs = recs.filter(j => j.job_status === s.filterStatus);
  }

  // Sort
  if (s.sortKey) {
    recs.sort((a,b) => {
      const va = a[s.sortKey], vb = b[s.sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (!isNaN(va) && !isNaN(vb)) return (va - vb) * (s.sortDir==='asc'?1:-1);
      return String(va).localeCompare(vb) * (s.sortDir==='asc'?1:-1);
    });
  }

  // Pagination
  const total = recs.length;
  const totalPages = Math.max(1, Math.ceil(total / s.pageSize));
  s.page = Math.min(s.page, totalPages);
  const start = (s.page - 1) * s.pageSize;
  const pageRecs = recs.slice(start, start + s.pageSize);

  // Toolbar
  let toolbar = `<div class="d-flex justify-content-between mb-3">` +
    `<div class="input-group" style="width:350px">` +
      `<span class="input-group-text">🔍</span>` +
      `<input type="text" class="form-control" placeholder="Search…" value="${s.search}" oninput="onSearch(this.value)">` +
      `<select class="form-select ms-2" style="width:160px" onchange="onFilter(this.value)">` +
        `<option value="">All Statuses</option>` +
        JOB_STATUSES.map(st =>
          `<option value="${st}" ${s.filterStatus===st?'selected':''}>${st.replace('_',' ')}</option>`
        ).join('') +
      `</select>` +
    `</div>` +
    `<button class="btn btn-success" onclick="newJob()">+ New Job</button>` +
  `</div>`;

  // Header
  const header = jobsColumns.map(c => {
    const arrow = s.sortKey===c.key ? (s.sortDir==='asc'?' ▲':' ▼') : '';
    return `<th style="cursor:pointer" onclick="onSort('${c.key}')">${c.label}${arrow}</th>`;
  }).join('');

  // Rows
  const rows = pageRecs.map(j => {
    const cells = jobsColumns.map(c => `<td>${j[c.key] != null ? j[c.key] : ''}</td>`).join('');
    return `<tr>${cells}<td>` +
      `<button class="btn btn-sm btn-outline-secondary me-1" onclick="editJob(${j.id})">Edit</button>` +
      `<button class="btn btn-sm btn-outline-danger" onclick="deleteJob(${j.id})">Delete</button>` +
      `</td></tr>`;
  }).join('');

  // Pagination controls
  const prevD = s.page<=1?'disabled':'';
  const nextD = s.page>=totalPages?'disabled':'';
  const sizeOpts = PAGE_SIZES.map(sz => `<option value="${sz}" ${sz===s.pageSize?'selected':''}>${sz}</option>`).join('');
  const pager = `<div class="d-flex justify-content-between align-items-center mt-2">` +
    `<div>` +
      `<button class="btn btn-sm btn-outline-primary me-2" ${prevD} onclick="onPage(${s.page-1})">Prev</button>` +
      `<span>Page ${s.page} of ${totalPages}</span>` +
      `<button class="btn btn-sm btn-outline-primary ms-2" ${nextD} onclick="onPage(${s.page+1})">Next</button>` +
    `</div>` +
    `<div class="d-flex align-items-center">` +
      `<label class="me-2 mb-0">Page size:</label>` +
      `<select class="form-select form-select-sm" style="width:70px" onchange="onPageSize(this.value)">${sizeOpts}</select>` +
    `</div>` +
  `</div>`;

  app.innerHTML = `<h3>Production Jobs</h3>` + toolbar +
                  `<table class="table table-striped"><thead><tr>${header}<th>Actions</th></tr></thead><tbody>${rows}</tbody></table>` +
                  pager;
}

// Control handlers
function onSearch(val)       { state.production.search = val; state.production.page = 1; renderProduction(); }
function onFilter(val)       { state.production.filterStatus = val; state.production.page = 1; renderProduction(); }
function onSort(key)         { const s=state.production; s.sortKey===key ? s.sortDir = s.sortDir==='asc'?'desc':'asc' : (s.sortKey=key,s.sortDir='asc'); renderProduction(); }
function onPage(pg)          { state.production.page = pg; renderProduction(); }
function onPageSize(sz)      { state.production.pageSize = Number(sz); state.production.page=1; renderProduction(); }

// CRUD with modal
function newJob() {
  jobForm.reset();
  document.getElementById('jobModalLabel').textContent = 'New Production Job';
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
    await fetchJSON('/jobs', { method:'POST', body: JSON.stringify(payload) });
    jobModal.hide();
    loadProductionView();
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
    await fetchJSON(`/jobs/${id}`, { method:'PATCH', body: JSON.stringify(payload) });
    jobModal.hide();
    loadProductionView();
  };
  jobModal.show();
}

async function deleteJob(id) {
  if (!confirm('Delete this job?')) return;
  await fetchJSON(`/jobs/${id}`, { method:'DELETE' });
  loadProductionView();
}

// Initialize
loadProductionView();
