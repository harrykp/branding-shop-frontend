
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#role-table tbody");

  async function loadRoles() {
    const res = await fetchWithAuth("/api/roles");
    const roles = await res.json();

    tableBody.innerHTML = "";
    roles.forEach(role => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${role.name}</td>
        <td>${role.description || ''}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editRole('${role.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRole('${role.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.editRole = (id) => alert("Edit role: " + id);
  window.deleteRole = async (id) => {
    if (confirm("Delete this role?")) {
      await fetchWithAuth("/api/roles/" + id, { method: "DELETE" });
      loadRoles();
    }
  };

  loadRoles();
});
