
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#hr-table tbody");

  async function loadEmployees() {
    const res = await fetchWithAuth("/api/hr");
    const employees = await res.json();

    tableBody.innerHTML = "";
    employees.forEach(emp => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${emp.full_name}</td>
        <td>${emp.department || ''}</td>
        <td>${emp.position || ''}</td>
        <td>${emp.salary || ''}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editEmp('${emp.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteEmp('${emp.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.editEmp = (id) => alert("Edit employee: " + id);
  window.deleteEmp = async (id) => {
    if (confirm("Delete employee?")) {
      await fetchWithAuth("/api/hr/" + id, { method: "DELETE" });
      loadEmployees();
    }
  };

  loadEmployees();
});
