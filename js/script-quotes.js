// public/js/script-quotes.js
document.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  loadQuotes();

  document.getElementById('newQuoteBtn').addEventListener('click', () => openQuoteModal());
  document.getElementById('quoteForm').addEventListener('submit', saveQuote);
  document.getElementById('searchInput').addEventListener('input', () => loadQuotes());
});

let currentPage = 1;
let currentSearch = '';

async function loadQuotes(page = 1) {
  currentPage = page;
  currentSearch = document.getElementById('searchInput').value.trim();

  try {
    const res = await fetch(`${API_BASE}/api/quotes?page=${page}&limit=10&search=${encodeURIComponent(currentSearch)}`, {
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    const { data, total } = await res.json();

    const tbody = document.getElementById('quotes-table-body');
    tbody.innerHTML = '';

    data.forEach(quote => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="display:none;">${quote.id}</td>
        <td>${quote.customer_name}</td>
        <td>${quote.product_name}</td>
        <td>${quote.quantity}</td>
        <td>${quote.price}</td>
        <td>
          <select class="form-select form-select-sm" onchange="updateStatus(${quote.id}, this.value)">
            <option ${quote.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${quote.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option ${quote.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="openQuoteModal(${encodeURIComponent(JSON.stringify(quote))})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteQuote(${quote.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    renderPagination(total, 10, page, loadQuotes);
  } catch (err) {
    console.error('Failed to load quotes:', err);
  }
}

function openQuoteModal(quote = null) {
  const modal = new bootstrap.Modal(document.getElementById('quoteModal'));
  document.getElementById('quoteForm').reset();
  document.getElementById('quoteId').value = quote ? quote.id : '';
  document.getElementById('customerId').value = quote?.customer_id || '';
  document.getElementById('productId').value = quote?.product_id || '';
  document.getElementById('quantity').value = quote?.quantity || '';
  document.getElementById('price').value = quote?.price || '';
  document.getElementById('status').value = quote?.status || 'Pending';
  loadCustomers(quote?.customer_id);
  loadProducts(quote?.product_id);
  modal.show();
}

async function loadCustomers(selectedId = '') {
  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    const users = await res.json();
    const select = document.getElementById('customerId');
    select.innerHTML = '';
    users.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = u.name;
      if (u.id == selectedId) opt.selected = true;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load users:', err);
  }
}

async function loadProducts(selectedId = '') {
  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    const products = await res.json();
    const select = document.getElementById('productId');
    select.innerHTML = '';
    products.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.id == selectedId) opt.selected = true;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

async function saveQuote(e) {
  e.preventDefault();
  const id = document.getElementById('quoteId').value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/api/quotes/${id}` : `${API_BASE}/api/quotes`;
  const data = {
    customer_id: document.getElementById('customerId').value,
    product_id: document.getElementById('productId').value,
    quantity: document.getElementById('quantity').value,
    price: document.getElementById('price').value,
    status: document.getElementById('status').value
  };

  try {
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.token}`
      },
      body: JSON.stringify(data)
    });
    bootstrap.Modal.getInstance(document.getElementById('quoteModal')).hide();
    loadQuotes(currentPage);
  } catch (err) {
    console.error('Failed to save quote:', err);
  }
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

async function updateStatus(id, status) {
  try {
    await fetch(`${API_BASE}/api/quotes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.token}`
      },
      body: JSON.stringify({ status })
    });
  } catch (err) {
    console.error('Failed to update status:', err);
  }
}
