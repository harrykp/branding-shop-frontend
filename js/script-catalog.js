
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#catalog-table tbody");

  async function loadCatalog() {
    const res = await fetchWithAuth("/api/catalog");
    const items = await res.json();

    tableBody.innerHTML = "";
    items.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.item_name}</td>
        <td>${item.supplier_name || ""}</td>
        <td>${item.price}</td>
        <td>${item.stock_qty || 0}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editCatalogItem('${item.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCatalogItem('${item.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.editCatalogItem = (id) => alert("Edit catalog item: " + id);
  window.deleteCatalogItem = async (id) => {
    if (confirm("Delete this item?")) {
      await fetchWithAuth("/api/catalog/" + id, { method: "DELETE" });
      loadCatalog();
    }
  };

  loadCatalog();
});
