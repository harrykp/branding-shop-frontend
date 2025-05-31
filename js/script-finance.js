
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
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
        <td>${p.gateway}</td>
        <td>${p.created_at?.split('T')[0]}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deletePayment('${p.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.deletePayment = async (id) => {
    if (confirm("Delete this payment?")) {
      await fetchWithAuth("/api/payments/" + id, { method: "DELETE" });
      loadPayments();
    }
  };

  loadPayments();
});
