if (typeof window.API_BASE === "undefined") {
  window.API_BASE = "https://branding-shop-backend.onrender.com";
}
let allUsers = [];
let currentPage = 1;
const USERS_PER_PAGE = 10;

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();
  await loadUsers();

  document.getElementById("search-users")?.addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });

  document.getElementById("edit-user-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-user-id").value;
    const name = document.getElementById("edit-user-name").value.trim();
    const email = document.getElementById("edit-user-email").value.trim();
    const roles = document.getElementById("edit-user-roles").value.split(",").map(r => r.trim()).filter(Boolean);
    await fetchWithAuth(`${API_BASE}/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, roles })
    });
    bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide();
    await loadUsers();
  });
});

async function loadUsers() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/users`);
    if (!res.ok) throw new Error("Server error while fetching users");
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Expected array of users");
    allUsers = data;
    renderTable();
  } catch (err) {
    console.error("Failed to load users:", err);
  }
}

function renderTable() {
  const tbody = document.querySelector("#user-table tbody");
  if (!tbody) return;

  const search = document.getElementById("search-users")?.value.toLowerCase() || "";
  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
  );

  const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
  if (currentPage > totalPages) currentPage = 1;

  const pageItems = filtered.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  tbody.innerHTML = "";
  for (const user of pageItems) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phone_number || ''}</td>
      <td>${(user.roles || []).join(", ")}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick="openEditModal(${user.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
      </td>`;
    tbody.appendChild(row);
  }

  renderPagination(filtered.length);
}

function renderPagination(total) {
  const pagination = document.getElementById("pagination-users");
  if (!pagination) return;

  const totalPages = Math.ceil(total / USERS_PER_PAGE);
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'} mx-1`;
    btn.textContent = i;
    btn.onclick = () => { currentPage = i; renderTable(); };
    pagination.appendChild(btn);
  }
}

window.openEditModal = async (id) => {
  const user = allUsers.find(u => u.id == id);
  if (!user) return;
  document.getElementById("edit-user-id").value = id;
  document.getElementById("edit-user-name").value = user.name;
  document.getElementById("edit-user-email").value = user.email;
  document.getElementById("edit-user-roles").value = (user.roles || []).join(", ");
  new bootstrap.Modal(document.getElementById("editUserModal")).show();
};

window.deleteUser = async (id) => {
  if (confirm("Delete this user?")) {
    await fetchWithAuth(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
    await loadUsers();
  }
};

window.exportUsersToCSV = () => {
  const headers = ["Name", "Email", "Phone", "Roles"];
  const rows = allUsers.map(u => [
    `"${u.name}"`,
    `"${u.email}"`,
    `"${u.phone_number || ''}"`,
    `"${(u.roles || []).join("; ")}"`
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "users.csv";
  a.click();
};
