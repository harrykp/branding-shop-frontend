let allUsers = [];
let currentPage = 1;
const USERS_PER_PAGE = 10;

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();
  await loadUsers();

  document.getElementById("search-users")?.addEventListener("input", () => {
    currentPage = 1;
    renderUsersTable();
  });

  document.getElementById("edit-user-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-user-id").value;
    const name = document.getElementById("edit-user-name").value.trim();
    const email = document.getElementById("edit-user-email").value.trim();
    const roles = document.getElementById("edit-user-roles").value
      .split(",")
      .map(r => r.trim())
      .filter(Boolean);

    await fetchWithAuth(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ full_name: name, email, roles })
    });

    bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide();
    await loadUsers();
  });

  document.getElementById("btn-export-users")?.addEventListener("click", () => {
    const rows = allUsers.map(u => [
      u.full_name,
      u.email,
      u.phone_number || "",
      (u.roles || []).join("; ")
    ]);
    exportTableToCSV(["Name", "Email", "Phone", "Roles"], rows, "users.csv");
  });
});

async function loadUsers() {
  try {
    const res = await fetchWithAuth(`/api/users`);
    if (!res.ok) throw new Error("Server error while fetching users");
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Expected array of users");
    allUsers = data;
    renderUsersTable();
  } catch (err) {
    console.error("Failed to load users:", err);
  }
}

function renderUsersTable() {
  const tbody = document.querySelector("#user-table tbody");
  if (!tbody) return;

  const search = document.getElementById("search-users")?.value.toLowerCase() || "";
  const filtered = allUsers.filter(u =>
    (u.full_name || "").toLowerCase().includes(search) ||
    (u.email || "").toLowerCase().includes(search) ||
    (u.phone_number || "").toLowerCase().includes(search)
  );

  const pageItems = filtered.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  tbody.innerHTML = "";
  for (const user of pageItems) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.full_name}</td>
      <td>${user.email}</td>
      <td>${user.phone_number || ''}</td>
      <td>${(user.roles || []).join(", ")}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick="openEditModal(${user.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
      </td>`;
    tbody.appendChild(row);
  }

  renderPagination("pagination-users", filtered.length, USERS_PER_PAGE, currentPage, (page) => {
    currentPage = page;
    renderUsersTable();
  });
}

window.openEditModal = (id) => {
  const user = allUsers.find(u => u.id == id);
  if (!user) return;
  document.getElementById("edit-user-id").value = id;
  document.getElementById("edit-user-name").value = user.full_name;
  document.getElementById("edit-user-email").value = user.email;
  document.getElementById("edit-user-roles").value = (user.roles || []).join(", ");
  new bootstrap.Modal(document.getElementById("editUserModal")).show();
};

window.deleteUser = async (id) => {
  if (confirm("Delete this user?")) {
    await fetchWithAuth(`/api/users/${id}`, { method: "DELETE" });
    await loadUsers();
  }
};
