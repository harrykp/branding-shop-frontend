if (typeof window.API_BASE === "undefined") {
  window.API_BASE = "https://branding-shop-backend.onrender.com";
}
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  includeHTML();

  const tableBody = document.querySelector("#user-table tbody");
  const searchInput = document.getElementById("search-users");
  const pagination = document.getElementById("pagination-users");
  let allUsers = [];
  let currentPage = 1;
  const USERS_PER_PAGE = 10;

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
    if (!tableBody) return;
    const keyword = searchInput.value.toLowerCase();
    const filtered = allUsers.filter(u =>
      u.full_name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword)
    );
    const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
    if (currentPage > totalPages) currentPage = 1;

    const paginated = filtered.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);
    tableBody.innerHTML = "";
    paginated.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.full_name}</td>
        <td>${user.email}</td>
        <td>${(user.roles || []).join(", ")}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="openEditModal('${user.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = `btn btn-sm me-1 ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}`;
      btn.innerText = i;
      btn.onclick = () => {
        currentPage = i;
        renderTable();
      };
      pagination.appendChild(btn);
    }
  }

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });

  window.openEditModal = async (id) => {
    const user = allUsers.find(u => u.id == id);
    if (!user) return alert("User not found");
    document.getElementById("edit-user-id").value = user.id;
    document.getElementById("edit-user-name").value = user.full_name;
    document.getElementById("edit-user-email").value = user.email;
    document.getElementById("edit-user-roles").value = (user.roles || []).join(", ");
    const modal = new bootstrap.Modal(document.getElementById("editUserModal"));
    modal.show();
  };

  document.getElementById("edit-user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-user-id").value;
    const full_name = document.getElementById("edit-user-name").value.trim();
    const email = document.getElementById("edit-user-email").value.trim();
    const roles = document.getElementById("edit-user-roles").value.split(",").map(r => r.trim()).filter(Boolean);
    await fetchWithAuth(`${API_BASE}/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email, roles })
    });
    bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide();
    loadUsers();
  });

  window.deleteUser = async (id) => {
    if (confirm("Delete this user?")) {
      await fetchWithAuth(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
      loadUsers();
    }
  };

  document.getElementById("new-user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const full_name = document.getElementById("new-user-name").value.trim();
    const email = document.getElementById("new-user-email").value.trim();
    const password = document.getElementById("new-user-password").value;
    const roles = document.getElementById("new-user-roles").value.split(",").map(r => r.trim()).filter(Boolean);
    await fetchWithAuth(`${API_BASE}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email, password, roles })
    });
    bootstrap.Modal.getInstance(document.getElementById("newUserModal")).hide();
    loadUsers();
  });

  loadUsers();
});
