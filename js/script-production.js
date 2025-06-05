// /js/script-production.js

document.addEventListener("DOMContentLoaded", () => {
  requireAdmin();
  loadJobs();
  document.getElementById("searchInput").addEventListener("input", loadJobs);
  document.getElementById("jobForm").addEventListener("submit", handleFormSubmit);
});

async function loadJobs() {
  const query = document.getElementById("searchInput").value || '';
  try {
    const res = await fetchWithAuth(`/api/jobs?search=${encodeURIComponent(query)}&page=1&limit=10`);
    const { data, total } = await res.json();

    renderJobs(data);
    renderPagination(total, "pagination-container", loadJobs, 10, 1);
  } catch (err) {
    console.error("Error loading jobs:", err);
  }
}

function renderJobs(jobs) {
  const tbody = document.getElementById("job-table-body");
  tbody.innerHTML = "";

  jobs.forEach(job => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${job.job_name}</td>
      <td>${job.department_name || ''}</td>
      <td>${job.status || ''}</td>
      <td>${job.priority || ''}</td>
      <td>${job.delivery_date?.split('T')[0] || ''}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="viewJob(${job.id})">View</button>
        <button class="btn btn-sm btn-primary" onclick='editJob(${JSON.stringify(job)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteJob(${job.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.viewJob = async function (id) {
  try {
    const res = await fetchWithAuth(`/api/jobs/${id}`);
    const job = await res.json();
    const modalBody = document.getElementById("view-job-body");

    modalBody.innerHTML = `
      <table class="table">
        <tr><th>Job Name</th><td>${job.job_name}</td></tr>
        <tr><th>Department</th><td>${job.department_id}</td></tr>
        <tr><th>Status</th><td>${job.status}</td></tr>
        <tr><th>Priority</th><td>${job.priority}</td></tr>
        <tr><th>Delivery Date</th><td>${job.delivery_date?.split("T")[0] || ''}</td></tr>
        <tr><th>Comments</th><td>${job.comments || ''}</td></tr>
      </table>
    `;

    bootstrap.Modal.getOrCreateInstance(document.getElementById("viewJobModal")).show();
  } catch (err) {
    console.error("View error:", err);
  }
};

window.editJob = function (job) {
  document.getElementById("job_id").value = job.id;
  document.getElementById("job_name").value = job.job_name || '';
  document.getElementById("department_id").value = job.department_id || '';
  document.getElementById("status").value = job.status || '';
  document.getElementById("priority").value = job.priority || '';
  document.getElementById("delivery_date").value = job.delivery_date?.split("T")[0] || '';
  document.getElementById("comments").value = job.comments || '';

  bootstrap.Modal.getOrCreateInstance(document.getElementById("jobModal")).show();
};

async function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("job_id").value;

  const payload = {
    job_name: document.getElementById("job_name").value,
    department_id: document.getElementById("department_id").value,
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    delivery_date: document.getElementById("delivery_date").value,
    comments: document.getElementById("comments").value,
  };

  const url = id ? `/api/jobs/${id}` : `/api/jobs`;
  const method = id ? "PUT" : "POST";

  try {
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload),
    });

    bootstrap.Modal.getInstance(document.getElementById("jobModal")).hide();
    document.getElementById("jobForm").reset();
    loadJobs();
  } catch (err) {
    console.error("Save error:", err);
  }
}

window.deleteJob = async function (id) {
  if (!confirm("Delete this job?")) return;

  try {
    await fetchWithAuth(`/api/jobs/${id}`, { method: "DELETE" });
    loadJobs();
  } catch (err) {
    console.error("Delete error:", err);
  }
};

window.exportJobs = function () {
  exportTableToCSV("job-table", "jobs.csv");
};

window.printJobs = function () {
  printElementById("job-table");
};
