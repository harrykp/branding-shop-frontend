// /js/script-orders.js

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
    const result = await res.json();
    const data = result.data || result.orders || [];
    const total = result.total || data.length;

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
          <button class="btn btn-sm btn-info" onclick='viewOrder(${o.id})'>View</button>
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

async function viewOrder(id) {
  try {
    const res = await fetchWithAuth(`/api/orders/${id}`);
    const o = await res.json();

    document.getElementById('viewOrderCustomer').textContent = o.customer_name;
    document.getElementById('viewOrderRep').textContent = o.sales_rep_name;
    document.getElementById('viewOrderStatus').textContent = o.status;
    document.getElementById('viewOrderTotal').textContent = o.total;
    document.getElementById('viewOrderDate').textContent = new Date(o.created_at).toLocaleString();

    const viewItems = document.getElementById('viewOrderItems');
    viewItems.innerHTML = '';
    if (Array.isArray(o.items)) {
      o.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.product_name}</td>
          <td>${item.qty}</td>
          <td>${item.unit_price}</td>
          <td>${(item.qty * item.unit_price).toFixed(2)}</td>
        `;
        viewItems.appendChild(row);
      });
    }

    new bootstrap.Modal(document.getElementById('viewOrderModal')).show();
  } catch (err) {
    console.error('Failed to fetch order details:', err);
  }
}

// ... (rest of the code unchanged)

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
  await populateSelect('customers', 'orderCustomerId');
  await populateSelect('users?role=sales_rep', 'orderSalesRepId');
  await populateSelect('products', '');
  loadOrders();
});
