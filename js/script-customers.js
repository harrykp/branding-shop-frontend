// /js/script-customers.js

let customerModal;
const customerForm = document.getElementById('customerForm');
const searchInput = document.getElementById('searchInput');
const customerTableBody = document.getElementById('customer-table-body');
let currentPage = 1;

function exportCustomersToCSV() {
  exportTableToCSV('customers.csv');
}

async function loadCustomers(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetch(`${API_BASE}/api/customers?page=${page}&limit=10&search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    const { customers, total } = await res.json();

    customerTableBody.innerHTML = '';
    customers.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.phone}</td>
        <td>${c.company}</td>
        <td>${c.sales_rep_name || ''}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick='editCustomer(${JSON.stringify(c)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteCustomer(${c.id})'>Delete</button>
        </td>`;
      customerTableBody.appendChild(tr);
    });

    renderPagination(total, 10, currentPage, loadCustomers);
  } catch (err) {
    console.error('Failed to load customers:', err);
  }
}

function editCustomer(c) {
  document.getElementById('customer-id').value = c.id;
  document.getElementById('customer-name').value = c.name;
  document.getElementById('customer-email').value = c.email;
  document.getElementById('customer-phone').value = c.phone;
  document.getElementById('customer-company').value = c.company;
  document.getElementById('customer-sales-rep').value = c.sales_rep_id || '';
  customerModal.show();
}

async function deleteCustomer(id) {
  if (!confirm('Delete this customer?')) return;
  try {
    await fetch(`${API_BASE}/api/customers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    loadCustomers(currentPage);
  } catch (err) {
    console.error('Failed to delete customer:', err);
  }
}

customerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('customer-id').value;
  const payload = {
    name: document.getElementById('customer-name').value,
    email: document.getElementById('customer-email').value,
    phone: document.getElementById('customer-phone').value,
    company: document.getElementById('customer-company').value,
    sales_rep_id: document.getElementById('customer-sales-rep').value
  };
  try {
    const method = id ? 'PUT' : 'POST';
    const url = `${API_BASE}/api/customers${id ? '/' + id : ''}`;
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.token}`
      },
      body: JSON.stringify(payload)
    });
    customerModal.hide();
    loadCustomers(currentPage);
  } catch (err) {
    console.error('Failed to save customer:', err);
  }
});

searchInput.addEventListener('input', () => loadCustomers(1));

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  customerModal = new bootstrap.Modal(document.getElementById('editCustomerModal'));
  await populateSalesReps();
  loadCustomers();
});

async function populateSalesReps() {
  try {
    const res = await fetch(`${API_BASE}/api/users?role=sales_rep`, {
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    const reps = await res.json();
    const select = document.getElementById('customer-sales-rep');
    select.innerHTML = '<option value="">-- Select Sales Rep --</option>';
    reps.forEach(rep => {
      const opt = document.createElement('option');
      opt.value = rep.id;
      opt.textContent = rep.name;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error('Failed to load sales reps:', error);
  }
}
