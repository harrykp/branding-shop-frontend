
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#supplier-table tbody");

  async function loadSuppliers() {
    const res = await fetchWithAuth("/api/suppliers");
    const suppliers = await res.json();

    tableBody.innerHTML = "";
    suppliers.forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${s.phone}</td>
        <td>${s.address}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editSupplier('${s.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${s.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.editSupplier = (id) => alert("Edit supplier: " + id);
  window.deleteSupplier = async (id) => {
    if (confirm("Delete this supplier?")) {
      await fetchWithAuth("/api/suppliers/" + id, { method: "DELETE" });
      loadSuppliers();
    }
  };

  loadSuppliers();
});
