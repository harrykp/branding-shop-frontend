
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#order-table tbody");

  async function loadOrders() {
    const res = await fetchWithAuth("/api/orders");
    const orders = await res.json();

    tableBody.innerHTML = "";
    orders.forEach(order => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${order.order_number || 'N/A'}</td>
        <td>${order.customer_name || 'N/A'}</td>
        <td>${order.created_at?.split('T')[0]}</td>
        <td>
          <select onchange="updateStatus('${order.id}', this.value)">
            <option ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>${order.total}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editOrder('${order.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.updateStatus = async (id, status) => {
    await fetchWithAuth("/api/orders/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    loadOrders();
  };

  window.editOrder = (id) => alert("Edit order: " + id);
  window.deleteOrder = async (id) => {
    if (confirm("Delete this order?")) {
      await fetchWithAuth("/api/orders/" + id, { method: "DELETE" });
      loadOrders();
    }
  };

  loadOrders();
});
