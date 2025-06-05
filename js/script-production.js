// script-production.js

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await loadJobs();

  document.getElementById("searchInput").addEventListener("input", loadJobs);
  document.getElementById("jobForm").addEventListener("submit", handleJobSubmit);
});

async function loadJobs() {
  const search = document.getElementById("searchInput").value;
  try {
    const res = await fetchWithAuth(`/api/jobs?search=${encodeURIComponent(search)}&page=1&limit=10`);
    const { data: jobs, total } = await res.json();

    const tbody = document.getElementById("job-table-body");
    tbody.innerHTML = "";
    jobs.forEach(job => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${job.job_name || ""}</td>
        <td>${job.department_name || ""}</td>
        <td><select class="form-select form-select-sm" onchange="updateJobField(${job.id}, 'status', this.value)">
          ${["queued", "in_progress", "cancelled", "finished"].map(status => `<option value="${status}" ${job.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select></td>
        <td><select class="form-select form-select-sm" onchange="updateJobField(${job.id}, 'priority', this.value)">
          ${["Low", "Medium", "High"].map(p => `<option value="${p}" ${job.priority === p ? "selected" : ""}>${p}</option>`).join("")}
        </select></td>
        <td><input type="date" class="form-control form-control-sm" value="${job.delivery_date || ''}" onchange="updateJobField(${job.id}, 'delivery_date', this.value)" /></td>
        <td><input type="datetime-local" class="form-control form-control-sm" value="${job.started_at ? job.started_at.split('.')[0] : ''}" onchange="updateJobField(${job.id}, 'started_at', this.value)" /></td>
        <td><input type="number" class="form-control form-control-sm" value="${job.completed_qty || 0}" onchange="updateJobField(${job.id}, 'completed_qty', this.value)" /></td>
        <td><input type="number" class="form-control form-control-sm" value="${job.percent_complete || 0}" onchange="updateJobField(${job.id}, 'percent_complete', this.value)" /></td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewJob(${job.id})">View</button>
          <button class="btn btn-sm btn-primary" onclick='editJob(${JSON.stringify(job)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteJob(${job.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    renderPagination(total, 1, 10, loadJobs, "pagination-container");
  } catch (err) {
    console.error("Error loading jobs:", err);
  }
}

async function updateJobField(id, field, value) {
  try {
    await fetchWithAuth(`/api/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify({ [field]: value })
    });
    console.log(`Updated ${field} for job ${id}`);
  } catch (err) {
    console.error(`Error updating ${field} for job ${id}:", err);
  }
}

function editJob(job) {
  document.getElementById("job-id").value = job.id;
  document.getElementById("job_name").value = job.job_name;
  document.getElementById("department_id").value = job.department_id;
  document.getElementById("status").value = job.status;
  document.getElementById("priority").value = job.priority;
  document.getElementById("delivery_date").value = job.delivery_date;
  document.getElementById("comments").value = job.comments;
  document.getElementById("started_at").value = job.started_at ? job.started_at.split("T")[0] : "";
  document.getElementById("completed_qty").value = job.completed_qty || 0;
  document.getElementById("percent_complete").value = job.percent_complete || 0;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("jobModal")).show();
}

async function handleJobSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("job-id").value;
  const payload = {
    job_name: document.getElementById("job_name").value,
    department_id: document.getElementById("department_id").value,
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    delivery_date: document.getElementById("delivery_date").value,
    comments: document.getElementById("comments").value,
    started_at: document.getElementById("started_at").value,
    completed_qty: parseInt(document.getElementById("completed_qty").value),
    percent_complete: parseInt(document.getElementById("percent_complete").value)
  };
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/jobs/${id}` : `/api/jobs`;

  try {
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    bootstrap.Modal.getInstance(document.getElementById("jobModal")).hide();
    document.getElementById("jobForm").reset();
    loadJobs();
  } catch (err) {
    console.error("Error saving job:", err);
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

async function viewJob(id) {
  try {
    const res = await fetchWithAuth(`/api/jobs/${id}`);
    const job = await res.json();
    const wrapper = document.getElementById("view-job-body");
    wrapper.innerHTML = `
      <table class="table">
        <tr><th>Job Name</th><td>${job.job_name}</td></tr>
        <tr><th>Department</th><td>${job.department_name || job.department_id}</td></tr>
        <tr><th>Status</th><td>${job.status}</td></tr>
        <tr><th>Priority</th><td>${job.priority}</td></tr>
        <tr><th>Delivery Date</th><td>${job.delivery_date}</td></tr>
        <tr><th>Started At</th><td>${job.started_at || ''}</td></tr>
        <tr><th>Completed Qty</th><td>${job.completed_qty}</td></tr>
        <tr><th>% Complete</th><td>${job.percent_complete}%</td></tr>
        <tr><th>Comments</th><td>${job.comments || ''}</td></tr>
      </table>`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("viewModal")).show();
  } catch (err) {
    console.error("Error viewing job:", err);
  }
}
