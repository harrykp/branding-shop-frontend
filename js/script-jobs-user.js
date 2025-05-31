const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadJobs();
});

let allJobs = [];
const JOBS_PAGE_SIZE = 5;

async function loadJobs(page = 1) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/jobs`);
    allJobs = await res.json();
    const user = getCurrentUser();
    const tbody = document.getElementById("job-table-body");
    const search = document.getElementById("search-jobs")?.value.toLowerCase() || "";

    let filtered = allJobs.filter(j =>
      (
        user.roles.includes("admin") ||
        user.roles.includes("employee") ||
        j.user_id === user.id
      ) &&
      (
        j.status?.toLowerCase().includes(search) ||
        j.product_name?.toLowerCase().includes(search) ||
        j.department?.toLowerCase().includes(search)
      )
    );

    const totalPages = Math.ceil(filtered.length / JOBS_PAGE_SIZE);
    const pageJobs = filtered.slice((page - 1) * JOBS_PAGE_SIZE, page * JOBS_PAGE_SIZE);

    tbody.innerHTML = "";
    pageJobs.forEach(j => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${j.id}</td>
        <td>${j.order_id || ""}</td>
        <td>${j.product_name || ""}</td>
        <td>${j.quantity || 0}</td>
        <td>${j.status}</td>
        <td>${j.department || ""}</td>
        <td>${new Date(j.created_at).toLocaleDateString()}</td>
      `;
      tbody.appendChild(tr);
    });

    renderJobPagination(page, totalPages);
  } catch (err) {
    console.error("Error loading jobs:", err);
  }
}

function renderJobPagination(current, total) {
  const pag = document.getElementById("pagination-jobs");
  pag.innerHTML = "";
  for (let i = 1; i <= total; i++) {
    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-primary mx-1";
    btn.textContent = i;
    if (i === current) btn.classList.add("active");
    btn.onclick = () => loadJobs(i);
    pag.appendChild(btn);
  }
}
