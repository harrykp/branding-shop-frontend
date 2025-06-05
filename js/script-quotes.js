// js/script-quotes.js

let quoteModal;
const quotesTableBody = document.getElementById('quotes-table-body');
const quoteForm = document.getElementById('quoteForm');
const searchInput = document.getElementById('searchInput');
let currentPage = 1;

function exportQuotesToCSV() {
  exportTableToCSV('quotesTable');
}

async function loadQuotes(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetchWithAuth(`/api/quotes?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();
    if (!Array.isArray(data)) {
      console.error("Expected array for quotes but got:", data);
      return;
    }
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
          <button class="btn btn-sm btn-info" onclick='viewQuote(${JSON.stringify(q)})'>View</button>
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

window.viewQuote = async function(q) {
  try {
    const res = await fetchWithAuth(`/api/quotes/${q.id}`);
    const full = await res.json();
    document.getElementById('viewQuoteCustomer').textContent = full.customer_name;
    document.getElementById('viewQuoteRep').textContent = full.sales_rep_name;
    document.getElementById('viewQuoteStatus').textContent = full.status;
    document.getElementById('viewQuoteTotal').textContent = full.total;
    document.getElementById('viewQuoteDate').textContent = new Date(full.created_at).toLocaleString();

    const tbody = document.getElementById('viewQuoteItems');
    tbody.innerHTML = '';
    if (Array.isArray(full.items) && full.items.length > 0) {
      full.items.forEach(item => {
        const subtotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.product_name}</td>
          <td>${item.quantity}</td>
          <td>${item.unit_price}</td>
          <td>${subtotal.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="4">No items found.</td></tr>';
    }
    new bootstrap.Modal(document.getElementById('viewQuoteModal')).show();
  } catch (err) {
    console.error('Failed to load quote details:', err);
  }
}

window.editQuote = function(q) {
  document.getElementById('quoteId').value = q.id;
  document.getElementById('quoteCustomerId').value = q.customer_id;
  document.getElementById('quoteSalesRepId').value = q.sales_rep_id;
  document.getElementById('quoteStatus').value = q.status;
  document.getElementById('quoteTotal').value = q.total;

  const tbody = document.getElementById('quoteItems');
  tbody.innerHTML = '';
  if (q.items && Array.isArray(q.items)) {
    q.items.forEach(item => addQuoteItemRow(item.product_id, item.quantity, item.unit_price));
  }
  quoteModal.show();
}

function addQuoteItemRow(productId = '', quantity = 1, unit_price = 0) {
  const tbody = document.getElementById('quoteItems');
  const row = document.createElement('tr');
  row.className = 'item-row';
  row.innerHTML = `
    <td><select class="form-select item-product"></select></td>
    <td><input type="number" class="form-control item-qty" value="${quantity}" min="1"></td>
    <td><input type="number" class="form-control item-price" value="${unit_price}" min="0"></td>
    <td class="item-subtotal">0.00</td>
    <td><button type="button" class="btn btn-sm btn-danger" onclick="this.closest('tr').remove(); recalculateTotal('quoteItems', 'quoteTotal')">&times;</button></td>
  `;
  tbody.appendChild(row);
  populateSelect('products', row.querySelector('select'));
  if (productId) row.querySelector('select').value = productId;
  setupRowListeners(row);
  recalculateTotal('quoteItems', 'quoteTotal');
}

function setupRowListeners(row) {
  row.querySelector('.item-qty').addEventListener('input', () => recalculateTotal('quoteItems', 'quoteTotal'));
  row.querySelector('.item-price').addEventListener('input', () => recalculateTotal('quoteItems', 'quoteTotal'));
}

quoteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('quoteId').value;
  const itemRows = Array.from(document.querySelectorAll('#quoteItems .item-row'));
  const items = itemRows.map(row => ({
    product_id: row.querySelector('select')?.value,
    quantity: parseInt(row.querySelector('.item-qty')?.value) || 0,
    unit_price: parseFloat(row.querySelector('.item-price')?.value) || 0
  })).filter(item => item.product_id && item.quantity > 0);

  const payload = {
    customer_id: document.getElementById('quoteCustomerId').value,
    sales_rep_id: document.getElementById('quoteSalesRepId').value,
    status: document.getElementById('quoteStatus').value,
    total: document.getElementById('quoteTotal').value,
    items
  };

  console.log("Submitting quote payload:", payload);

  if (!items.length) {
    alert("Please add at least one item.");
    return;
  }

  try {
    const method = id ? 'PUT' : 'POST';
    const url = `/api/quotes${id ? '/' + id : ''}`;
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    quoteModal.hide();
    loadQuotes(currentPage);
  } catch (err) {
    console.error('Failed to save quote:', err);
  }
});

window.deleteQuote = async function(id) {
  if (!confirm('Delete this quote?')) return;
  try {
    await fetchWithAuth(`/api/quotes/${id}`, { method: 'DELETE' });
    loadQuotes(currentPage);
  } catch (err) {
    console.error('Failed to delete quote:', err);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  quoteModal = new bootstrap.Modal(document.getElementById('quoteModal'));
  await populateSelect('customers', 'quoteCustomerId');
  await populateSelect('users?role=sales_rep', 'quoteSalesRepId');
  loadQuotes();
});
