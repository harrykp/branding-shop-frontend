
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const tableBody = document.querySelector("#orders-table tbody");

  async function loadOrders() {
    const res = await fetchWithAuth("/api/orders");
    const orders = await res.json();

    tableBody.innerHTML = "";
    orders.forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${o.id}</td>
        <td>${o.total}</td>
        <td>${o.status}</td>
        <td>${o.created_at?.split('T')[0]}</td>
        <td>
          <a class="btn btn-sm btn-primary" href="order-detail.html?id=${o.id}">View</a>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadOrders();
});
