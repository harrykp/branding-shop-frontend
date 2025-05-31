const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadOrders();
});

let allOrders = [];
const ORDERS_PAGE_SIZE = 5;

async function loadOrders(page = 1) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/orders`);
    allOrders = await res.json();
    const user = getCurrentUser();
    const tbody = document.getElementById("order-table-body");
    const search = document.getElementById("search-orders")?.value.toLowerCase() || "";

    let filtered = allOrders.filter(o =>
      (user.roles.includes("admin") || user.roles.includes("sales") || o.user_id === user.id) &&
      (o.customer_name?.toLowerCase().includes(search) || o.status?.toLowerCase().includes(search))
    );

    const totalPages = Math.ceil(filtered.length / ORDERS_PAGE_SIZE);
    const pageOrders = filtered.slice((page - 1) * ORDERS_PAGE_SIZE, page * ORDERS_PAGE_SIZE);

    tbody.innerHTML = "";
    pageOrders.forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${o.id}</td>
        <td>${o.customer_name || ""}</td>
        <td>${o.items?.length || 0}</td>
        <td>₵${o.total_amount?.toFixed(2) || "0.00"}</td>
        <td>${renderOrderStatus(o)}</td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
        <td>
          ${o.user_id === user.id || user.roles.includes("admin") ? `<button class="btn btn-sm btn-info" onclick="viewOrder(${o.id})">View</button>` : ""}
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderOrderPagination(page, totalPages);
  } catch (err) {
    console.error("Error loading orders:", err);
  }
}

function renderOrderStatus(order) {
  const user = getCurrentUser();
  if (user.roles.includes("admin") || user.roles.includes("sales")) {
    return `
      <select onchange="updateOrderStatus(${order.id}, this.value)">
        <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pending</option>
        <option value="processing" ${order.status === "processing" ? "selected" : ""}>Processing</option>
        <option value="completed" ${order.status === "completed" ? "selected" : ""}>Completed</option>
      </select>`;
  }
  return order.status;
}

function renderOrderPagination(current, total) {
  const pag = document.getElementById("pagination-orders");
  pag.innerHTML = "";
  for (let i = 1; i <= total; i++) {
    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-primary mx-1";
    btn.textContent = i;
    if (i === current) btn.classList.add("active");
    btn.onclick = () => loadOrders(i);
    pag.appendChild(btn);
  }
}

function viewOrder(orderId) {
  alert("Order details coming soon: " + orderId);
}
