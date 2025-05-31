
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const tableBody = document.querySelector("#jobs-table tbody");

  async function loadJobs() {
    const res = await fetchWithAuth("/api/jobs");
    const jobs = await res.json();

    tableBody.innerHTML = "";
    jobs.forEach(job => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${job.id}</td>
        <td>${job.job_type}</td>
        <td>${job.quantity}</td>
        <td>${job.status}</td>
        <td>${job.created_at?.split('T')[0]}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadJobs();
});
