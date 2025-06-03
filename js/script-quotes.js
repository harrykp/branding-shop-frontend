// /js/script-quotes.js

let quoteModal;
let viewQuoteModal;
const quotesTableBody = document.getElementById('quotes-table-body');
const quoteForm = document.getElementById('quoteForm');
const searchInput = document.getElementById('searchInput');
let currentPage = 1;

function exportQuotesToCSV() {
  exportTableToCSV('quotes-table', 'quotes.csv');
}

async function loadQuotes(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetchWithAuth(`/api/quotes?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const { data: quotes, total } = await res.json();

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
          <button class="btn btn-sm btn-info" onclick='viewQuote(${JSON.stringify(q)})'>View</button>
          <button class="btn btn-sm btn-primary" onclick='editQuote(${JSON.stringify(q)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteQuote(${q.id})'>Delete</button>
        </td>`;
      quotesTableBody.appendChild(tr);
    });

    renderPagination(total, 'pagination', loadQuotes, 10, currentPage);
  } catch (err) {
    console.error('Failed to load quotes:', err);
  }
}

function viewQuote(quote) {
  const container = document.getElementById('viewQuoteContent');
  container.innerHTML = `
    <h5>Customer: ${quote.customer_name}</h5>
    <p><strong>Sales Rep:</strong> ${quote.sales_rep_name}</p>
    <p><strong>Status:</strong> ${quote.status}</p>
    <p><strong>Total:</strong> ${quote.total}</p>
    <p><strong>Date:</strong> ${new Date(quote.created_at).toLocaleString()}</p>
    <hr>
    <h6>Items:</h6>
    <ul>
      ${(quote.items || []).map(item => `<li>${item.product_name} - Qty: ${item.qty} @ ${item.unit_price} = ${item.subtotal}</li>`).join('') || '<li>No items found.</li>'}
    </ul>
  `;
  viewQuoteModal.show();
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
    await fetchWithAuth(`/api/quotes/${id}`, { method: 'DELETE' });
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

searchInput.addEventListener('input', () => loadQuotes(1));

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  quoteModal = new bootstrap.Modal(document.getElementById('quoteModal'));
  viewQuoteModal = new bootstrap.Modal(document.getElementById('viewQuoteModal'));
  await populateSelect('customers', document.getElementById('customerId'));
  await populateSelect('users?role=sales_rep', document.getElementById('salesRepId'));
  loadQuotes();
});
