// /js/script-quotes.js (Frozen Working Version)

let quoteModal, viewQuoteModal;
const quotesTableBody = document.getElementById('quotes-table-body');
const quoteForm = document.getElementById('quoteForm');
const searchInput = document.getElementById('searchInput');
let currentPage = 1;

function openQuoteModal() {
  document.getElementById('quoteId').value = '';
  document.getElementById('status').value = 'pending';
  document.getElementById('quote-items-body').innerHTML = '';
  document.getElementById('quote-total').innerText = '0.00';
  addQuoteItemRow();
  quoteModal.show();
}

function addQuoteItemRow(item = {}) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><select class="form-select product-select"></select></td>
    <td><input type="number" class="form-control qty-input" value="${item.qty || 1}" /></td>
    <td><input type="number" class="form-control price-input" value="${item.unit_price || 0}" /></td>
    <td class="subtotal-cell">0.00</td>
    <td><button class="btn btn-sm btn-danger" onclick="this.closest('tr').remove(); calculateQuoteTotal();">Remove</button></td>
  `;
  document.getElementById('quote-items-body').appendChild(row);
  populateProductSelect(row.querySelector('.product-select'), item.product_id);
  row.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', calculateQuoteTotal);
  });
  calculateQuoteTotal();
}

async function populateProductSelect(select, selectedId) {
  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` }
    });
    const data = await res.json();
    data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.id === selectedId) opt.selected = true;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

function calculateQuoteTotal() {
  let total = 0;
  document.querySelectorAll('#quote-items-body tr').forEach(row => {
    const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
    const price = parseFloat(row.querySelector('.price-input').value) || 0;
    const subtotal = qty * price;
    row.querySelector('.subtotal-cell').innerText = subtotal.toFixed(2);
    total += subtotal;
  });
  document.getElementById('quote-total').innerText = total.toFixed(2);
}

async function loadQuotes(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetch(`${API_BASE}/api/quotes?page=${page}&limit=10&search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` }
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
          <button class="btn btn-sm btn-info" onclick='viewQuote(${q.id})'>View</button>
          <button class="btn btn-sm btn-primary" onclick='editQuote(${JSON.stringify(q)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteQuote(${q.id})'>Delete</button>
        </td>`;
      quotesTableBody.appendChild(tr);
    });
    renderPagination(total, 'pagination', loadQuotes);
  } catch (err) {
    console.error('Failed to load quotes:', err);
  }
}

async function viewQuote(id) {
  try {
    const res = await fetch(`${API_BASE}/api/quotes/${id}`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` }
    });
    const q = await res.json();
    const container = document.getElementById('quote-view-content');
    let html = `
      <p><strong>Customer:</strong> ${q.customer_name}</p>
      <p><strong>Sales Rep:</strong> ${q.sales_rep_name}</p>
      <p><strong>Status:</strong> ${q.status}</p>
      <hr/>
      <table class="table table-sm">
        <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${q.items.map(item => `
            <tr>
              <td>${item.product_name}</td>
              <td>${item.qty}</td>
              <td>${item.unit_price}</td>
              <td>${item.subtotal}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p class="text-end"><strong>Total: GH¢ ${q.total}</strong></p>
    `;
    container.innerHTML = html;
    viewQuoteModal.show();
  } catch (err) {
    console.error('Failed to fetch quote details:', err);
  }
}

function editQuote(q) {
  document.getElementById('quoteId').value = q.id;
  document.getElementById('customerId').value = q.customer_id;
  document.getElementById('salesRepId').value = q.sales_rep_id;
  document.getElementById('status').value = q.status;
  document.getElementById('quote-items-body').innerHTML = '';
  q.items.forEach(addQuoteItemRow);
  calculateQuoteTotal();
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
    items: Array.from(document.querySelectorAll('#quote-items-body tr')).map(row => ({
      product_id: row.querySelector('.product-select').value,
      qty: row.querySelector('.qty-input').value,
      unit_price: row.querySelector('.price-input').value
    }))
  };
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
