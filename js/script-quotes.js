// /js/script-quotes.js
const quotesTableBody = document.getElementById('quotes-table-body');
const quoteForm = document.getElementById('quoteForm');
const searchInput = document.getElementById('searchInput');
const quoteModal = new bootstrap.Modal(document.getElementById('quoteModal'));

let currentPage = 1;

async function loadQuotes(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetch(`${API_BASE}/api/quotes?page=${page}&limit=10&search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    const { data, total } = await res.json();

    quotesTableBody.innerHTML = '';
    data.forEach(q => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${q.customer_name}</td>
        <td>${q.sales_rep_name}</td>
        <td>${q.status}</td>
        <td>${q.total}</td>
        <td>${new Date(q.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick='editQuote(${JSON.stringify(q)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteQuote(${q.id})'>Delete</button>
        </td>`;
      quotesTableBody.appendChild(tr);
    });

    renderPagination(total, 10, page, loadQuotes);
  } catch (err) {
    console.error('Failed to load quotes:', err);
  }
}

async function populateDropdown(endpoint, selectId) {
  const res = await fetch(`${API_BASE}/api/${endpoint}`, {
    headers: { Authorization: `Bearer ${localStorage.token}` }
  });
  const result = await res.json();
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">-- Select --</option>';
  (result.data || result).forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.name;
    select.appendChild(opt);
  });
}

function editQuote(q) {
  document.getElementById('quoteId').value = q.id;
  document.getElementById('customerId').value = q.customer_id;
  document.getElementById('salesRepId').value = q.sales_rep_id;
  document.getElementById('status').value = q.status;
  document.getElementById('total').value = q.total;
  quoteModal.show();
}

async function deleteQuote(id) {
  if (!confirm('Delete this quote?')) return;
  try {
    await fetch(`${API_BASE}/api/quotes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    loadQuotes(currentPage);
  } catch (err) {
    console.error('Failed to delete quote:', err);
  }
}

quoteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('quoteId').value;
  const payload = {
    customer_id: document.getElementById('customerId').value,
    sales_rep_id: document.getElementById('salesRepId').value,
    status: document.getElementById('status').value,
    total: document.getElementById('total').value
  };
  try {
    const method = id ? 'PUT' : 'POST';
    const url = `${API_BASE}/api/quotes${id ? '/' + id : ''}`;
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.token}`
      },
      body: JSON.stringify(payload)
    });
    quoteModal.hide();
    loadQuotes(currentPage);
  } catch (err) {
    console.error('Failed to save quote:', err);
  }
});

searchInput.addEventListener('input', () => loadQuotes(1));

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  await populateDropdown('customers', 'customerId');
  await populateDropdown('users?role=sales_rep', 'salesRepId');
  loadQuotes();
});
// /js/script-quotes.js
const quotesTableBody = document.getElementById('quotes-table-body');
const quoteForm = document.getElementById('quoteForm');
const searchInput = document.getElementById('searchInput');
const quoteModal = new bootstrap.Modal(document.getElementById('quoteModal'));

let currentPage = 1;

async function loadQuotes(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetch(`${API_BASE}/quotes?page=${page}&limit=10&search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    const { data, total } = await res.json();

    quotesTableBody.innerHTML = '';
    data.forEach(q => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${q.customer_name}</td>
        <td>${q.sales_rep_name}</td>
        <td>${q.status}</td>
        <td>${q.total}</td>
        <td>${new Date(q.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick='editQuote(${JSON.stringify(q)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteQuote(${q.id})'>Delete</button>
        </td>`;
      quotesTableBody.appendChild(tr);
    });

    renderPagination(total, 10, page, loadQuotes);
  } catch (err) {
    console.error('Failed to load quotes:', err);
  }
}

async function populateDropdown(endpoint, selectId) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    headers: { Authorization: `Bearer ${localStorage.token}` }
  });
  const result = await res.json();
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">-- Select --</option>';
  (result.data || result).forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.name;
    select.appendChild(opt);
  });
}

function editQuote(q) {
  document.getElementById('quoteId').value = q.id;
  document.getElementById('customerId').value = q.customer_id;
  document.getElementById('salesRepId').value = q.sales_rep_id;
  document.getElementById('status').value = q.status;
  document.getElementById('total').value = q.total;
  quoteModal.show();
}

async function deleteQuote(id) {
  if (!confirm('Delete this quote?')) return;
  try {
    await fetch(`${API_BASE}/quotes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    loadQuotes(currentPage);
  } catch (err) {
    console.error('Failed to delete quote:', err);
  }
}

quoteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('quoteId').value;
  const payload = {
    customer_id: document.getElementById('customerId').value,
    sales_rep_id: document.getElementById('salesRepId').value,
    status: document.getElementById('status').value,
    total: document.getElementById('total').value
  };
  try {
    const method = id ? 'PUT' : 'POST';
    const url = `${API_BASE}/quotes${id ? '/' + id : ''}`;
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.token}`
      },
      body: JSON.stringify(payload)
    });
    quoteModal.hide();
    loadQuotes(currentPage);
  } catch (err) {
    console.error('Failed to save quote:', err);
  }
});

searchInput.addEventListener('input', () => loadQuotes(1));

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  await populateDropdown('customers', 'customerId');
  await populateDropdown('users?role=sales_rep', 'salesRepId');
  loadQuotes();
});
