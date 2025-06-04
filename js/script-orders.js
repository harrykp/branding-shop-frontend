// js/script-orders.js

let orderModal;
const ordersTableBody = document.getElementById('orders-table-body');
const orderForm = document.getElementById('orderForm');
const searchInput = document.getElementById('searchInput');
let currentPage = 1;

function exportOrdersToCSV() {
  exportTableToCSV('ordersTable');
}

async function loadOrders(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetchWithAuth(`/api/orders?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();
    if (!Array.isArray(data)) {
      console.error("Expected array for orders but got:", data);
      return;
    }
    ordersTableBody.innerHTML = '';
    data.forEach(o => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.customer_name}</td>
        <td>${o.sales_rep_name}</td>
        <td>
          <select class="form-select form-select-sm" onchange="updateOrderStatus(${o.id}, this.value)">
            <option ${o.status === 'pending' ? 'selected' : ''}>pending</option>
            <option ${o.status === 'approved' ? 'selected' : ''}>approved</option>
            <option ${o.status === 'completed' ? 'selected' : ''}>completed</option>
            <option ${o.status === 'cancelled' ? 'selected' : ''}>cancelled</option>
          </select>
        </td>
        <td>${o.total}</td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick='viewOrder(${JSON.stringify(o)})'>View</button>
          <button class="btn btn-sm btn-primary" onclick='editOrder(${JSON.stringify(o)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteOrder(${o.id})'>Delete</button>
        </td>`;
      ordersTableBody.appendChild(tr);
    });
    renderPagination(total, 'pagination', loadOrders);
  } catch (err) {
    console.error('Failed to load orders:', err);
  }
}

async function updateOrderStatus(id, status) {
  try {
    await fetchWithAuth(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    loadOrders(currentPage);
  } catch (err) {
    console.error('Failed to update order status:', err);
  }
}

window.viewOrder = function(o) {
  document.getElementById('viewOrderCustomer').textContent = o.customer_name;
  document.getElementById('viewOrderRep').textContent = o.sales_rep_name;
  document.getElementById('viewOrderStatus').textContent = o.status;
  document.getElementById('viewOrderTotal').textContent = o.total;
  document.getElementById('viewOrderDate').textContent = new Date(o.created_at).toLocaleString();

  const tbody = document.getElementById('viewOrderItems');
  tbody.innerHTML = '';
  if (Array.isArray(o.items) && o.items.length > 0) {
    o.items.forEach(item => {
      const row = document.createElement('tr');
      const subtotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
      row.innerHTML = `
        <td>${item.product_name}</td>
        <td>${item.quantity}</td>
        <td>${item.unit_price}</td>
        <td>${subtotal.toFixed(2)}</td>
      `;
      tbody.appendChild(row);
    });
  } else {
    tbody.innerHTML = `<tr><td colspan="4">No items found.</td></tr>`;
  }
  new bootstrap.Modal(document.getElementById('viewOrderModal')).show();
}

window.editOrder = function(o) {
  document.getElementById('orderId').value = o.id;
  document.getElementById('orderCustomerId').value = o.customer_id;
  document.getElementById('orderSalesRepId').value = o.sales_rep_id;
  document.getElementById('orderStatus').value = o.status;
  document.getElementById('orderTotal').value = o.total;
  const tbody = document.getElementById('orderItems');
  tbody.innerHTML = '';
  if (Array.isArray(o.items)) {
    o.items.forEach(item => addOrderItemRow(item.product_id, item.quantity, item.unit_price));
  }
  orderModal.show();
}

function addOrderItemRow(productId = '', quantity = 1, unit_price = 0) {
  const tbody = document.getElementById('orderItems');
  const row = document.createElement('tr');
  row.className = 'item-row';
  row.innerHTML = `
    <td><select class="form-select item-product"></select></td>
    <td><input type="number" class="form-control item-qty" value="${quantity}" min="1"></td>
    <td><input type="number" class="form-control item-price" value="${unit_price}" min="0"></td>
    <td class="item-subtotal">0.00</td>
    <td><button type="button" class="btn btn-sm btn-danger" onclick="this.closest('tr').remove(); recalculateTotal('orderItems', 'orderTotal')">&times;</button></td>
  `;
  tbody.appendChild(row);
  populateSelect('products', row.querySelector('select'));
  if (productId) row.querySelector('select').value = productId;
  setupRowListeners(row);
  recalculateTotal('orderItems', 'orderTotal');
}

function setupRowListeners(row) {
  row.querySelector('.item-qty').addEventListener('input', () => recalculateTotal('orderItems', 'orderTotal'));
  row.querySelector('.item-price').addEventListener('input', () => recalculateTotal('orderItems', 'orderTotal'));
}

orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('orderId').value;
  const itemRows = Array.from(document.querySelectorAll('#orderItems .item-row'));
  const items = itemRows.map(row => ({
    product_id: row.querySelector('select')?.value,
    quantity: parseInt(row.querySelector('.item-qty')?.value) || 0,
    unit_price: parseFloat(row.querySelector('.item-price')?.value) || 0
  })).filter(item => item.product_id && item.quantity > 0);

  const payload = {
    customer_id: document.getElementById('orderCustomerId').value,
    sales_rep_id: document.getElementById('orderSalesRepId').value,
    status: document.getElementById('orderStatus').value,
    total: document.getElementById('orderTotal').value,
    items
  };

  console.log("Submitting order payload:", payload);

  if (!items.length) {
    alert("Please add at least one item.");
    return;
  }

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

window.deleteOrder = async function(id) {
  if (!confirm('Delete this order?')) return;
  try {
    await fetchWithAuth(`/api/orders/${id}`, { method: 'DELETE' });
    loadOrders(currentPage);
  } catch (err) {
    console.error('Failed to delete order:', err);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
  await populateSelect('customers', 'orderCustomerId');
  await populateSelect('users?role=sales_rep', 'orderSalesRepId');
  loadOrders();
});
