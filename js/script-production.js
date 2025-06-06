// script-production.js

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();

  populateSelect("departments", "department_id");
  populateSelect("customers", "customer_id");
  populateSelect("users", "sales_rep_id");
  populateSelect("users", "assigned_to");
  populateSelect("deals", "deal_id");
  populateSelect("orders", "order_id");
  populateSelect("products", "product_id");
  populateSelect("product-categories", "type");

  document.getElementById("jobForm").addEventListener("submit", handleJobSubmit);
  document.getElementById("searchInput").addEventListener("input", () => loadJobs(1));

  loadJobs();
});

let currentPage = 1;

async function loadJobs(page = 1) {
  currentPage = page;
  const search = document.getElementById("searchInput").value.trim();
  try {
    const res = await fetchWithAuth(`/api/jobs?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();
    renderJobs(data);
    renderPagination(total, page, 10, loadJobs, "pagination-container");
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
      <td>${job.job_name || ""}</td>
      <td>${job.department_name || ""}</td>
      <td>${job.customer_name || ""}</td>
      <td>${job.sales_rep_name || ""}</td>
      <td>${job.stage || ""}</td>
      <td>${job.type || ""}</td>
      <td>${job.status || ""}</td>
      <td>${job.priority || ""}</td>
      <td>${job.assigned_to_name || ""}</td>
      <td>${job.order_id || ""}</td>
      <td>${job.deal_id || ""}</td>
      <td>${job.product_name || ""}</td>
      <td>${job.qty || ""}</td>
      <td>${job.qty_remaining || ""}</td>
      <td>${job.price || ""}</td>
      <td>${job.ordered_value || ""}</td>
      <td>${job.delivery_date?.split("T")[0] || ""}</td>
      <td>${job.started_at?.split("T")[0] || ""}</td>
      <td>${job.completed_qty || ""}</td>
      <td>${job.percent_complete || ""}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="viewJob(${job.id})">View</button>
        <button class="btn btn-sm btn-primary" onclick='editJob(${JSON.stringify(job)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteJob(${job.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editJob(job) {
  document.getElementById("job-id").value = job.id;
  document.getElementById("job_name").value = job.job_name || "";
  document.getElementById("department_id").value = job.department_id || "";
  document.getElementById("customer_id").value = job.customer_id || "";
  document.getElementById("sales_rep_id").value = job.sales_rep_id || "";
  document.getElementById("stage").value = job.stage || "";
  document.getElementById("type").value = job.type || "";
  document.getElementById("status").value = job.status || "";
  document.getElementById("priority").value = job.priority || "";
  document.getElementById("assigned_to").value = job.assigned_to || "";
  document.getElementById("order_id").value = job.order_id || "";
  document.getElementById("deal_id").value = job.deal_id || "";
  document.getElementById("product_id").value = job.product_id || "";
  document.getElementById("qty").value = job.qty || "";
  document.getElementById("qty_remaining").value = job.qty_remaining || "";
  document.getElementById("price").value = job.price || "";
  document.getElementById("ordered_value").value = job.ordered_value || "";
  document.getElementById("delivery_date").value = job.delivery_date?.split("T")[0] || "";
  document.getElementById("started_at").value = job.started_at?.split("T")[0] || "";
  document.getElementById("completed_qty").value = job.completed_qty || "";
  document.getElementById("percent_complete").value = job.percent_complete || "";
  document.getElementById("comments").value = job.comments || "";

  bootstrap.Modal.getOrCreateInstance(document.getElementById("jobModal")).show();
}

async function viewJob(id) {
  try {
    const res = await fetchWithAuth(`/api/jobs/${id}`);
    const job = await res.json();
    const container = document.getElementById("view-job-body");
    container.innerHTML = `
      <table class="table">
        <tr><th>Job Name</th><td>${job.job_name}</td></tr>
        <tr><th>Department</th><td>${job.department_id}</td></tr>
        <tr><th>Customer</th><td>${job.customer_id}</td></tr>
        <tr><th>Sales Rep</th><td>${job.sales_rep_id}</td></tr>
        <tr><th>Stage</th><td>${job.stage}</td></tr>
        <tr><th>Type</th><td>${job.type}</td></tr>
        <tr><th>Status</th><td>${job.status}</td></tr>
        <tr><th>Priority</th><td>${job.priority}</td></tr>
        <tr><th>Assigned To</th><td>${job.assigned_to}</td></tr>
        <tr><th>Order</th><td>${job.order_id}</td></tr>
        <tr><th>Deal</th><td>${job.deal_id}</td></tr>
        <tr><th>Product</th><td>${job.product_id}</td></tr>
        <tr><th>Qty</th><td>${job.qty}</td></tr>
        <tr><th>Remaining</th><td>${job.qty_remaining}</td></tr>
        <tr><th>Price</th><td>${job.price}</td></tr>
        <tr><th>Ordered Value</th><td>${job.ordered_value}</td></tr>
        <tr><th>Delivery Date</th><td>${job.delivery_date?.split("T")[0]}</td></tr>
        <tr><th>Started At</th><td>${job.started_at?.split("T")[0]}</td></tr>
        <tr><th>Completed Qty</th><td>${job.completed_qty}</td></tr>
        <tr><th>% Complete</th><td>${job.percent_complete}</td></tr>
        <tr><th>Comments</th><td>${job.comments}</td></tr>
      </table>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("viewModal")).show();
  } catch (err) {
    console.error("Error viewing job:", err);
  }
}

async function handleJobSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("job-id").value;
  const payload = {
    job_name: document.getElementById("job_name").value,
    department_id: document.getElementById("department_id").value,
    customer_id: document.getElementById("customer_id").value,
    sales_rep_id: document.getElementById("sales_rep_id").value,
    stage: document.getElementById("stage").value,
    type: document.getElementById("type").value,
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    assigned_to: document.getElementById("assigned_to").value,
    order_id: document.getElementById("order_id").value,
    deal_id: document.getElementById("deal_id").value,
    product_id: document.getElementById("product_id").value,
    qty: document.getElementById("qty").value,
    qty_remaining: document.getElementById("qty_remaining").value,
    price: document.getElementById("price").value,
    ordered_value: document.getElementById("ordered_value").value,
    delivery_date: document.getElementById("delivery_date").value,
    started_at: document.getElementById("started_at").value,
    completed_qty: document.getElementById("completed_qty").value,
    percent_complete: document.getElementById("percent_complete").value,
    comments: document.getElementById("comments").value,
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/jobs/${id}` : "/api/jobs";
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload),
    });
    bootstrap.Modal.getInstance(document.getElementById("jobModal")).hide();
    document.getElementById("jobForm").reset();
    loadJobs(currentPage);
  } catch (err) {
    console.error("Error saving job:", err);
  }
}

async function deleteJob(id) {
  if (!confirm("Are you sure you want to delete this job?")) return;
  try {
    await fetchWithAuth(`/api/jobs/${id}`, { method: "DELETE" });
    loadJobs(currentPage);
  } catch (err) {
    console.error("Error deleting job:", err);
  }
}

window.exportJobsToCSV = function () {
  exportTableToCSV("jobs-table", "jobs");
};
