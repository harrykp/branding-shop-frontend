const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadLeads();
});

let allLeads = [];
const LEADS_PAGE_SIZE = 8;

async function loadLeads(page = 1) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leads`);
    allLeads = await res.json();
    const user = getCurrentUser();
    const search = document.getElementById("search-leads")?.value.toLowerCase() || "";

    let filtered = allLeads.filter(l =>
      (l.name?.toLowerCase().includes(search) || l.contact?.toLowerCase().includes(search)) &&
      (user.roles.includes("admin") || l.created_by === user.id)
    );

    const totalPages = Math.ceil(filtered.length / LEADS_PAGE_SIZE);
    const pageLeads = filtered.slice((page - 1) * LEADS_PAGE_SIZE, page * LEADS_PAGE_SIZE);

    const tbody = document.getElementById("leads-body");
    tbody.innerHTML = "";
    pageLeads.forEach(l => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${l.name}</td><td>${l.status}</td><td>${l.contact}</td>`;
      tbody.appendChild(tr);
    });

    const pag = document.getElementById("pagination-leads");
    pag.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = "btn btn-sm btn-outline-primary mx-1";
      btn.textContent = i;
      if (i === page) btn.classList.add("active");
      btn.onclick = () => loadLeads(i);
      pag.appendChild(btn);
    }
  } catch (err) {
    console.error("Error loading leads:", err);
  }
}
