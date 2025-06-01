let allUsers = [];
let currentPage = 1;
const USERS_PER_PAGE = 10;

document.addEventListener("DOMContentLoaded", async () => {
  await includeHTML();
  requireAdmin();
  await loadUsers();

  document.getElementById("search-users").addEventListener("input", () => renderTable());
  document.getElementById("export-users-csv").addEventListener("click", exportCSV);
});

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
  const tbody = document.getElementById("user-table");
  const searchTerm = document.getElementById("search-users").value.toLowerCase();
  const filtered = allUsers.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm)
  );

  const start = (currentPage - 1) * USERS_PER_PAGE;
  const paginated = filtered.slice(start, start + USERS_PER_PAGE);

  tbody.innerHTML = "";
  for (const user of paginated) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.full_name}</td>
      <td>${user.email}</td>
      <td>${(user.roles || []).join(", ")}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick="openEditModal('${user.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  renderPagination(filtered.length);
}

function renderPagination(totalItems) {
  const pagination = document.getElementById("pagination-users");
  const totalPages = Math.ceil(totalItems / USERS_PER_PAGE);
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm mx-1 ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`;
    btn.innerText = i;
    btn.onclick = () => {
      currentPage = i;
      renderTable();
    };
    pagination.appendChild(btn);
  }
}

window.openEditModal = (id) => {
  const user = allUsers.find(u => u.id == id);
  if (!user) return alert("User not found");
  document.getElementById("edit-user-id").value = user.id;
  document.getElementById("edit-user-name").value = user.full_name;
  document.getElementById("edit-user-email").value = user.email;
  new bootstrap.Modal(document.getElementById("editUserModal")).show();
};

window.deleteUser = async (id) => {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    await fetchWithAuth(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
    await loadUsers();
  } catch (err) {
    console.error("Delete failed:", err);
  }
};

document.getElementById("edit-user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("edit-user-id").value;
  const full_name = document.getElementById("edit-user-name").value;
  const email = document.getElementById("edit-user-email").value;

  try {
    await fetchWithAuth(`${API_BASE}/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email })
    });
    bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide();
    await loadUsers();
  } catch (err) {
    console.error("Update failed:", err);
  }
});

function exportCSV() {
  const csv = ["Full Name,Email,Roles"];
  allUsers.forEach(user => {
    csv.push(`"${user.full_name}","${user.email}","${(user.roles || []).join(" | ")}"`);
  });
  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "users.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
