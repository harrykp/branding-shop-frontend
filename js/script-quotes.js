// /js/script-quotes.js

let quoteModal;
const quotesTableBody = document.getElementById('quotes-table-body');
const quoteForm = document.getElementById('quoteForm');
const searchInput = document.getElementById('searchInput');
let currentPage = 1;

function exportQuotesToCSV() {
  exportTableToCSV('quotes.csv');
}

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

    renderPagination(total, 10, currentPage, loadQuotes);
  } catch (err) {
    console.error('Failed to load quotes:', err);
  }
}

async function populateDropdown(endpoint, selectId) {
  try {
    const res = await fetch(`${API_BASE}/api/${endpoint}`, {
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    const result = await res.json();
    console.log(`Dropdown fetch for '${endpoint}':`, result);

    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">-- Select --</option>';

    let data = [];

    if (Array.isArray(result.customers)) {
      data = result.customers;
    } else if (Array.isArray(result.data)) {
      data = result.data;
    } else if (Array.isArray(result)) {
      data = result;
    }

    data.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error(`Failed to load dropdown for ${selectId}:`, error);
  }
}

function addQuoteItemRow(item = {}) {
  const container = document.getElementById('items-container');
  const row = document.createElement('div');
  row.className = 'row g-2 mb-2 item-row';
  row.innerHTML = `
    <div class="col-md-4">
      <select class="form-select product-select">
        <option value="">-- Select Product --</option>
      </select>
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control qty-input" value="${item.quantity || ''}" />
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control price-input" value="${item.unit_price || ''}" />
    </div>
    <div class="col-md-2 d-flex align-items-center">
      <span class="item-subtotal">0.00</span>
    </div>
    <div class="col-md-2">
      <button class="btn btn-sm btn-danger remove-item">✖</button>
    </div>
  `;
  container.appendChild(row);
  row.querySelector('.remove-item').onclick = () => row.remove();
  row.querySelectorAll('.qty-input, .price-input').forEach(el => el.oninput = updateTotal);
  populateProducts(row.querySelector('.product-select'), item.product_id);
}

async function populateProducts(selectElement, selectedId) {
  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    const result = await res.json();
    result.data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      if (selectedId && selectedId == p.id) opt.selected = true;
      selectElement.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

function updateTotal() {
  const rows = document.querySelectorAll('.item-row');
  let total = 0;
  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
    const price = parseFloat(row.querySelector('.price-input').value) || 0;
    const subtotal = qty * price;
    row.querySelector('.item-subtotal').textContent = subtotal.toFixed(2);
    total += subtotal;
  });
  document.getElementById('quoteTotal').textContent = total.toFixed(2);
}

function editQuote(q) {
  document.getElementById('quoteId').value = q.id;
  document.getElementById('customerId').value = q.customer_id;
  document.getElementById('salesRepId').value = q.sales_rep_id;
  document.getElementById('status').value = q.status;

  const container = document.getElementById('items-container');
  container.innerHTML = '';
  if (q.items && Array.isArray(q.items)) {
    q.items.forEach(addQuoteItemRow);
  }
  updateTotal();
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
  const items = Array.from(document.querySelectorAll('.item-row')).map(row => ({
    product_id: row.querySelector('.product-select').value,
    quantity: parseFloat(row.querySelector('.qty-input').value) || 0,
    unit_price: parseFloat(row.querySelector('.price-input').value) || 0
  })).filter(item => item.product_id);

  const total = items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
  const payload = {
    customer_id: document.getElementById('customerId').value,
    sales_rep_id: document.getElementById('salesRepId').value,
    status: document.getElementById('status').value,
    total,
    items
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
  quoteModal = new bootstrap.Modal(document.getElementById('quoteModal'));
  await populateDropdown('customers', 'customerId');
  await populateDropdown('users?role=sales_rep', 'salesRepId');
  loadQuotes();
});
