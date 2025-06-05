// /js/script-deals.js

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  populateSelect("leads", "lead_id");
  populateSelect("quotes", "quote_id");
  populateSelect("customers", "customer_id");
  populateSelect("users", "sales_rep_id");
  populateSelect("users", "assigned_to");
  populateSelect("departments", "department_id");

  document.getElementById("searchInput").addEventListener("input", fetchDeals);
  document.getElementById("dealForm").addEventListener("submit", handleDealSubmit);

  fetchDeals();
});

async function fetchDeals() {
  const search = document.getElementById("searchInput").value;
  try {
    const res = await fetchWithAuth(`/api/deals?search=${encodeURIComponent(search)}&page=1&limit=10`);
    const { data, total } = await res.json();
    renderDeals(data);
    renderPagination(total, 1, 10, fetchDeals, "pagination-container");
  } catch (err) {
    console.error("Failed to load deals:", err);
  }
}

function renderDeals(deals) {
  const tbody = document.getElementById("deal-table-body");
  tbody.innerHTML = "";
  deals.forEach(deal => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${deal.lead_name || ""}</td>
      <td>${deal.customer_name || ""}</td>
      <td>${deal.quote_id || ""}</td>
      <td>${deal.assigned_to_name || ""}</td>
      <td>${deal.status}</td>
      <td>${deal.stage || ""}</td>
      <td>${deal.value || 0}</td>
      <td>${deal.expected_close_date?.split("T")[0] || ""}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick='viewDeal(${deal.id})'>View</button>
        <button class="btn btn-sm btn-primary" onclick='editDeal(${JSON.stringify(deal)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick='deleteDeal(${deal.id})'>Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function viewDeal(id) {
  try {
    const res = await fetchWithAuth(`/api/deals/${id}`);
    const data = await res.json();
    const body = document.getElementById("view-deal-body");
    body.innerHTML = `
      <table class="table">
        <tr><th>Lead</th><td>${data.lead_name || ""}</td></tr>
        <tr><th>Customer</th><td>${data.customer_name || ""}</td></tr>
        <tr><th>Quote</th><td>${data.quote_id || ""}</td></tr>
        <tr><th>Sales Rep</th><td>${data.sales_rep_name || ""}</td></tr>
        <tr><th>Assigned To</th><td>${data.assigned_to_name || ""}</td></tr>
        <tr><th>Department</th><td>${data.department_name || ""}</td></tr>
        <tr><th>Status</th><td>${data.status}</td></tr>
        <tr><th>Stage</th><td>${data.stage || ""}</td></tr>
        <tr><th>Expected Close</th><td>${data.expected_close_date?.split("T")[0] || ""}</td></tr>
        <tr><th>Closed At</th><td>${data.closed_at?.split("T")[0] || ""}</td></tr>
        <tr><th>Value</th><td>${data.value || 0}</td></tr>
        <tr><th>Notes</th><td>${data.notes || ""}</td></tr>
      </table>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("viewModal")).show();
  } catch (err) {
    console.error("Failed to view deal:", err);
  }
}

function editDeal(deal) {
  document.getElementById("deal-id").value = deal.id;
  document.getElementById("lead_id").value = deal.lead_id || "";
  document.getElementById("quote_id").value = deal.quote_id || "";
  document.getElementById("customer_id").value = deal.customer_id || "";
  document.getElementById("sales_rep_id").value = deal.sales_rep_id || "";
  document.getElementById("assigned_to").value = deal.assigned_to || "";
  document.getElementById("department_id").value = deal.department_id || "";
  document.getElementById("status").value = deal.status || "open";
  document.getElementById("stage").value = deal.stage || "";
  document.getElementById("expected_close_date").value = deal.expected_close_date?.split("T")[0] || "";
  document.getElementById("closed_at").value = deal.closed_at?.split("T")[0] || "";
  document.getElementById("value").value = deal.value || "";
  document.getElementById("notes").value = deal.notes || "";

  bootstrap.Modal.getOrCreateInstance(document.getElementById("dealModal")).show();
}

async function handleDealSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("deal-id").value;
  const payload = {
    lead_id: document.getElementById("lead_id").value,
    quote_id: document.getElementById("quote_id").value,
    customer_id: document.getElementById("customer_id").value,
    sales_rep_id: document.getElementById("sales_rep_id").value,
    assigned_to: document.getElementById("assigned_to").value,
    department_id: document.getElementById("department_id").value,
    status: document.getElementById("status").value,
    stage: document.getElementById("stage").value,
    expected_close_date: document.getElementById("expected_close_date").value,
    closed_at: document.getElementById("closed_at").value,
    value: document.getElementById("value").value,
    notes: document.getElementById("notes").value
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/deals/${id}` : "/api/deals";
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    bootstrap.Modal.getInstance(document.getElementById("dealModal")).hide();
    document.getElementById("dealForm").reset();
    fetchDeals();
  } catch (err) {
    console.error("Error saving deal:", err);
  }
}

async function deleteDeal(id) {
  if (!confirm("Are you sure you want to delete this deal?")) return;
  try {
    await fetchWithAuth(`/api/deals/${id}`, { method: "DELETE" });
    fetchDeals();
  } catch (err) {
    console.error("Error deleting deal:", err);
  }
}
