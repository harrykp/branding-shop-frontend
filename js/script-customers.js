// /js/script-customers.js
const API_BASE = window.API_BASE || 'https://branding-shop-backend.onrender.com/api';

const customerTableBody = document.getElementById('customer-table-body');
const paginationEl = document.getElementById('pagination');
const exportCSVBtn = document.getElementById('exportCSVBtn');
const newCustomerBtn = document.getElementById('newCustomerBtn');
const customerModal = new bootstrap.Modal(document.getElementById('customerModal'));
const customerForm = document.getElementById('customerForm');

let currentPage = 1;

async function loadCustomers(page = 1) {
  try {
    const search = document.getElementById('searchInput').value || '';
    const res = await fetch(`${API_BASE}/customers?page=${page}&limit=10&search=${search}`);
    const { data, total } = await res.json();
    customerTableBody.innerHTML = '';
    data.forEach(customer => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${customer.name}</td>
        <td>${customer.email}</td>
        <td>${customer.phone}</td>
        <td>${customer.company}</td>
        <td>${customer.sales_rep_name || ''}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="editCustomer(${customer.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">Delete</button>
        </td>`;
      customerTableBody.appendChild(row);
    });
    renderPagination(total, page, loadCustomers);
  } catch (err) {
    console.error('Failed to load customers:', err);
  }
}

async function fetchSalesReps() {
  const res = await fetch(`${API_BASE}/users?role=sales_rep`);
  const { data } = await res.json();
  const select = document.getElementById('salesRepSelect');
  select.innerHTML = '<option value="">-- Select Sales Rep --</option>';
  data.forEach(rep => {
    const opt = document.createElement('option');
    opt.value = rep.id;
    opt.textContent = rep.name;
    select.appendChild(opt);
  });
}

newCustomerBtn.addEventListener('click', async () => {
  customerForm.reset();
  document.getElementById('customerId').value = '';
  await fetchSalesReps();
  customerModal.show();
});

customerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('customerId').value;
  const payload = {
    name: document.getElementById('customerName').value,
    email: document.getElementById('customerEmail').value,
    phone: document.getElementById('customerPhone').value,
    company: document.getElementById('customerCompany').value,
    sales_rep_id: document.getElementById('salesRepSelect').value || null
  };
  try {
    const method = id ? 'PUT' : 'POST';
    const url = `${API_BASE}/customers${id ? '/' + id : ''}`;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    customerModal.hide();
    loadCustomers(currentPage);
  } catch (err) {
    console.error('Error saving customer:', err);
  }
});

window.editCustomer = async function (id) {
  try {
    const res = await fetch(`${API_BASE}/customers?page=1&limit=1&search=`);
    const { data } = await res.json();
    const customer = data.find(c => c.id === id);
    if (!customer) return;
    document.getElementById('customerId').value = customer.id;
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerEmail').value = customer.email;
    document.getElementById('customerPhone').value = customer.phone;
    document.getElementById('customerCompany').value = customer.company;
    await fetchSalesReps();
    document.getElementById('salesRepSelect').value = customer.sales_rep_id || '';
    customerModal.show();
  } catch (err) {
    console.error('Error editing customer:', err);
  }
};

window.deleteCustomer = async function (id) {
  if (!confirm('Delete this customer?')) return;
  try {
    await fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' });
    loadCustomers(currentPage);
  } catch (err) {
    console.error('Error deleting customer:', err);
  }
};

document.getElementById('searchInput').addEventListener('input', () => loadCustomers(1));
exportCSVBtn.addEventListener('click', () => exportTableToCSV('customers.csv'));

loadCustomers();
