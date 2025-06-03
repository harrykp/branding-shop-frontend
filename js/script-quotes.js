// /js/script-quotes.js

let quoteModal, viewQuoteModal;
const quotesTableBody = document.getElementById('quotes-table-body');
const quoteForm = document.getElementById('quoteForm');
const searchInput = document.getElementById('searchInput');
let currentPage = 1;

function exportQuotesToCSV() {
  exportTableToCSV('quotes-table');
}

async function loadQuotes(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetch(`${API_BASE}/api/quotes?page=${page}&limit=10&search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` }
    });
    const { quotes, total } = await res.json();

    quotesTableBody.innerHTML = '';
    quotes.forEach(q => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${q.customer_name}</td>
        <td>${q.sales_rep_name}</td>
        <td>${q.status}</td>
        <td>${q.total}</td>
        <td>${new Date(q.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick='viewQuote(${q.id})'>View</button>
          <button class="btn btn-sm btn-primary" onclick='editQuote(${JSON.stringify(q)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteQuote(${q.id})'>Delete</button>
        </td>`;
      quotesTableBody.appendChild(tr);
    });

    renderPagination(total, 'pagination', loadQuotes, 10, page);
  } catch (err) {
    console.error('Failed to load quotes:', err);
  }
}

function addQuoteItemRow(item = {}) {
  const tbody = document.getElementById('quote-items-body');
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>
      <select class="form-select" onchange="updateUnitPrice(this)">
        <option value="">-- Select --</option>
      </select>
    </td>
    <td><input type="number" class="form-control qty" value="${item.qty || 1}" onchange="recalculateRow(this)"></td>
    <td><input type="number" class="form-control unit-price" value="${item.unit_price || 0}" readonly></td>
    <td><input type="number" class="form-control subtotal" value="${item.subtotal || 0}" readonly></td>
    <td><button type="button" class="btn btn-sm btn-danger" onclick="removeQuoteItemRow(this)">X</button></td>
  `;

  tbody.appendChild(tr);
  populateSelect('products', tr.querySelector('select'));
  recalculateTotal();
}

function updateUnitPrice(select) {
  const selected = select.options[select.selectedIndex];
  const price = selected.dataset.price || 0;
  const row = select.closest('tr');
  row.querySelector('.unit-price').value = price;
  recalculateRow(row);
}

function recalculateRow(input) {
  const row = input.closest('tr');
  const qty = parseFloat(row.querySelector('.qty').value) || 0;
  const unitPrice = parseFloat(row.querySelector('.unit-price').value) || 0;
  row.querySelector('.subtotal').value = qty * unitPrice;
  recalculateTotal();
}

function recalculateTotal() {
  let total = 0;
  document.querySelectorAll('#quote-items-body .subtotal').forEach(input => {
    total += parseFloat(input.value) || 0;
  });
  document.getElementById('total').value = total.toFixed(2);
}

function removeQuoteItemRow(button) {
  button.closest('tr').remove();
  recalculateTotal();
}

function editQuote(q) {
  document.getElementById('quoteId').value = q.id;
  document.getElementById('customerId').value = q.customer_id;
  document.getElementById('salesRepId').value = q.sales_rep_id;
  document.getElementById('status').value = q.status;

  // Load quote items
  document.getElementById('quote-items-body').innerHTML = '';
  if (q.items && Array.isArray(q.items)) {
    q.items.forEach(addQuoteItemRow);
  } else {
    addQuoteItemRow();
  }

  quoteModal.show();
}

async function deleteQuote(id) {
  if (!confirm('Delete this quote?')) return;
  try {
    await fetch(`${API_BASE}/api/quotes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getStoredToken()}` }
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
    total: document.getElementById('total').value,
    items: []
  };

  document.querySelectorAll('#quote-items-body tr').forEach(row => {
    const select = row.querySelector('select');
    const qty = row.querySelector('.qty').value;
    const unitPrice = row.querySelector('.unit-price').value;
    if (select.value) {
      payload.items.push({
        product_id: select.value,
        qty,
        unit_price: unitPrice
      });
    }
  });

  try {
    const method = id ? 'PUT' : 'POST';
    const url = `${API_BASE}/api/quotes${id ? '/' + id : ''}`;
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getStoredToken()}`
      },
      body: JSON.stringify(payload)
    });
    quoteModal.hide();
    loadQuotes(currentPage);
  } catch (err) {
    console.error('Failed to save quote:', err);
  }
});

async function viewQuote(id) {
  try {
    const res = await fetch(`${API_BASE}/api/quotes/${id}`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` }
    });
    const q = await res.json();

    const container = document.getElementById('viewQuoteContent');
    let html = `
      <p><strong>Customer:</strong> ${q.customer_name}</p>
      <p><strong>Sales Rep:</strong> ${q.sales_rep_name}</p>
      <p><strong>Status:</strong> ${q.status}</p>
      <p><strong>Date:</strong> ${new Date(q.created_at).toLocaleString()}</p>
      <h6>Items</h6>
      <table class="table table-sm table-bordered">
        <thead>
          <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
        </thead>
        <tbody>
          ${q.items.map(item => `
            <tr>
              <td>${item.product_name}</td>
              <td>${item.qty}</td>
              <td>${item.unit_price}</td>
              <td>${item.subtotal}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <p class="text-end fw-bold">Total: ${q.total}</p>
    `;

    container.innerHTML = html;
    viewQuoteModal.show();
  } catch (err) {
    console.error('Failed to load quote:', err);
  }
}

searchInput.addEventListener('input', () => loadQuotes(1));

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  quoteModal = new bootstrap.Modal(document.getElementById('quoteModal'));
  viewQuoteModal = new bootstrap.Modal(document.getElementById('viewQuoteModal'));
  await populateSelect('customers', 'customerId');
  await populateSelect('users?role=sales_rep', 'salesRepId');
  loadQuotes();
});
