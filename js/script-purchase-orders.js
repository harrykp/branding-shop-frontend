
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#po-table tbody");

  async function loadPOs() {
    const res = await fetchWithAuth("/api/purchase-orders");
    const pos = await res.json();

    tableBody.innerHTML = "";
    pos.forEach(po => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${po.supplier_name}</td>
        <td>${po.item_name}</td>
        <td>${po.quantity}</td>
        <td>
          <select class="form-select form-select-sm" onchange="updatePOStatus('${po.id}', this.value)">
            <option ${po.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${po.status === 'Ordered' ? 'selected' : ''}>Ordered</option>
            <option ${po.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
        <td>${po.created_at?.split('T')[0]}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editPO('${po.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deletePO('${po.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.updatePOStatus = async (id, status) => {
    await fetchWithAuth("/api/purchase-orders/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  };

  window.editPO = (id) => alert("Edit PO: " + id);
  window.deletePO = async (id) => {
    if (confirm("Delete this PO?")) {
      await fetchWithAuth("/api/purchase-orders/" + id, { method: "DELETE" });
      loadPOs();
    }
  };

  loadPOs();
});
