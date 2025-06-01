
if (typeof API_BASE === 'undefined') {
  var API_BASE = "https://branding-shop-backend.onrender.com";
}

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();

  const USERS_PER_PAGE = 10;
  let allUsers = [];
  let currentPage = 1;

  const tableBody = document.querySelector("#user-table tbody");
  const paginationEl = document.getElementById("pagination-users");
  const searchInput = document.getElementById("search-users");

  async function loadUsers() {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/users`);
      if (!res.ok) throw new Error("Server error while fetching users");
      const users = await res.json();
      if (!Array.isArray(users)) throw new Error("Expected array of users");
      allUsers = users;
      renderTable();
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }

  function renderTable() {
    const search = searchInput.value.toLowerCase();
    const filtered = allUsers.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );

    const start = (currentPage - 1) * USERS_PER_PAGE;
    const paginated = filtered.slice(start, start + USERS_PER_PAGE);

    tableBody.innerHTML = "";
    paginated.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${(user.roles || []).join(", ")}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="openEditModal('${user.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    renderPagination(filtered.length);
  }

  function renderPagination(total) {
    const pages = Math.ceil(total / USERS_PER_PAGE);
    paginationEl.innerHTML = "";
    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement("button");
      btn.className = "btn btn-sm mx-1 " + (i === currentPage ? "btn-primary" : "btn-outline-secondary");
      btn.textContent = i;
      btn.onclick = () => {
        currentPage = i;
        renderTable();
      };
      paginationEl.appendChild(btn);
    }
  }

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });

  window.openEditModal = (id) => {
    const user = allUsers.find(u => u.id == id);
    if (!user) return alert("User not found");

    document.getElementById("edit-user-id").value = user.id;
    document.getElementById("edit-user-name").value = user.name;
    document.getElementById("edit-user-email").value = user.email;
    document.getElementById("edit-user-roles").value = (user.roles || []).join(", ");
    new bootstrap.Modal(document.getElementById("editUserModal")).show();
  };

  window.deleteUser = async (id) => {
    if (confirm("Delete this user?")) {
      await fetchWithAuth(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
      loadUsers();
    }
  };

  const editForm = document.getElementById("edit-user-form");
  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-user-id").value;
      const name = document.getElementById("edit-user-name").value;
      const email = document.getElementById("edit-user-email").value;
      const roles = document.getElementById("edit-user-roles").value.split(",").map(r => r.trim()).filter(Boolean);

      await fetchWithAuth(`${API_BASE}/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, roles })
      });
      bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide();
      loadUsers();
    });
  }

  const exportBtn = document.getElementById("export-users-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const rows = [
        ["Name", "Email", "Roles"],
        ...allUsers.map(u => [u.name, u.email, (u.roles || []).join(", ")])
      ];
      const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "users.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  loadUsers();
});
