const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadProducts();
});

let allProducts = [];
const PRODUCT_PAGE_SIZE = 5;

async function loadProducts(page = 1) {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    allProducts = await res.json();
    const tbody = document.getElementById("product-table-body");
    const search = document.getElementById("search-products")?.value.toLowerCase() || "";

    let filtered = allProducts.filter(p =>
      p.name?.toLowerCase().includes(search) || p.category?.toLowerCase().includes(search)
    );

    const totalPages = Math.ceil(filtered.length / PRODUCT_PAGE_SIZE);
    const pageProducts = filtered.slice((page - 1) * PRODUCT_PAGE_SIZE, page * PRODUCT_PAGE_SIZE);

    tbody.innerHTML = "";
    pageProducts.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${p.name}</td><td>${p.category}</td><td>₵${p.unit_price?.toFixed(2)}</td><td>${p.description || ""}</td>`;
      tbody.appendChild(tr);
    });

    renderProductPagination(page, totalPages);
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

function renderProductPagination(current, total) {
  const pag = document.getElementById("pagination-products");
  pag.innerHTML = "";
  for (let i = 1; i <= total; i++) {
    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-primary mx-1";
    btn.textContent = i;
    if (i === current) btn.classList.add("active");
    btn.onclick = () => loadProducts(i);
    pag.appendChild(btn);
  }
}
