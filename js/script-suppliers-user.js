
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const tableBody = document.querySelector("#suppliers-table tbody");

  async function loadSuppliers() {
    const res = await fetchWithAuth("/api/suppliers");
    const suppliers = await res.json();

    tableBody.innerHTML = "";
    suppliers.forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.name}</td>
        <td>${s.phone || ''}</td>
        <td>${s.email || ''}</td>
        <td>${s.products || ''}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadSuppliers();
});
