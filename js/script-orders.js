// /js/script-orders.js

let orderModal;
const ordersTableBody = document.getElementById('orders-table-body');
const orderForm = document.getElementById('orderForm');
const searchInput = document.getElementById('searchInput');
let currentPage = 1;

function exportOrdersToCSV() {
  exportTableToCSV('orders.csv');
}

async function loadOrders(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetch(`${API_BASE}/api/orders?page=${page}&limit=10&search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    const { orders, total } = await res.json();

    ordersTableBody.innerHTML = '';
    orders.forEach(o => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.customer_name}</td>
        <td>${o.sales_rep_name}</td>
        <td>${o.status}</td>
        <td>${o.total}</td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick='editOrder(${JSON.stringify(o)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteOrder(${o.id})'>Delete</button>
        </td>`;
      ordersTableBody.appendChild(tr);
    });

    renderPagination(total, 10, currentPage, loadOrders);
  } catch (err) {
    console.error('Failed to load orders:', err);
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

function editOrder(o) {
  document.getElementById('orderId').value = o.id;
  document.getElementById('customerId').value = o.customer_id;
  document.getElementById('salesRepId').value = o.sales_rep_id;
  document.getElementById('status').value = o.status;
  document.getElementById('total').value = o.total;
  orderModal.show();
}

async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  try {
    await fetch(`${API_BASE}/api/orders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.token}` }
    });
    loadOrders(currentPage);
  } catch (err) {
    console.error('Failed to delete order:', err);
  }
}

orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('orderId').value;
  const payload = {
    customer_id: document.getElementById('customerId').value,
    sales_rep_id: document.getElementById('salesRepId').value,
    status: document.getElementById('status').value,
    total: document.getElementById('total').value
  };
  try {
    const method = id ? 'PUT' : 'POST';
    const url = `${API_BASE}/api/orders${id ? '/' + id : ''}`;
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.token}`
      },
      body: JSON.stringify(payload)
    });
    orderModal.hide();
    loadOrders(currentPage);
  } catch (err) {
    console.error('Failed to save order:', err);
  }
});

searchInput.addEventListener('input', () => loadOrders(1));

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  orderModal = new bootstrap.Modal(document.getElementById('editOrderModal'));
  await populateDropdown('customers', 'customerId');
  await populateDropdown('users?role=sales_rep', 'salesRepId');
  loadOrders();
});
