
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#deal-table tbody");

  async function loadDeals() {
    const res = await fetchWithAuth("/api/deals");
    const deals = await res.json();

    tableBody.innerHTML = "";
    deals.forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.customer_name}</td>
        <td>${d.quote_id}</td>
        <td>
          <select class="form-select form-select-sm" onchange="updateDealStatus('${d.id}', this.value)">
            <option ${d.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${d.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option ${d.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </td>
        <td>${d.sales_rep_name || ''}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editDeal('${d.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDeal('${d.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.updateDealStatus = async (id, status) => {
    await fetchWithAuth("/api/deals/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  };

  window.editDeal = (id) => alert("Edit deal: " + id);
  window.deleteDeal = async (id) => {
    if (confirm("Delete this deal?")) {
      await fetchWithAuth("/api/deals/" + id, { method: "DELETE" });
      loadDeals();
    }
  };

  loadDeals();
});
