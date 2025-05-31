
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const tableBody = document.querySelector("#leads-table tbody");

  async function loadLeads() {
    const res = await fetchWithAuth("/api/leads");
    const leads = await res.json();

    tableBody.innerHTML = "";
    leads.forEach(l => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${l.name}</td>
        <td>${l.phone}</td>
        <td>${l.email}</td>
        <td>${l.status}</td>
        <td>
          <button class="btn btn-sm btn-info">Edit</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadLeads();
});
