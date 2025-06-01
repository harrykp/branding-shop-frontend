if (typeof window.API_BASE === "undefined") {
  window.API_BASE = "https://branding-shop-backend.onrender.com";
}

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  requireAdmin();
  await loadRoles();

  const form = document.getElementById("edit-role-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-role-id").value;
      const name = document.getElementById("edit-role-name").value.trim();

      const method = id ? "PUT" : "POST";
      const endpoint = id ? `/api/roles/${id}` : `/api/roles`;

      const res = await fetchWithAuth(`${API_BASE}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById("roleModal")).hide();
        loadRoles();
      } else {
        alert("Failed to save role");
      }
    });
  }
});

let allRoles = [];
let currentPage = 1;
const PER_PAGE = 5;

async function loadRoles() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/roles`);
    allRoles = await res.json();
    renderRoles();
  } catch (err) {
    console.error("Error loading roles:", err);
  }
}

function renderRoles() {
  const tableBody = document.getElementById("roles-table-body");
  const searchTerm = document.getElementById("search-roles").value.toLowerCase();
  const filtered = allRoles.filter(r => r.name.toLowerCase().includes(searchTerm));

  const start = (currentPage - 1) * PER_PAGE;
  const paginated = filtered.slice(start, start + PER_PAGE);

  tableBody.innerHTML = "";
  for (const role of paginated) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${role.id}</td>
      <td>${role.name}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editRole(${role.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteRole(${role.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  }

  renderPagination(filtered.length, "pagination-roles", (page) => {
    currentPage = page;
    renderRoles();
  });
}

function editRole(id) {
  const role = allRoles.find(r => r.id === id);
  document.getElementById("edit-role-id").value = role.id;
  document.getElementById("edit-role-name").value = role.name;
  new bootstrap.Modal(document.getElementById("roleModal")).show();
}

function openNewModal() {
  document.getElementById("edit-role-id").value = "";
  document.getElementById("edit-role-name").value = "";
  new bootstrap.Modal(document.getElementById("roleModal")).show();
}

async function deleteRole(id) {
  if (!confirm("Are you sure?")) return;
  const res = await fetchWithAuth(`${API_BASE}/api/roles/${id}`, { method: "DELETE" });
  if (res.ok) loadRoles();
  else alert("Failed to delete role");
}

function exportToCSV() {
  const csv = ["id,name"];
  allRoles.forEach(role => {
    csv.push(`${role.id},"${role.name.replace(/"/g, '""')}"`);
  });
  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "roles.csv";
  a.click();
}
