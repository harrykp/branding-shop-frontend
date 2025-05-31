
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#user-table tbody");

  async function loadUsers() {
    const res = await fetchWithAuth("/api/users");
    const users = await res.json();

    tableBody.innerHTML = "";
    users.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.full_name}</td>
        <td>${user.email}</td>
        <td>${user.roles.join(", ")}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editUser('${user.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.editUser = async (id) => {
    alert("Edit user: " + id); // Replace with modal logic
  };

  window.deleteUser = async (id) => {
    if (confirm("Delete this user?")) {
      await fetchWithAuth("/api/users/" + id, { method: "DELETE" });
      loadUsers();
    }
  };

  loadUsers();
});
