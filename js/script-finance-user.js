const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadPayments();
});

let allPayments = [];
const PAYMENTS_PAGE_SIZE = 10;

async function loadPayments(page = 1) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/payments`);
    allPayments = await res.json();
    const user = getCurrentUser();
    const search = document.getElementById("search-payments")?.value.toLowerCase() || "";
    const date = document.getElementById("payment-date")?.value;

    let filtered = allPayments.filter(p =>
      (p.customer_name?.toLowerCase().includes(search) || p.method?.toLowerCase().includes(search)) &&
      (user.roles.includes("admin") || p.user_id === user.id) &&
      (!date || p.date.startsWith(date))
    );

    const totalPages = Math.ceil(filtered.length / PAYMENTS_PAGE_SIZE);
    const pagePayments = filtered.slice((page - 1) * PAYMENTS_PAGE_SIZE, page * PAYMENTS_PAGE_SIZE);

    const tbody = document.getElementById("payments-body");
    tbody.innerHTML = "";
    pagePayments.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${p.customer_name}</td><td>${p.order_id}</td><td>₵${p.amount}</td><td>${p.method}</td><td>${new Date(p.date).toLocaleDateString()}</td>`;
      tbody.appendChild(tr);
    });

    const pag = document.getElementById("pagination-payments");
    pag.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = "btn btn-sm btn-outline-primary mx-1";
      btn.textContent = i;
      if (i === page) btn.classList.add("active");
      btn.onclick = () => loadPayments(i);
      pag.appendChild(btn);
    }
  } catch (err) {
    console.error("Payments error:", err);
  }
}
