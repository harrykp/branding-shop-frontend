const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadSuppliers();
});

let allSuppliers = [];
const SUPPLIER_PAGE_SIZE = 5;

async function loadSuppliers(page = 1) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/suppliers`);
    allSuppliers = await res.json();
    const tbody = document.getElementById("suppliers-table-body");
    const search = document.getElementById("search-suppliers")?.value.toLowerCase() || "";

    let filtered = allSuppliers.filter(s =>
      s.name?.toLowerCase().includes(search) ||
      s.email?.toLowerCase().includes(search) ||
      s.phone?.toLowerCase().includes(search)
    );

    const totalPages = Math.ceil(filtered.length / SUPPLIER_PAGE_SIZE);
    const pageSuppliers = filtered.slice((page - 1) * SUPPLIER_PAGE_SIZE, page * SUPPLIER_PAGE_SIZE);

    tbody.innerHTML = "";
    pageSuppliers.forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${s.name}</td><td>${s.phone || ""}</td><td>${s.email || ""}</td><td>${s.address || ""}</td>`;
      tbody.appendChild(tr);
    });

    renderSupplierPagination(page, totalPages);
  } catch (err) {
    console.error("Error loading suppliers:", err);
  }
}

function renderSupplierPagination(current, total) {
  const pag = document.getElementById("pagination-suppliers");
  pag.innerHTML = "";
  for (let i = 1; i <= total; i++) {
    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-primary mx-1";
    btn.textContent = i;
    if (i === current) btn.classList.add("active");
    btn.onclick = () => loadSuppliers(i);
    pag.appendChild(btn);
  }
}
