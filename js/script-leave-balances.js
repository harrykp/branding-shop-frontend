// js/script-leave-balances.js
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await populateSelect("user_id", "/api/users");
  await populateSelect("leave_type_id", "/api/leave-types");
  loadLeaveBalances();

  document.getElementById("leave-balance-form").addEventListener("submit", handleSubmit);
});

async function loadLeaveBalances(page = 1) {
  const search = document.getElementById("searchInput").value;
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave-balances?page=${page}&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();

    const tbody = document.getElementById("leave-balance-table-body");
    tbody.innerHTML = "";

    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.user_name || ""}</td>
        <td>${item.leave_type_name || ""}</td>
        <td>${item.days_allocated}</td>
        <td>${item.days_used}</td>
        <td>${item.days_remaining}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editBalance(${item.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteBalance(${item.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination(total, page, loadLeaveBalances);
  } catch (err) {
    console.error("Failed to load leave balances", err);
  }
}

window.editBalance = async function (id) {
  const res = await fetchWithAuth(`${API_BASE}/api/leave-balances/${id}`);
  const data = await res.json();

  document.getElementById("balance-id").value = data.id;
  document.getElementById("user_id").value = data.user_id;
  document.getElementById("leave_type_id").value = data.leave_type_id;
  document.getElementById("days_allocated").value = data.days_allocated;
  document.getElementById("days_used").value = data.days_used;
  document.getElementById("days_remaining").value = data.days_remaining;

  new bootstrap.Modal(document.getElementById("leaveBalanceModal")).show();
};

window.deleteBalance = async function (id) {
  if (!confirm("Are you sure you want to delete this record?")) return;
  await fetchWithAuth(`${API_BASE}/api/leave-balances/${id}`, { method: "DELETE" });
  loadLeaveBalances();
};

async function handleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("balance-id").value;
  const payload = {
    user_id: document.getElementById("user_id").value,
    leave_type_id: document.getElementById("leave_type_id").value,
    days_allocated: document.getElementById("days_allocated").value,
    days_used: document.getElementById("days_used").value,
    days_remaining: document.getElementById("days_remaining").value
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_BASE}/api/leave-balances/${id}` : `${API_BASE}/api/leave-balances`;

  await fetchWithAuth(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  bootstrap.Modal.getInstance(document.getElementById("leaveBalanceModal")).hide();
  document.getElementById("leave-balance-form").reset();
  loadLeaveBalances();
}

window.exportBalances = () => exportTableToCSV("leave-balance-table", "leave-balances.csv");
