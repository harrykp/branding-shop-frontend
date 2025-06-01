
if (typeof window.API_BASE === "undefined") {
  window.API_BASE = "https://branding-shop-backend.onrender.com";
}

document.addEventListener("DOMContentLoaded", () => {
  requireAdmin();
  loadUsers();

  const searchInput = document.getElementById("search-users");
  if (searchInput) {
    searchInput.addEventListener("input", () => renderTable());
  }

  const form = document.getElementById("edit-user-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-user-id").value;
      const name = document.getElementById("edit-user-name").value;
      const email = document.getElementById("edit-user-email").value;
      const roles = document.getElementById("edit-user-roles").value.split(",").map(r => r.trim()).filter(Boolean);

      await fetchWithAuth(`${API_BASE}/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name, email, roles })
      });

      const modal = bootstrap.Modal.getInstance(document.getElementById("editUserModal"));
      modal.hide();
      loadUsers();
    });
  }

  document.getElementById("export-users-csv").addEventListener("click", () => {
    if (!Array.isArray(allUsers)) return;
    let csv = "Name,Email,Roles\n";
    allUsers.forEach(u => {
      csv += `"${u.full_name}","${u.email}","${u.roles.join(" | ")}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
  });
});

let allUsers = [];
let currentPage = 1;
const USERS_PER_PAGE = 10;

async function loadUsers() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/users`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Expected array of users");
    allUsers = data;
    renderTable();
  } catch (err) {
    console.error("Failed to load users:", err);
  }
}

function renderTable() {
  const tbody = document.getElementById("user-table-body");
  if (!tbody) return;

  const search = (document.getElementById("search-users")?.value || "").toLowerCase();
  const filtered = allUsers.filter(u =>
    u.full_name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
  );

  const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
  if (currentPage > totalPages) currentPage = 1;
  const start = (currentPage - 1) * USERS_PER_PAGE;
  const pageData = filtered.slice(start, start + USERS_PER_PAGE);

  tbody.innerHTML = "";
  pageData.forEach(user => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.full_name}</td>
      <td>${user.email}</td>
      <td>${user.roles.join(", ")}</td>
      <td>
        <button class="btn btn-sm btn-primary me-2" onclick="openEditModal(${user.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination(filtered.length);
}

function renderPagination(totalItems) {
  const container = document.getElementById("pagination-users");
  if (!container) return;

  const totalPages = Math.ceil(totalItems / USERS_PER_PAGE);
  container.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", e => {
      e.preventDefault();
      currentPage = i;
      renderTable();
    });
    container.appendChild(li);
  }
}

window.openEditModal = async (id) => {
  const user = allUsers.find(u => u.id === id);
  if (!user) return;
  document.getElementById("edit-user-id").value = user.id;
  document.getElementById("edit-user-name").value = user.full_name;
  document.getElementById("edit-user-email").value = user.email;
  document.getElementById("edit-user-roles").value = user.roles.join(", ");

  const modal = new bootstrap.Modal(document.getElementById("editUserModal"));
  modal.show();
};

window.deleteUser = async (id) => {
  if (!confirm("Are you sure you want to delete this user?")) return;
  await fetchWithAuth(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
  loadUsers();
};
