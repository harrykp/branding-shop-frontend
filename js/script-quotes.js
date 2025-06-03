// /js/script-quotes.js
const quotesTableBody = document.getElementById('quotes-table-body');
const quoteForm = document.getElementById('quoteForm');
const quoteModal = new bootstrap.Modal(document.getElementById('quoteModal'));
const searchInput = document.getElementById('searchInput');

let currentPage = 1;

function openNewQuoteModal() {
  document.getElementById('quoteId').value = '';
  document.getElementById('quoteForm').reset();
  document.getElementById('quoteItemsBody').innerHTML = '';
  addQuoteItemRow();
  quoteModal.show();
}

function addQuoteItemRow(item = {}) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><select class="form-select product-select"></select></td>
    <td><input type="number" class="form-control qty" value="${item.qty || 1}" /></td>
    <td><input type="number" class="form-control unit-price" value="${item.unit_price || 0}" /></td>
    <td class="subtotal">0</td>
    <td><button type="button" class="btn btn-sm btn-danger" onclick="this.closest('tr').remove(); calculateTotal();">X</button></td>
  `;
  document.getElementById('quoteItemsBody').appendChild(row);
  populateProducts(row.querySelector('select'), item.product_id);
  calculateTotal();

  row.querySelectorAll('.qty, .unit-price').forEach(input => {
    input.addEventListener('input', calculateTotal);
  });
}

function calculateTotal() {
  let total = 0;
  document.querySelectorAll('#quoteItemsBody tr').forEach(row => {
    const qty = parseFloat(row.querySelector('.qty').value) || 0;
    const price = parseFloat(row.querySelector('.unit-price').value) || 0;
    const subtotal = qty * price;
    row.querySelector('.subtotal').textContent = subtotal.toFixed(2);
    total += subtotal;
  });
  document.getElementById('total').value = total.toFixed(2);
}

async function populateProducts(selectElement, selectedId) {
  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    const result = await res.json();

    const data = Array.isArray(result.data) ? result.data : (Array.isArray(result.products) ? result.products : result);

    selectElement.innerHTML = '<option value="">-- Select Product --</option>';
    data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.id === selectedId) opt.selected = true;
      selectElement.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load products:', err);
  }
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

    renderPagination(total, 'pagination', loadQuotes, 10, page);
  } catch (err) {
    console.error('Failed to load quotes:', err);
  }
}

function editQuote(q) {
  document.getElementById('quoteId').value = q.id;
  document.getElementById('customerId').value = q.customer_id;
  document.getElementById('salesRepId').value = q.sales_rep_id;
  document.getElementById('status').value = q.status;
  document.getElementById('quoteItemsBody').innerHTML = '';
  q.items.forEach(addQuoteItemRow);
  calculateTotal();
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
  const items = Array.from(document.querySelectorAll('#quoteItemsBody tr')).map(row => ({
    product_id: parseInt(row.querySelector('select').value),
    qty: parseFloat(row.querySelector('.qty').value),
    unit_price: parseFloat(row.querySelector('.unit-price').value)
  }));

  const payload = {
    customer_id: parseInt(document.getElementById('customerId').value),
    sales_rep_id: parseInt(document.getElementById('salesRepId').value),
    status: document.getElementById('status').value,
    total: parseFloat(document.getElementById('total').value),
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
  await populateDropdown('customers', 'customerId');
  await populateDropdown('users?role=sales_rep', 'salesRepId');
  loadQuotes();
});
