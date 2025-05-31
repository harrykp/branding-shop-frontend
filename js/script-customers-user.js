const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadCustomers();
});

let allCustomers = [];
const CUSTOMER_PAGE_SIZE = 5;

async function loadCustomers(page = 1) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/users`);
    allCustomers = await res.json();
    const tbody = document.getElementById("customers-table-body");
    const search = document.getElementById("search-customers")?.value.toLowerCase() || "";

    let filtered = allCustomers.filter(c =>
      (c.full_name?.toLowerCase().includes(search) ||
       c.email?.toLowerCase().includes(search) ||
       c.phone?.toLowerCase().includes(search)) &&
      c.roles?.includes("customer")
    );

    const totalPages = Math.ceil(filtered.length / CUSTOMER_PAGE_SIZE);
    const pageCustomers = filtered.slice((page - 1) * CUSTOMER_PAGE_SIZE, page * CUSTOMER_PAGE_SIZE);

    tbody.innerHTML = "";
    pageCustomers.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${c.full_name}</td><td>${c.email}</td><td>${c.phone || ""}</td>`;
      tbody.appendChild(tr);
    });

    renderCustomerPagination(page, totalPages);
  } catch (err) {
    console.error("Error loading customers:", err);
  }
}

function renderCustomerPagination(current, total) {
  const pag = document.getElementById("pagination-customers");
  pag.innerHTML = "";
  for (let i = 1; i <= total; i++) {
    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-primary mx-1";
    btn.textContent = i;
    if (i === current) btn.classList.add("active");
    btn.onclick = () => loadCustomers(i);
    pag.appendChild(btn);
  }
}
