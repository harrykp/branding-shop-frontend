
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const tableBody = document.querySelector("#finance-table tbody");

  async function loadPayments() {
    const res = await fetchWithAuth("/api/payments");
    const payments = await res.json();

    tableBody.innerHTML = "";
    payments.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.order_id}</td>
        <td>${p.amount}</td>
        <td>${p.payment_type}</td>
        <td>${p.status}</td>
        <td>${p.created_at?.split('T')[0]}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadPayments();
});
