
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#product-table tbody");

  async function loadProducts() {
    const res = await fetchWithAuth("/api/products");
    const products = await res.json();

    tableBody.innerHTML = "";
    products.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>${p.category_name || ''}</td>
        <td>${p.unit_price}</td>
        <td>${p.sellable ? "Yes" : "No"}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editProduct('${p.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.editProduct = (id) => alert("Edit product: " + id);
  window.deleteProduct = async (id) => {
    if (confirm("Delete this product?")) {
      await fetchWithAuth("/api/products/" + id, { method: "DELETE" });
      loadProducts();
    }
  };

  loadProducts();
});
