document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  includeHTML().then(() => injectNavLinks());

  const searchInput = document.getElementById("search-users");
  const tableBody = document.querySelector("#user-table tbody");
  const pagination = document.getElementById("pagination-users");
  const exportBtn = document.getElementById("export-users-csv");
  const newUserBtn = document.getElementById("add-user-btn");

  let currentPage = 1;
  const pageSize = 10;
  let allUsers = [];

  async function loadUsers() {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/users`);
      const data = await res.json();
      allUsers = data.users || data;
      renderTable();
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }

  function renderTable() {
    const filtered = allUsers.filter(u =>
      u.full_name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
      u.email.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    tableBody.innerHTML = "";
    paginated.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.full_name}</td>
        <td>${user.email}</td>
        <td>${(user.roles || []).join(', ')}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="openEditModal('${user.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Pagination controls
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = `btn btn-sm btn-outline-primary mx-1 ${i === currentPage ? "active" : ""}`;
      btn.textContent = i;
      btn.onclick = () => {
        currentPage = i;
        renderTable();
      };
      pagination.appendChild(btn);
    }
  }

  exportBtn.addEventListener("click", () => {
    let csv = "Name,Email,Roles\n";
    allUsers.forEach(u => {
      csv += `"${u.full_name}","${u.email}","${(u.roles || []).join(', ')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "users.csv";
    link.click();
  });

  window.deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    await fetchWithAuth(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
    loadUsers();
  };

  window.openEditModal = (id) => {
    const user = allUsers.find(u => u.id === id);
    if (!user) return alert("User not found");
    document.getElementById("edit-user-id").value = user.id;
    document.getElementById("edit-full-name").value = user.full_name;
    document.getElementById("edit-email").value = user.email;
    const modal = new bootstrap.Modal(document.getElementById("editUserModal"));
    modal.show();
  };

  document.getElementById("edit-user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-user-id").value;
    const full_name = document.getElementById("edit-full-name").value;
    const email = document.getElementById("edit-email").value;
    await fetchWithAuth(`${API_BASE}/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email })
    });
    bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide();
    loadUsers();
  });

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });

  newUserBtn.addEventListener("click", () => {
    alert("New user modal not implemented yet");
  });

  loadUsers();
});
