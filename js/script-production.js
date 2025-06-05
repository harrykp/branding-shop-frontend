// /js/script-production.js

document.addEventListener("DOMContentLoaded", () => {
  requireAdmin();
  loadJobs();

  document.getElementById("searchInput").addEventListener("input", loadJobs);
  document.getElementById("jobForm").addEventListener("submit", handleJobSubmit);
});

async function loadJobs(page = 1) {
  try {
    const search = document.getElementById("searchInput").value || "";
    const res = await fetchWithAuth(`/api/jobs?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
    const { data: jobs, total } = await res.json(); // ✅ Fixed destructuring

    renderJobs(jobs);
    renderPagination(total, "pagination-container", loadJobs, 10, page);
  } catch (err) {
    console.error("Failed to load jobs:", err);
  }
}

function renderJobs(jobs) {
  const tbody = document.getElementById("job-table-body");
  tbody.innerHTML = "";

  jobs.forEach((job) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${job.job_name}</td>
      <td>${job.status}</td>
      <td>${job.stage || ""}</td>
      <td>${job.qty || 0}</td>
      <td>${job.completed_qty || 0}</td>
      <td>${job.percent_complete || 0}%</td>
      <td>${job.priority || ""}</td>
      <td>${job.delivery_date?.split("T")[0] || ""}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="viewJob(${job.id})">View</button>
        <button class="btn btn-sm btn-warning" onclick='editJob(${JSON.stringify(job)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteJob(${job.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.viewJob = async function(id) {
  try {
    const res = await fetchWithAuth(`/api/jobs/${id}`);
    const job = await res.json();

    const modalBody = document.getElementById("view-job-body");
    modalBody.innerHTML = `
      <table class="table">
        <tr><th>Job Name</th><td>${job.job_name}</td></tr>
        <tr><th>Status</th><td>${job.status}</td></tr>
        <tr><th>Stage</th><td>${job.stage || ""}</td></tr>
        <tr><th>Qty</th><td>${job.qty}</td></tr>
        <tr><th>Qty Remaining</th><td>${job.qty_remaining}</td></tr>
        <tr><th>Completed Qty</th><td>${job.completed_qty}</td></tr>
        <tr><th>Percent Complete</th><td>${job.percent_complete || 0}%</td></tr>
        <tr><th>Price</th><td>${job.price}</td></tr>
        <tr><th>Ordered Value</th><td>${job.ordered_value}</td></tr>
        <tr><th>Completed Value</th><td>${job.completed_value}</td></tr>
        <tr><th>Completed Value w/Tax</th><td>${job.completed_value_with_tax}</td></tr>
        <tr><th>Completed Tax Amount</th><td>${job.completed_tax_amount}</td></tr>
        <tr><th>Balance Unpaid</th><td>${job.balance_unpaid}</td></tr>
        <tr><th>Balance Unpaid (Taxed)</th><td>${job.balance_unpaid_taxed}</td></tr>
        <tr><th>Priority</th><td>${job.priority}</td></tr>
        <tr><th>Delivery Date</th><td>${job.delivery_date?.split("T")[0]}</td></tr>
        <tr><th>Payment Status</th><td>${job.payment_status}</td></tr>
        <tr><th>Payment Due</th><td>${job.payment_due_date?.split("T")[0]}</td></tr>
        <tr><th>Department</th><td>${job.department_name || ""}</td></tr>
        <tr><th>Assigned To</th><td>${job.assigned_to_name || ""}</td></tr>
        <tr><th>Product</th><td>${job.product_name || ""}</td></tr>
        <tr><th>Type</th><td>${job.type}</td></tr>
        <tr><th>Comments</th><td>${job.comments || ""}</td></tr>
      </table>
    `;

    bootstrap.Modal.getOrCreateInstance(document.getElementById("viewJobModal")).show();
  } catch (err) {
    console.error("Error viewing job:", err);
  }
};

window.editJob = function(job) {
  document.getElementById("job_id").value = job.id;
  document.getElementById("job_name").value = job.job_name;
  document.getElementById("status").value = job.status;
  document.getElementById("stage").value = job.stage;
  document.getElementById("qty").value = job.qty;
  document.getElementById("qty_remaining").value = job.qty_remaining;
  document.getElementById("completed_qty").value = job.completed_qty;
  document.getElementById("percent_complete").value = job.percent_complete;
  document.getElementById("price").value = job.price;
  document.getElementById("ordered_value").value = job.ordered_value;
  document.getElementById("completed_value").value = job.completed_value;
  document.getElementById("completed_value_with_tax").value = job.completed_value_with_tax;
  document.getElementById("completed_tax_amount").value = job.completed_tax_amount;
  document.getElementById("balance_unpaid").value = job.balance_unpaid;
  document.getElementById("balance_unpaid_taxed").value = job.balance_unpaid_taxed;
  document.getElementById("priority").value = job.priority;
  document.getElementById("delivery_date").value = job.delivery_date?.split("T")[0];
  document.getElementById("payment_status").value = job.payment_status;
  document.getElementById("payment_due_date").value = job.payment_due_date?.split("T")[0];
  document.getElementById("department_id").value = job.department_id;
  document.getElementById("assigned_to").value = job.assigned_to;
  document.getElementById("product_id").value = job.product_id;
  document.getElementById("type").value = job.type;
  document.getElementById("comments").value = job.comments;

  bootstrap.Modal.getOrCreateInstance(document.getElementById("editJobModal")).show();
};

window.deleteJob = async function(id) {
  if (!confirm("Are you sure you want to delete this job?")) return;
  try {
    await fetchWithAuth(`/api/jobs/${id}`, { method: "DELETE" });
    loadJobs();
  } catch (err) {
    console.error("Delete error:", err);
  }
};

async function handleJobSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("job_id").value;

  const payload = {
    job_name: document.getElementById("job_name").value,
    status: document.getElementById("status").value,
    stage: document.getElementById("stage").value,
    qty: parseFloat(document.getElementById("qty").value),
    qty_remaining: parseFloat(document.getElementById("qty_remaining").value),
    completed_qty: parseFloat(document.getElementById("completed_qty").value),
    percent_complete: parseFloat(document.getElementById("percent_complete").value),
    price: parseFloat(document.getElementById("price").value),
    ordered_value: parseFloat(document.getElementById("ordered_value").value),
    completed_value: parseFloat(document.getElementById("completed_value").value),
    completed_value_with_tax: parseFloat(document.getElementById("completed_value_with_tax").value),
    completed_tax_amount: parseFloat(document.getElementById("completed_tax_amount").value),
    balance_unpaid: parseFloat(document.getElementById("balance_unpaid").value),
    balance_unpaid_taxed: parseFloat(document.getElementById("balance_unpaid_taxed").value),
    priority: document.getElementById("priority").value,
    delivery_date: document.getElementById("delivery_date").value,
    payment_status: document.getElementById("payment_status").value,
    payment_due_date: document.getElementById("payment_due_date").value,
    department_id: document.getElementById("department_id").value,
    assigned_to: document.getElementById("assigned_to").value,
    product_id: document.getElementById("product_id").value,
    type: document.getElementById("type").value,
    comments: document.getElementById("comments").value
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `/api/jobs/${id}` : `/api/jobs`;

  try {
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
