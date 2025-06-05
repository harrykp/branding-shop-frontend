document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  populateSelect("departments", "department_id");
  document.getElementById("searchInput").addEventListener("input", loadJobs);
  document.getElementById("jobForm").addEventListener("submit", submitJobForm);
  loadJobs();
});

async function loadJobs() {
  const search = document.getElementById("searchInput").value;
  try {
    const res = await fetchWithAuth(`/api/jobs?search=${encodeURIComponent(search)}&page=1&limit=10`);
    const result = await res.json();
    const jobs = result.data || [];
    const total = result.total || 0;

    renderJobs(jobs);
    renderPagination(total, 1, 10, loadJobs, "pagination-container");
  } catch (err) {
    console.error("Failed to load jobs:", err);
  }
}

function renderJobs(jobs) {
  const tbody = document.getElementById("job-table-body");
  tbody.innerHTML = "";

  jobs.forEach(job => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${job.job_name}</td>
      <td>${job.department_name || ""}</td>
      <td>${job.status}</td>
      <td>${job.priority || ""}</td>
      <td>${job.delivery_date || ""}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick='viewJob(${JSON.stringify(job)})'>View</button>
        <button class="btn btn-sm btn-primary" onclick='editJob(${JSON.stringify(job)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick='deleteJob(${job.id})'>Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editJob(job) {
  document.getElementById("job-id").value = job.id;
  document.getElementById("job_name").value = job.job_name || "";
  document.getElementById("department_id").value = job.department_id || "";
  document.getElementById("status").value = job.status || "";
  document.getElementById("priority").value = job.priority || "";
  document.getElementById("delivery_date").value = job.delivery_date?.split("T")[0] || "";
  document.getElementById("comments").value = job.comments || "";

  bootstrap.Modal.getOrCreateInstance(document.getElementById("jobModal")).show();
}

function viewJob(job) {
  const wrapper = document.getElementById("view-job-body");
  wrapper.innerHTML = `
    <table class="table">
      <tr><th>Job Name</th><td>${job.job_name}</td></tr>
      <tr><th>Department</th><td>${job.department_name || ""}</td></tr>
      <tr><th>Status</th><td>${job.status}</td></tr>
      <tr><th>Priority</th><td>${job.priority || ""}</td></tr>
      <tr><th>Delivery Date</th><td>${job.delivery_date || ""}</td></tr>
      <tr><th>Comments</th><td>${job.comments || ""}</td></tr>
    </table>
  `;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("viewModal")).show();
}

async function submitJobForm(e) {
  e.preventDefault();
  const id = document.getElementById("job-id").value;

  const payload = {
    job_name: document.getElementById("job_name").value,
    department_id: document.getElementById("department_id").value,
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    delivery_date: document.getElementById("delivery_date").value || null,
    comments: document.getElementById("comments").value
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `/api/jobs/${id}` : `/api/jobs`;

  try {
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    bootstrap.Modal.getOrCreateInstance(document.getElementById("jobModal")).hide();
    loadJobs();
    document.getElementById("jobForm").reset();
  } catch (err) {
    console.error("Failed to save job:", err);
  }
}

async function deleteJob(id) {
  if (!confirm("Are you sure you want to delete this job?")) return;
  try {
    await fetchWithAuth(`/api/jobs/${id}`, { method: "DELETE" });
    loadJobs();
  } catch (err) {
    console.error("Error deleting job:", err);
  }
}
