
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const tableBody = document.querySelector("#po-table tbody");

  async function loadPurchaseOrders() {
    const res = await fetchWithAuth("/api/purchase-orders");
    const pos = await res.json();

    tableBody.innerHTML = "";
    pos.forEach(po => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${po.id}</td>
        <td>${po.supplier_name}</td>
        <td>${po.total}</td>
        <td>${po.status}</td>
        <td>${po.created_at?.split('T')[0]}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadPurchaseOrders();
});
