
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#lead-table tbody");

  async function loadLeads() {
    const res = await fetchWithAuth("/api/leads");
    const leads = await res.json();

    tableBody.innerHTML = "";
    leads.forEach(l => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${l.name}</td>
        <td>${l.contact}</td>
        <td>${l.status}</td>
        <td>${l.owner_name || ''}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editLead('${l.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteLead('${l.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.editLead = (id) => alert("Edit lead: " + id);
  window.deleteLead = async (id) => {
    if (confirm("Delete this lead?")) {
      await fetchWithAuth("/api/leads/" + id, { method: "DELETE" });
      loadLeads();
    }
  };

  loadLeads();
});
