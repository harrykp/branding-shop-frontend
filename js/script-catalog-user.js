const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadCatalog();
});

let allCatalog = [];
const CATALOG_PAGE_SIZE = 10;

async function loadCatalog(page = 1) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/catalog`);
    allCatalog = await res.json();
    const search = document.getElementById("search-catalog")?.value.toLowerCase() || "";

    let filtered = allCatalog.filter(i =>
      i.name?.toLowerCase().includes(search) || i.description?.toLowerCase().includes(search)
    );

    const totalPages = Math.ceil(filtered.length / CATALOG_PAGE_SIZE);
    const pageItems = filtered.slice((page - 1) * CATALOG_PAGE_SIZE, page * CATALOG_PAGE_SIZE);

    const tbody = document.getElementById("catalog-body");
    tbody.innerHTML = "";
    pageItems.forEach(i => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${i.name}</td><td>${i.description || ""}</td><td>₵${i.price || 0}</td>`;
      tbody.appendChild(tr);
    });

    const pag = document.getElementById("pagination-catalog");
    pag.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = "btn btn-sm btn-outline-primary mx-1";
      btn.textContent = i;
      if (i === page) btn.classList.add("active");
      btn.onclick = () => loadCatalog(i);
      pag.appendChild(btn);
    }
  } catch (err) {
    console.error("Catalog error:", err);
  }
}
