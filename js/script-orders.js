// /js/script-orders.js

let orderModal;
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
    const { data, total } = await res.json();

    ordersTableBody.innerHTML = '';
    data.forEach(order => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${order.customer_name}</td>
        <td>${order.sales_rep_name}</td>
        <td>${order.status}</td>
        <td>${order.total}</td>
        <td>${new Date(order.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick='viewOrder(${JSON.stringify(order)})'>View</button>
          <button class="btn btn-sm btn-primary" onclick='editOrder(${JSON.stringify(order)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteOrder(${order.id})'>Delete</button>
        </td>`;
      ordersTableBody.appendChild(tr);
    });

    renderPagination(total, 'pagination', loadOrders, 10, page);
  } catch (err) {
    console.error('Failed to load orders:', err);
  }
}

function editOrder(order) {
  document.getElementById('orderId').value = order.id;
  document.getElementById('orderCustomerId').value = order.customer_id;
  document.getElementById('orderSalesRepId').value = order.sales_rep_id;
  document.getElementById('orderStatus').value = order.status;
  document.getElementById('orderItemsContainer').innerHTML = '';

  order.items.forEach(item => {
    addItemRow('orderItemsContainer', 'orderTotal', 'order', item);
  });

  recalculateTotal('orderItemsContainer', 'orderTotal');
  orderModal.show();
}

function viewOrder(order) {
  const viewBody = document.getElementById('orderViewBody');
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.product_name}</td>
      <td>${item.description}</td>
      <td>${item.qty}</td>
      <td>${item.unit_price}</td>
      <td>${item.subtotal}</td>
    </tr>`).join('');

  viewBody.innerHTML = `
    <p><strong>Customer:</strong> ${order.customer_name}</p>
    <p><strong>Sales Rep:</strong> ${order.sales_rep_name}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
    <h5>Items</h5>
    <table class="table table-sm">
      <thead><tr><th>Product</th><th>Description</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p><strong>Total:</strong> GHS ${order.total}</p>
  `;

  const viewModal = new bootstrap.Modal(document.getElementById('orderViewModal'));
  viewModal.show();
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
  const items = Array.from(document.querySelectorAll('#orderItemsContainer .item-row')).map(row => ({
    product_id: row.querySelector('.item-product')?.value,
    qty: row.querySelector('.item-qty')?.value,
    unit_price: row.querySelector('.item-price')?.value
  })).filter(i => i.product_id);

  const payload = {
    customer_id: document.getElementById('orderCustomerId').value,
    sales_rep_id: document.getElementById('orderSalesRepId').value,
    status: document.getElementById('orderStatus').value,
    total: document.getElementById('orderTotal').value,
    items
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

function addOrderItem() {
  addItemRow('orderItemsContainer', 'orderTotal', 'order');
}

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
  await populateSelect('customers', 'orderCustomerId');
  await populateSelect('users?role=sales_rep', 'orderSalesRepId');
  await populateSelect('products', ''); // preload products
  loadOrders();
});
