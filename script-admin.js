// branding-shop-frontend/script-admin.js
console.log('🔥 script-admin.js – metadata-driven CRUD with pagination');

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
const app = document.getElementById('app-admin');

// --- pagination defaults ---
const DEFAULT_PAGE_SIZE = 10;
const paginationState = {}; 
// will hold { currentPage, pageSize } per resource

// --- global status options per resource (unchanged) ---
const STATUS_OPTIONS = { /* … as before … */ };

// --- define RESOURCES (unchanged) ---
const RESOURCES = { /* … as before … */ };

// --- generic fetch helper (unchanged) ---
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
  // init pagination state for this view
  if (!paginationState[view]) {
    paginationState[view] = {
      currentPage: 1,
      pageSize: DEFAULT_PAGE_SIZE
    };
  }

  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  const cfg = RESOURCES[view];
  if (cfg && cfg.endpoint) {
    const allRecords = await fetchJSON(cfg.endpoint);
    renderPaginatedList(view, allRecords);
  } else {
    app.innerHTML = `<h3>${view.charAt(0).toUpperCase()+view.slice(1)}</h3>
                     <p>Under construction…</p>`;
  }
}

// --- pagination + list renderer ---
function renderPaginatedList(resource, records) {
  const { currentPage, pageSize } = paginationState[resource];
  const totalPages = Math.ceil(records.length / pageSize) || 1;

  // clamp currentPage
  paginationState[resource].currentPage =
    Math.min(Math.max(1, currentPage), totalPages);

  const start = (paginationState[resource].currentPage - 1) * pageSize;
  const pageRecords = records.slice(start, start + pageSize);

  // render controls
  const controls = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        Show 
        <select id="pageSizeSelect" class="form-select d-inline-block w-auto">
          ${[5,10,20,50].map(s =>
            `<option value="${s}" ${s===pageSize?'selected':''}>${s}</option>`
          ).join('')}
        </select>
        entries
      </div>
      <div>
        <button class="btn btn-sm btn-outline-secondary me-2"
                id="prevPage" ${currentPage<=1?'disabled':''}>
          « Prev
        </button>
        Page ${currentPage} of ${totalPages}
        <button class="btn btn-sm btn-outline-secondary ms-2"
                id="nextPage" ${currentPage>=totalPages?'disabled':''}>
          Next »
        </button>
      </div>
      <button class="btn btn-success" onclick="newResource('${resource}')">
        + New
      </button>
    </div>
  `;

  // render table itself
  const tableHTML = renderListTable(resource, pageRecords);

  app.innerHTML = `<h3>${resource.charAt(0).toUpperCase()+resource.slice(1)}</h3>` 
                + controls
                + tableHTML;

  // wire pagination controls
  document.getElementById('pageSizeSelect').onchange = e => {
    paginationState[resource].pageSize = parseInt(e.target.value);
    paginationState[resource].currentPage = 1;
    renderPaginatedList(resource, records);
  };
  document.getElementById('prevPage').onclick = () => {
    paginationState[resource].currentPage--;
    renderPaginatedList(resource, records);
  };
  document.getElementById('nextPage').onclick = () => {
    paginationState[resource].currentPage++;
    renderPaginatedList(resource, records);
  };
}

// --- extract table rendering from previous renderList ---
function renderListTable(resource, records) {
  const { columns, endpoint } = RESOURCES[resource];
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
    <table class="table table-striped">
      <thead><tr>${header}<th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// --- generic form renderer (unchanged) ---
function renderForm(resource, record = {}) {
  /* … same as before … */
}

// --- CRUD actions (unchanged) ---
function newResource(resource) { renderForm(resource); }
async function editResource(resource, id) {
  const rec = await fetchJSON(`${RESOURCES[resource].endpoint}/${id}`);
  renderForm(resource, rec);
}
async function deleteResource(resource, id) {
  if (!confirm('Delete this item?')) return;
  await fetchJSON(`${RESOURCES[resource].endpoint}/${id}`, { method: 'DELETE' });
  // reload current page of list
  loadAdminView(resource);
}

// --- logout ---
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// --- initial load ---
loadAdminView('users');
