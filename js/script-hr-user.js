
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const tableBody = document.querySelector("#hr-table tbody");

  async function loadHR() {
    const res = await fetchWithAuth("/api/hr/me");
    const data = await res.json();

    tableBody.innerHTML = "";
    for (let [key, value] of Object.entries(data)) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${key.replace(/_/g, ' ')}</td><td>${value}</td>`;
      tableBody.appendChild(tr);
    }
  }

  loadHR();
});
