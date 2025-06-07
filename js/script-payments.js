document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();

  populateSelect("customers", "customer_id");
  populateSelect("users", "received_by");
  populateSelect("jobs", "job_id");
  populateSelect("orders", "order_id");

  document.getElementById("searchInput").addEventListener("input", () => loadPayments(1));
  document.getElementById("paymentForm").addEventListener("submit", handlePaymentSubmit);

  loadPayments();
});

let currentPage = 1;

async function loadPayments(page = 1) {
  currentPage = page;
  const search = document.getElementById("searchInput").value.trim();
  try {
    const res = await fetchWithAuth(`/api/payments?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();
    renderPayments(data);
    renderPagination(total, "pagination-container", loadPayments, 10, page);
  } catch (err) {
    console.error("Failed to load payments:", err);
  }
}

function renderPayments(payments) {
  const tbody = document.getElementById("payment-table-body");
  tbody.innerHTML = "";
  payments.forEach(payment => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${payment.payment_name || ""}</td>
      <td>${payment.customer_name || ""}</td>
      <td>${payment.amount || ""}</td>
      <td>${payment.payment_type || ""}</td>
      <td>${payment.method || ""}</td>
      <td>${payment.payment_date?.split("T")[0] || ""}</td>
      <td>${payment.gateway || ""}</td>
      <td>${payment.transaction_id || ""}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick='viewPayment(${JSON.stringify(payment)})'>View</button>
        <button class="btn btn-sm btn-info" onclick='editPayment(${JSON.stringify(payment)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deletePayment(${payment.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editPayment(payment) {
  document.getElementById("payment-id").value = payment.id;
  document.getElementById("payment_name").value = payment.payment_name || "";
  document.getElementById("job_id").value = payment.job_id || "";
  document.getElementById("customer_id").value = payment.customer_id || "";
  document.getElementById("amount").value = payment.amount || "";
  document.getElementById("payment_type").value = payment.payment_type || "";
  document.getElementById("method").value = payment.method || "";
  document.getElementById("payment_date").value = payment.payment_date?.split("T")[0] || "";
  document.getElementById("delivery_date").value = payment.delivery_date?.split("T")[0] || "";
  document.getElementById("order_id").value = payment.order_id || "";
  document.getElementById("gateway").value = payment.gateway || "";
  document.getElementById("transaction_id").value = payment.transaction_id || "";
  document.getElementById("wht_amount").value = payment.wht_amount || "0";
  document.getElementById("exempt").value = payment.exempt ? "true" : "false";
  document.getElementById("received_by").value = payment.received_by || "";
  document.getElementById("notes").value = payment.notes || "";

  bootstrap.Modal.getOrCreateInstance(document.getElementById("paymentModal")).show();
}

async function handlePaymentSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("payment-id").value;
  const payload = {
    payment_name: document.getElementById("payment_name").value,
    job_id: document.getElementById("job_id").value,
    customer_id: document.getElementById("customer_id").value,
    amount: document.getElementById("amount").value,
    payment_type: document.getElementById("payment_type").value,
    method: document.getElementById("method").value,
    payment_date: document.getElementById("payment_date").value,
    delivery_date: document.getElementById("delivery_date").value,
    order_id: document.getElementById("order_id").value,
    gateway: document.getElementById("gateway").value,
    transaction_id: document.getElementById("transaction_id").value,
    wht_amount: document.getElementById("wht_amount").value,
    exempt: document.getElementById("exempt").value === "true",
    received_by: document.getElementById("received_by").value,
    notes: document.getElementById("notes").value
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/payments/${id}` : "/api/payments";
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    bootstrap.Modal.getInstance(document.getElementById("paymentModal")).hide();
    document.getElementById("paymentForm").reset();
    loadPayments(currentPage);
  } catch (err) {
    console.error("Error saving payment:", err);
  }
}

async function deletePayment(id) {
  if (!confirm("Are you sure you want to delete this payment?")) return;
  try {
    await fetchWithAuth(`/api/payments/${id}`, { method: "DELETE" });
    loadPayments(currentPage);
  } catch (err) {
    console.error("Error deleting payment:", err);
  }
}

function viewPayment(p) {
  const container = document.getElementById("view-payment-body");
  container.innerHTML = `
    <table class="table table-bordered">
      <tr><th>Payment Name</th><td>${p.payment_name || ""}</td></tr>
      <tr><th>Job</th><td>${p.job_id || ""}</td></tr>
      <tr><th>Customer</th><td>${p.customer_name || ""}</td></tr>
      <tr><th>Amount</th><td>${p.amount || ""}</td></tr>
      <tr><th>Payment Type</th><td>${p.payment_type || ""}</td></tr>
      <tr><th>Method</th><td>${p.method || ""}</td></tr>
      <tr><th>Payment Date</th><td>${p.payment_date?.split("T")[0] || ""}</td></tr>
      <tr><th>Delivery Date</th><td>${p.delivery_date?.split("T")[0] || ""}</td></tr>
      <tr><th>Order</th><td>${p.order_id || ""}</td></tr>
      <tr><th>Gateway</th><td>${p.gateway || ""}</td></tr>
      <tr><th>Transaction ID</th><td>${p.transaction_id || ""}</td></tr>
      <tr><th>WHT Amount</th><td>${p.wht_amount || ""}</td></tr>
      <tr><th>Exempt</th><td>${p.exempt ? "Yes" : "No"}</td></tr>
      <tr><th>Received By</th><td>${p.received_by_name || p.received_by || ""}</td></tr>
      <tr><th>Notes</th><td>${p.notes || ""}</td></tr>
    </table>
  `;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("viewModal")).show();
} 

