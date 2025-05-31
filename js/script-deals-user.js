const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadDeals();
});

let allDeals = [];
const DEALS_PAGE_SIZE = 10;

async function loadDeals(page = 1) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/deals`);
    allDeals = await res.json();
    const user = getCurrentUser();
    const search = document.getElementById("search-deals")?.value.toLowerCase() || "";

    let filtered = allDeals.filter(d =>
      (d.customer_name?.toLowerCase().includes(search) || d.stage?.toLowerCase().includes(search)) &&
      (user.roles.includes("admin") || d.created_by === user.id)
    );

    const totalPages = Math.ceil(filtered.length / DEALS_PAGE_SIZE);
    const pageDeals = filtered.slice((page - 1) * DEALS_PAGE_SIZE, page * DEALS_PAGE_SIZE);

    const tbody = document.getElementById("deals-body");
    tbody.innerHTML = "";
    pageDeals.forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${d.customer_name}</td><td>${d.stage}</td><td>₵${d.amount}</td><td>${d.status}</td>`;
      tbody.appendChild(tr);
    });

    const pag = document.getElementById("pagination-deals");
    pag.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = "btn btn-sm btn-outline-primary mx-1";
      btn.textContent = i;
      if (i === page) btn.classList.add("active");
      btn.onclick = () => loadDeals(i);
      pag.appendChild(btn);
    }
  } catch (err) {
    console.error("Deals error:", err);
  }
}
