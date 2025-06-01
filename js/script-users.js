if (typeof API_BASE === "undefined") {
  var API_BASE = "https://branding-shop-backend.onrender.com";
}

document.addEventListener("DOMContentLoaded", async () => {
  await requireAdmin();

  const searchInput = document.getElementById("search-users");
  const tableBody = document.querySelector("#user-table tbody");
  const pagination = document.getElementById("pagination-users");
  const editModal = new bootstrap.Modal(document.getElementById("editUserModal"));
  const editForm = document.getElementById("edit-user-form");

  let allUsers = [];
  let currentPage = 1;
  const USERS_PER_PAGE = 10;

  // Load users with error handling
  async function loadUsers() {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/users`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch users");
      }

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Expected array of users");

      allUsers = data;
      renderTable();
    } catch (err) {
      console.error("Failed to load users:", err);
      tableBody.innerHTML = `<tr><td colspan="4" class="text-danger">Error loading users: ${err.message}</td></tr>`;
    }
  }

  function renderTable() {
    if (!tableBody) return;
    const keyword = searchInput.value.trim().toLowerCase();
    let filtered = allUsers.filter(user =>
      user.full_name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword)
    );

    const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
    if (currentPage > totalPages) currentPage = 1;

    const start = (currentPage - 1) * USERS_PER_PAGE;
    const paginated = filtered.slice(start, start + USERS_PER_PAGE);

    tableBody.innerHTML = "";

    paginated.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${sanitize(user.full_name)}</td>
        <td>${sanitize(user.email)}</td>
        <td>${(user.roles || []).join(", ")}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${user.id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    renderPagination(filtered.length);
  }

  function renderPagination(totalItems) {
    if (!pagination) return;
    const totalPages = Math.ceil(totalItems / USERS_PER_PAGE);
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = `btn btn-sm ${i === currentPage ? "btn-primary" : "btn-outline-primary"} me-1`;
      btn.textContent = i;
      btn.onclick = () => {
        currentPage = i;
        renderTable();
      };
      pagination.appendChild(btn);
    }
  }

  function sanitize(str) {
    return str?.replace(/[<>"'&]/g, c => {
      return ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' })[c];
    }) || '';
  }

  // CSV Export
  document.getElementById("export-users-csv").addEventListener("click", () => {
    const rows = [["Name", "Email", "Roles"]];
    allUsers.forEach(user => {
      rows.push([user.full_name, user.email, (user.roles || []).join(", ")]);
    });
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  // Search
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });

  // Edit modal open
  document.querySelector("#user-table").addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const id = e.target.dataset.id;
      const user = allUsers.find(u => u.id == id);
      if (user) {
        document.getElementById("edit-user-id").value = user.id;
        document.getElementById("edit-user-name").value = user.full_name;
        document.getElementById("edit-user-email").value = user.email;
        document.getElementById("edit-user-roles").value = (user.roles || []).join(", ");
        editModal.show();
      }
    }

    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.dataset.id;
      if (confirm("Delete this user?")) {
        fetchWithAuth(`${API_BASE}/api/users/${id}`, { method: "DELETE" })
          .then(() => loadUsers())
          .catch(err => alert("Delete failed: " + err.message));
      }
    }
  });

  // Submit edit
  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-user-id").value;
      const name = document.getElementById("edit-user-name").value.trim();
      const email = document.getElementById("edit-user-email").value.trim();
      const roles = document.getElementById("edit-user-roles").value
        .split(",")
        .map(r => r.trim())
        .filter(Boolean);

      try {
        const res = await fetchWithAuth(`${API_BASE}/api/users/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name: name, email, roles })
        });
        if (!res.ok) throw new Error("Update failed");
        editModal.hide();
        loadUsers();
      } catch (err) {
        alert("Failed to update user: " + err.message);
      }
    });
  }

  loadUsers();
});
