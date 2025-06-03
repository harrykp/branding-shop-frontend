// /js/script-orders.js

let orderModal;
let viewOrderModal;
const ordersTableBody = document.getElementById('orders-table-body');
const orderForm = document.getElementById('orderForm');
const searchInput = document.getElementById('searchInput');
let currentPage = 1;

function exportOrdersToCSV() {
  exportTableToCSV('orders-table', 'orders.csv');
}

async function loadOrders(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetchWithAuth(`/api/orders?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const { data: orders, total } = await res.json();

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
          <button class="btn btn-sm btn-info" onclick='viewOrder(${JSON.stringify(o)})'>View</button>
          <button class="btn btn-sm btn-primary" onclick='editOrder(${JSON.stringify(o)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteOrder(${o.id})'>Delete</button>
        </td>`;
      ordersTableBody.appendChild(tr);
    });

    renderPagination(total, 'pagination', loadOrders, 10, currentPage);
  } catch (err) {
    console.error('Failed to load orders:', err);
  }
}

function viewOrder(order) {
  const container = document.getElementById('viewOrderContent');
  container.innerHTML = `
    <h5>Customer: ${order.customer_name}</h5>
    <p><strong>Sales Rep:</strong> ${order.sales_rep_name}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <p><strong>Total:</strong> ${order.total}</p>
    <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
    <hr>
    <h6>Items:</h6>
    <ul>
      ${(order.items || []).map(item => `<li>${item.product_name} - Qty: ${item.qty} @ ${item.unit_price} = ${item.subtotal}</li>`).join('') || '<li>No items found.</li>'}
    </ul>
  `;
  viewOrderModal.show();
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
    await fetchWithAuth(`/api/orders/${id}`, { method: 'DELETE' });
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
    const url = `/api/orders${id ? '/' + id : ''}`;
    await fetchWithAuth(url, {
      method,
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
  viewOrderModal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
  await populateSelect('customers', document.getElementById('customerId'));
  await populateSelect('users?role=sales_rep', document.getElementById('salesRepId'));
  loadOrders();
});
