
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#job-table tbody");

  async function loadJobs() {
    const res = await fetchWithAuth("/api/jobs");
    const jobs = await res.json();

    tableBody.innerHTML = "";
    jobs.forEach(job => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${job.order_id}</td>
        <td>${job.job_type}</td>
        <td>${job.quantity}</td>
        <td>
          <select class="form-select form-select-sm" onchange="updateJobStatus('${job.id}', this.value)">
            <option ${job.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${job.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option ${job.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>${job.created_at?.split('T')[0]}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editJob('${job.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteJob('${job.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.editJob = (id) => alert("Edit job: " + id);
  window.deleteJob = async (id) => {
    if (confirm("Delete this job?")) {
      await fetchWithAuth("/api/jobs/" + id, { method: "DELETE" });
      loadJobs();
    }
  };
  window.updateJobStatus = async (id, status) => {
    await fetchWithAuth("/api/jobs/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  };

  loadJobs();
});
