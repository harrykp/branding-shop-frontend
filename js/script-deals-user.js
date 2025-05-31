
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const tableBody = document.querySelector("#deals-table tbody");

  async function loadDeals() {
    const res = await fetchWithAuth("/api/deals");
    const deals = await res.json();

    tableBody.innerHTML = "";
    deals.forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.customer_name}</td>
        <td>${d.quote_id}</td>
        <td>${d.status}</td>
        <td>${d.created_at?.split('T')[0]}</td>
        <td><button class="btn btn-sm btn-primary">View</button></td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadDeals();
});
