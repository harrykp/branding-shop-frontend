// /js/script-orders.js

let currentPage = 1;
let orderModal, orderViewModal;

const ordersTableBody = document.getElementById("orders-table-body");
const searchInput = document.getElementById("searchInput");
const orderForm = document.getElementById("orderForm");

window.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();
  orderModal = new bootstrap.Modal(document.getElementById("orderModal"));
  orderViewModal = new bootstrap.Modal(document.getElementById("orderViewModal"));

  await populateSelect("customers", "customerId");
  await populateSelect("users?role=sales_rep", "salesRepId");
  await populateSelect("products", "products-cache");

  loadOrders();
});

searchInput.addEventListener("input", () => loadOrders(1));

async function loadOrders(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetchWithAuth(`/api/orders?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();

    ordersTableBody.innerHTML = "";
    data.forEach((order) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${order.customer_name}</td>
        <td>${order.sales_rep_name}</td>
        <td>${order.status}</td>
        <td>${order.total}</td>
        <td>${new Date(order.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick='editOrder(${JSON.stringify(order)})'>Edit</button>
          <button class="btn btn-sm btn-info" onclick='viewOrder(${order.id})'>View</button>
          <button class="btn btn-sm btn-danger" onclick='deleteOrder(${order.id})'>Delete</button>
        </td>
      `;
      ordersTableBody.appendChild(tr);
    });

    renderPagination(total, "pagination", loadOrders, 10, currentPage);
  } catch (err) {
    console.error("Failed to load orders:", err);
  }
}

function addOrder() {
  orderForm.reset();
  document.getElementById("orderId").value = "";
  document.getElementById("itemsContainer").innerHTML = "";
  addOrderItemRow();
  orderModal.show();
}

function addOrderItemRow(item = {}) {
  const container = document.getElementById("itemsContainer");
  const row = document.createElement("tr");
  row.classList.add("item-row");

  row.innerHTML = `
    <td>
      <select class="form-select item-product" onchange="onProductChange(this)"></select>
    </td>
    <td><input type="number" class="form-control item-qty" value="${item.qty || 1}" onchange="recalculateTotal('itemsContainer', 'total')"></td>
    <td><input type="number" class="form-control item-price" value="${item.unit_price || 0}" onchange="recalculateTotal('itemsContainer', 'total')"></td>
    <td class="item-subtotal">0.00</td>
    <td><button type="button" class="btn btn-sm btn-danger" onclick="this.closest('tr').remove(); recalculateTotal('itemsContainer', 'total')">&times;</button></td>
  `;

  container.appendChild(row);
  populateSelect("products", row.querySelector(".item-product"));
  if (item.product_id) row.querySelector(".item-product").value = item.product_id;
  if (item.unit_price) row.querySelector(".item-price").value = item.unit_price;
  if (item.qty) row.querySelector(".item-qty").value = item.qty;
  calculateItemTotal(row);
  recalculateTotal("itemsContainer", "total");
}

function onProductChange(selectEl) {
  const price = selectEl.selectedOptions[0].dataset.price || 0;
  const row = selectEl.closest("tr");
  row.querySelector(".item-price").value = price;
  recalculateTotal("itemsContainer", "total");
}

orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("orderId").value;
  const payload = {
    customer_id: document.getElementById("customerId").value,
    sales_rep_id: document.getElementById("salesRepId").value,
    status: document.getElementById("status").value,
    items: []
  };

  document.querySelectorAll("#itemsContainer .item-row").forEach((row) => {
    payload.items.push({
      product_id: row.querySelector(".item-product").value,
      qty: parseFloat(row.querySelector(".item-qty").value),
      unit_price: parseFloat(row.querySelector(".item-price").value)
    });
  });

  try {
    const method = id ? "PUT" : "POST";
    const url = `/api/orders${id ? "/" + id : ""}`;
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    orderModal.hide();
    loadOrders(currentPage);
  } catch (err) {
    console.error("Failed to save order:", err);
  }
});

async function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;
  try {
    await fetchWithAuth(`/api/orders/${id}`, { method: "DELETE" });
    loadOrders(currentPage);
  } catch (err) {
    console.error("Failed to delete order:", err);
  }
}

function editOrder(order) {
  document.getElementById("orderId").value = order.id;
  document.getElementById("customerId").value = order.customer_id;
  document.getElementById("salesRepId").value = order.sales_rep_id;
  document.getElementById("status").value = order.status;
  document.getElementById("itemsContainer").innerHTML = "";
  (order.items || []).forEach(addOrderItemRow);
  recalculateTotal("itemsContainer", "total");
  orderModal.show();
}

async function viewOrder(id) {
  try {
    const res = await fetchWithAuth(`/api/orders/${id}`);
    const order = await res.json();

    const content = `
      <p><strong>Customer:</strong> ${order.customer_name}</p>
      <p><strong>Sales Rep:</strong> ${order.sales_rep_name}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Total:</strong> ${order.total}</p>
      <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
      <hr />
      <h5>Items</h5>
      <table class="table">
        <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${(order.items || []).map(item => `
            <tr>
              <td>${item.product_name}</td>
              <td>${item.qty}</td>
              <td>${item.unit_price}</td>
              <td>${(item.unit_price * item.qty).toFixed(2)}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    `;
    document.getElementById("orderViewContent").innerHTML = content;
    orderViewModal.show();
  } catch (err) {
    console.error("Failed to view order:", err);
  }
}
