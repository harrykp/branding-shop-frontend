// /js/script-production.js

document.addEventListener("DOMContentLoaded", () => {
  requireAdmin();
  fetchJobs();
  populateSelect("departments", "department_id");
  populateSelect("products", "product_id");
  populateSelect("users", "assigned_to");

  document.getElementById("searchInput").addEventListener("input", fetchJobs);
  document.getElementById("jobForm").addEventListener("submit", handleJobSubmit);
});

async function fetchJobs() {
  const search = document.getElementById("searchInput").value;
  try {
    const res = await fetchWithAuth(`/api/jobs?search=${encodeURIComponent(search)}&page=1&limit=10`);
    const { data, total } = await res.json();
    renderJobs(data);
    renderPagination(total, "pagination-container", fetchJobs);
  } catch (err) {
    console.error("Failed to fetch jobs:", err);
  }
}

function renderJobs(jobs) {
  const tbody = document.getElementById("job-table-body");
  tbody.innerHTML = "";
  jobs.forEach(job => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${job.job_name}</td>
      <td>${job.product_name || ""}</td>
      <td>${job.qty_remaining}</td>
      <td>${job.department_name || ""}</td>
      <td>${job.assigned_to_name || ""}</td>
      <td>${job.status || ""}</td>
      <td>${job.stage || ""}</td>
      <td>${job.priority || ""}</td>
      <td>${job.percent_complete}%</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="viewJob(${job.id})">View</button>
        <button class="btn btn-sm btn-primary" onclick='editJob(${JSON.stringify(job)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteJob(${job.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function viewJob(id) {
  try {
    const res = await fetchWithAuth(`/api/jobs/${id}`);
    const job = await res.json();
    const wrapper = document.getElementById("view-job-body");
    wrapper.innerHTML = `
      <table class="table">
        <tr><th>Job Name</th><td>${job.job_name}</td></tr>
        <tr><th>Product</th><td>${job.product_id}</td></tr>
        <tr><th>Department</th><td>${job.department_id}</td></tr>
        <tr><th>Assigned To</th><td>${job.assigned_to}</td></tr>
        <tr><th>Qty Remaining</th><td>${job.qty_remaining}</td></tr>
        <tr><th>Status</th><td>${job.status}</td></tr>
        <tr><th>Stage</th><td>${job.stage}</td></tr>
        <tr><th>Priority</th><td>${job.priority}</td></tr>
        <tr><th>% Complete</th><td>${job.percent_complete}</td></tr>
        <tr><th>Due Date</th><td>${job.delivery_date}</td></tr>
        <tr><th>Notes</th><td>${job.comments}</td></tr>
      </table>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("viewModal")).show();
  } catch (err) {
    console.error("View error:", err);
  }
}

function editJob(job) {
  document.getElementById("job-id").value = job.id;
  document.getElementById("job_name").value = job.job_name;
  document.getElementById("product_id").value = job.product_id;
  document.getElementById("department_id").value = job.department_id;
  document.getElementById("assigned_to").value = job.assigned_to;
  document.getElementById("qty_remaining").value = job.qty_remaining;
  document.getElementById("status").value = job.status;
  document.getElementById("stage").value = job.stage;
  document.getElementById("priority").value = job.priority;
  document.getElementById("percent_complete").value = job.percent_complete;
  document.getElementById("delivery_date").value = job.delivery_date;
  document.getElementById("comments").value = job.comments;

  bootstrap.Modal.getOrCreateInstance(document.getElementById("jobModal")).show();
}

async function handleJobSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("job-id").value;
  const payload = {
    job_name: document.getElementById("job_name").value,
    product_id: document.getElementById("product_id").value,
    department_id: document.getElementById("department_id").value,
    assigned_to: document.getElementById("assigned_to").value,
    qty_remaining: document.getElementById("qty_remaining").value,
    status: document.getElementById("status").value,
    stage: document.getElementById("stage").value,
    priority: document.getElementById("priority").value,
    percent_complete: document.getElementById("percent_complete").value,
    delivery_date: document.getElementById("delivery_date").value,
    comments: document.getElementById("comments").value
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/jobs/${id}` : `/api/jobs`;
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    bootstrap.Modal.getInstance(document.getElementById("jobModal")).hide();
    document.getElementById("jobForm").reset();
    fetchJobs();
  } catch (err) {
    console.error("Save error:", err);
  }
}

async function deleteJob(id) {
  if (!confirm("Are you sure you want to delete this job?")) return;
  try {
    await fetchWithAuth(`/api/jobs/${id}`, { method: "DELETE" });
    fetchJobs();
  } catch (err) {
    console.error("Delete error:", err);
  }
}
