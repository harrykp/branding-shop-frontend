// script-production.js

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await populateSelect("departments", "department_id");
  await populateSelect("products", "product_id");
  await populateSelect("users", "assigned_to");
  await populateSelect("orders", "order_id");
  await populateSelect("deals", "deal_id");
  await populateSelect("customers", "customer_id");
  await populateSelect("users", "sales_rep_id");
  await populateSelect("product-categories", "type");
  populateStaticSelect("stage", ["Digitizing", "Printing", "Packing", "Cutting", "Embroidering", "Pressing", "Quality Control", "Folding", "Counting", "Purchasing", "End Stage"]);
  loadJobs();

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
        <td>${job.customer_name || job.customer_id || ""}</td>
        <td>${job.sales_rep_name || job.sales_rep_id || ""}</td>
        <td>${job.department_name || ""}</td>
        <td>${job.assigned_to_name || job.assigned_to || ""}</td>
        <td>${job.stage || ""}</td>
        <td>${job.type || ""}</td>
        <td>${job.product_name || ""}</td>
        <td>${job.qty || 0}</td>
        <td>${job.qty_remaining || 0}</td>
        <td>${job.price || 0}</td>
        <td>${job.ordered_value || 0}</td>
        <td>${job.status || ""}</td>
        <td>${job.priority || ""}</td>
        <td>${job.delivery_date || ""}</td>
        <td>${job.started_at ? job.started_at.split(".")[0] : ""}</td>
        <td>${job.completed_qty || 0}</td>
        <td>${job.percent_complete || 0}%</td>
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

function populateStaticSelect(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = "<option value=''>Select</option>" + options.map(opt => `<option value='${opt}'>${opt}</option>`).join("");
}

function editJob(job) {
  document.getElementById("job-id").value = job.id;
  [
    "job_name", "department_id", "product_id", "assigned_to", "order_id", "deal_id",
    "customer_id", "sales_rep_id", "type", "stage", "qty", "qty_remaining",
    "price", "ordered_value", "status", "priority", "delivery_date", "payment_status",
    "payment_due_date", "started_at", "completed_qty", "percent_complete", "comments"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = job[id] || "";
  });
  bootstrap.Modal.getOrCreateInstance(document.getElementById("jobModal")).show();
}

async function handleJobSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("job-id").value;
  const payload = {};

  [
    "job_name", "department_id", "product_id", "assigned_to", "order_id", "deal_id",
    "customer_id", "sales_rep_id", "type", "stage", "qty", "qty_remaining",
    "price", "ordered_value", "status", "priority", "delivery_date", "payment_status",
    "payment_due_date", "started_at", "completed_qty", "percent_complete", "comments"
  ].forEach(id => {
    const el = document.getElementById(id);
    payload[id] = el ? el.value : null;
  });

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
