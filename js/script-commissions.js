document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();

  populateSelect("payments", "payment_id");
  populateSelect("jobs", "job_id");
  
  document.getElementById("job_id").addEventListener("change", async (e) => {
    const jobId = e.target.value;
    if (!jobId) return;
    try {
      const res = await fetchWithAuth(`/api/jobs/${jobId}`);
      const job = await res.json();
      document.getElementById("job_status").value = job.status || "";
    } catch (err) {
      console.error("Failed to load job status for job_id", jobId, err);
    }
  });

  populateSelect("deals", "deal_id");
  populateSelect("orders", "order_id");
  populateSelect("users", "sales_rep_id");
  populateSelect("users", "agent_id");

  document.getElementById("searchInput").addEventListener("input", () => loadCommissions(1));
  document.getElementById("commissionForm").addEventListener("submit", handleSubmit);

  loadCommissions();
});

let currentPage = 1;

async function loadCommissions(page = 1) {
  currentPage = page;
  const search = document.getElementById("searchInput").value.trim();
  try {
    const res = await fetchWithAuth(`/api/commissions?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const result = await res.json();
    console.log("Commission API response:", result);
    const commissions = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
    const total = result.total || commissions.length;
    renderCommissions(commissions);

    renderPagination(total, "pagination-container", loadCommissions, 10, page);
  } catch (err) {
    console.error("Failed to load commissions:", err);
  }
}

function renderCommissions(commissions) {
  const tbody = document.getElementById("commission-table-body");
  tbody.innerHTML = "";
  commissions.forEach(c => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.job_name || ""}</td>
      <td>${c.sales_rep_name || ""}</td>
      <td>${c.commission_rate || ""}</td>
      <td>${c.commission_earned || ""}</td>
      <td>${c.wht_on_commission || ""}</td>
      <td>${c.commission_after_wht || ""}</td>
      <td>${c.commission_status || ""}</td>
      <td>${c.commission_pay_date?.split("T")[0] || ""}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick='editCommission(${JSON.stringify(c)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCommission(${c.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editCommission(c) {
  document.getElementById("commission-id").value = c.id;
  [
    "payment_id", "job_id", "deal_id", "order_id", "sales_rep_id", "agent_id", "job_status",
    "commission_rate", "commission_earned", "wht_on_commission", "commission_after_wht",
    "comm_after_wht_and_sales_tax", "commission_status", "unpaid_balance", "notes"
  ].forEach(id => document.getElementById(id).value = c[id] || "");

  ["job_start_date", "job_complete_date", "delivery_date", "commission_pay_date"].forEach(id => {
    document.getElementById(id).value = c[id]?.split("T")[0] || "";
  });

  bootstrap.Modal.getOrCreateInstance(document.getElementById("commissionModal")).show();
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("commission-id").value;
  const payload = {
    payment_id: document.getElementById("payment_id").value,
    job_id: document.getElementById("job_id").value,
    deal_id: document.getElementById("deal_id").value,
    order_id: document.getElementById("order_id").value,
    sales_rep_id: document.getElementById("sales_rep_id").value,
    agent_id: document.getElementById("agent_id").value,
    job_status: document.getElementById("job_status").value,
    commission_rate: document.getElementById("commission_rate").value,
    commission_earned: document.getElementById("commission_earned").value,
    wht_on_commission: document.getElementById("wht_on_commission").value,
    commission_after_wht: document.getElementById("commission_after_wht").value,
    comm_after_wht_and_sales_tax: document.getElementById("comm_after_wht_and_sales_tax").value,
    commission_status: document.getElementById("commission_status").value,
    unpaid_balance: document.getElementById("unpaid_balance").value,
    notes: document.getElementById("notes").value,
    job_start_date: document.getElementById("job_start_date").value,
    job_complete_date: document.getElementById("job_complete_date").value,
    delivery_date: document.getElementById("delivery_date").value,
    commission_pay_date: document.getElementById("commission_pay_date").value
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/commissions/${id}` : "/api/commissions";
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    bootstrap.Modal.getInstance(document.getElementById("commissionModal")).hide();
    document.getElementById("commissionForm").reset();
    loadCommissions(currentPage);
  } catch (err) {
    console.error("Error saving commission:", err);
  }
}

async function deleteCommission(id) {
  if (!confirm("Delete this commission?")) return;
  try {
    await fetchWithAuth(`/api/commissions/${id}`, { method: "DELETE" });
    loadCommissions(currentPage);
  } catch (err) {
    console.error("Error deleting commission:", err);
  }
}
