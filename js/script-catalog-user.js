
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const tableBody = document.querySelector("#catalog-table tbody");

  async function loadCatalog() {
    const res = await fetchWithAuth("/api/catalog");
    const catalog = await res.json();

    tableBody.innerHTML = "";
    catalog.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.name}</td>
        <td>${c.type}</td>
        <td>${c.price}</td>
        <td>${c.supplier_name || ''}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadCatalog();
});
