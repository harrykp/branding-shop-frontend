// /js/script-production.js

document.addEventListener("DOMContentLoaded", () => {
  requireAdmin();
  loadJobs();

  document.getElementById("searchInput").addEventListener("input", () => loadJobs(1));
  document.getElementById("jobForm").addEventListener("submit", handleJobSubmit);
});

let currentPage = 1;
const perPage = 10;

async function loadJobs(page = 1) {
  currentPage = page;
  const search = document.getElementById("searchInput").value || "";

  try {
    const res = await fetchWithAuth(`/api/jobs?search=${encodeURIComponent(search)}&page=${page}&limit=${perPage}`);
    const { data, total } = await res.json();

    renderJobs(data);
    renderPagination(total, "pagination-container", loadJobs, perPage, currentPage);
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
      <td>${job.status || ""}</td>
      <td>${job.priority || ""}</td>
      <td>${job.delivery_date ? job.delivery_date.split("T")[0] : ""}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="viewJob(${job.id})">View</button>
        <button class="btn btn-sm btn-primary" onclick="editJob(${job.id})">Edit</button>
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
      <table class="table table-bordered">
        <tr><th>Name</th><td>${job.job_name}</td></tr>
        <tr><th>Department</th><td>${job.department_id}</td></tr>
        <tr><th>Status</th><td>${job.status}</td></tr>
        <tr><th>Priority</th><td>${job.priority}</td></tr>
        <tr><th>Qty</th><td>${job.qty}</td></tr>
        <tr><th>Price</th><td>${job.price}</td></tr>
        <tr><th>Ordered Value</th><td>${job.ordered_value}</td></tr>
        <tr><th>Delivery Date</th><td>${job.delivery_date?.split("T")[0] || ""}</td></tr>
        <tr><th>Notes</th><td>${job.comments || ""}</td></tr>
      </table>
    `;

    bootstrap.Modal.getOrCreateInstance(document.getElementById("viewJobModal")).show();
  } catch (err) {
    console.error("View error:", err);
  }
};

window.editJob = async function (id) {
  try {
    const res = await fetchWithAuth(`/api/jobs/${id}`);
    const job = await res.json();

    document.getElementById("job-id").value = job.id;
    document.getElementById("job_name").value = job.job_name || "";
    document.getElementById("department_id").value = job.department_id || "";
    document.getElementById("status").value = job.status || "";
    document.getElementById("priority").value = job.priority || "";
    document.getElementById("qty").value = job.qty || "";
    document.getElementById("price").value = job.price || "";
    document.getElementById("ordered_value").value = job.ordered_value || "";
    document.getElementById("delivery_date").value = job.delivery_date?.split("T")[0] || "";
    document.getElementById("comments").value = job.comments || "";

    bootstrap.Modal.getOrCreateInstance(document.getElementById("editJobModal")).show();
  } catch (err) {
    console.error("Edit error:", err);
  }
};

async function handleJobSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("job-id").value;
  const payload = {
    job_name: document.getElementById("job_name").value,
    department_id: document.getElementById("department_id").value,
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    qty: parseFloat(document.getElementById("qty").value),
    price: parseFloat(document.getElementById("price").value),
    ordered_value: parseFloat(document.getElementById("ordered_value").value),
    delivery_date: document.getElementById("delivery_date").value,
    comments: document.getElementById("comments").value,
  };

  try {
    const url = id ? `/api/jobs/${id}` : `/api/jobs`;
    const method = id ? "PUT" : "POST";
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });

    bootstrap.Modal.getInstance(document.getElementById("editJobModal")).hide();
    document.getElementById("jobForm").reset();
    loadJobs();
  } catch (err) {
    console.error("Save error:", err);
  }
}

window.deleteJob = async function (id) {
  if (!confirm("Are you sure you want to delete this job?")) return;

  try {
    await fetchWithAuth(`/api/jobs/${id}`, { method: "DELETE" });
    loadJobs();
  } catch (err) {
    console.error("Delete error:", err);
  }
};
