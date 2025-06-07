document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();

  populateSelect("jobs", "job_id");
  populateSelect("customers", "customer_id");
  populateSelect("users", "received_by");

  document.getElementById("paymentForm").addEventListener("submit", handlePaymentSubmit);
  document.getElementById("searchInput").addEventListener("input", () => loadPayments(1));

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
  payments.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.payment_name || ""}</td>
      <td>${p.job_name || ""}</td>
      <td>${p.customer_name || ""}</td>
      <td>${p.amount || ""}</td>
      <td>${p.payment_type || ""}</td>
      <td>${p.method || ""}</td>
      <td>${p.payment_date?.split("T")[0] || ""}</td>
      <td>${p.received_by_name || ""}</td>
      <td>${p.exempt ? "Yes" : "No"}</td>
      <td>${p.wht_amount || 0}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick='editPayment(${JSON.stringify(p)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deletePayment(${p.id})">Delete</button>
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
  document.getElementById("received_by").value = payment.received_by || "";
  document.getElementById("exempt").checked = !!payment.exempt;
  document.getElementById("wht_amount").value = payment.wht_amount || 0;
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
    received_by: document.getElementById("received_by").value,
    exempt: document.getElementById("exempt").checked,
    wht_amount: document.getElementById("wht_amount").value,
    notes: document.getElementById("notes").value,
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

window.exportPaymentsToCSV = function () {
  exportTableToCSV("payments-table", "payments.csv");
};
