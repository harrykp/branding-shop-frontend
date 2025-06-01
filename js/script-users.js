// js/script-users.js
const API_BASE = "https://branding-shop-backend.onrender.com";
let currentPage = 1;
const limit = 10;

document.addEventListener("DOMContentLoaded", () => {
  requireAdmin();
  includeHTML();
  loadUsers();
});

async function loadUsers() {
  const tableBody = document.querySelector("#user-table tbody");
  const search = document.getElementById("searchInput").value.trim().toLowerCase();

  try {
    const res = await fetchWithAuth(`${API_BASE}/api/users`);
    const users = await res.json();

    if (!Array.isArray(users)) throw new Error("Unexpected response");

    const filtered = users.filter(u =>
      u.full_name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );

    const start = (currentPage - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    tableBody.innerHTML = "";
    paginated.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.full_name}</td>
        <td>${user.email}</td>
        <td>${(user.roles || []).join(', ')}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editUser('${user.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
        </td>`;
      tableBody.appendChild(tr);
    });

    renderPagination(filtered.length);
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

function renderPagination(total) {
  const pages = Math.ceil(total / limit);
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm ${i === currentPage ? 'btn-dark' : 'btn-outline-secondary'} mx-1`;
    btn.innerText = i;
    btn.onclick = () => {
      currentPage = i;
      loadUsers();
    };
    container.appendChild(btn);
  }
}

function exportUsersCSV() {
  // Optional: Add later
  alert("Export to CSV not implemented yet.");
}

window.editUser = (id) => {
  alert("Edit user: " + id); // Replace with modal
};

window.deleteUser = async (id) => {
  if (confirm("Are you sure?")) {
    await fetchWithAuth(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
    loadUsers();
  }
};
