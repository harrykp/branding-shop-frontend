// js/script-leave-balances.js

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();
  loadLeaveBalances();
  populateSelect("user_id", "users", "name");
  populateSelect("leave_type_id", "leave_types", "name");

  const form = document.getElementById("leave-balance-form");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
});

async function loadLeaveBalances(page = 1) {
  const search = document.getElementById("searchInput")?.value || "";
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_balances?page=${page}&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();

    const tbody = document.getElementById("leave-balances-table-body");
    tbody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.employee_name}</td>
        <td>${row.leave_type_name}</td>
        <td>${row.allocated_days}</td>
        <td>${row.used_days}</td>
        <td>${row.remaining_days}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewLeaveBalance(${row.id})">View</button>
          <button class="btn btn-sm btn-primary" onclick="editLeaveBalance(${row.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteLeaveBalance(${row.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination("pagination-container", total, page, loadLeaveBalances);
  } catch (err) {
    console.error("Failed to load leave balances", err);
  }
}

window.editLeaveBalance = async (id) => {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_balances/${id}`);
    const data = await res.json();
    for (const field in data) {
      const el = document.getElementById(field);
      if (el) el.value = data[field];
    }
    const modal = new bootstrap.Modal(document.getElementById("leaveBalanceModal"));
    modal.show();
  } catch (err) {
    console.error("Error loading leave balance", err);
  }
};

window.viewLeaveBalance = async (id) => {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_balances/${id}`);
    const data = await res.json();
    const container = document.getElementById("view-leave-balance-body");
    container.innerHTML = `
      <p><strong>Employee:</strong> ${data.employee_name}</p>
      <p><strong>Leave Type:</strong> ${data.leave_type_name}</p>
      <p><strong>Allocated:</strong> ${data.allocated_days}</p>
      <p><strong>Used:</strong> ${data.used_days}</p>
      <p><strong>Remaining:</strong> ${data.remaining_days}</p>
    `;
    const modal = new bootstrap.Modal(document.getElementById("viewLeaveBalanceModal"));
    modal.show();
  } catch (err) {
    console.error("Error viewing leave balance", err);
  }
};

window.deleteLeaveBalance = async (id) => {
  if (!confirm("Are you sure you want to delete this record?")) return;
  try {
    await fetchWithAuth(`${API_BASE}/api/leave_balances/${id}`, { method: "DELETE" });
    loadLeaveBalances();
  } catch (err) {
    console.error("Error deleting leave balance", err);
  }
};

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const id = document.getElementById("id").value;
  const formData = {
    user_id: form.user_id.value,
    leave_type_id: form.leave_type_id.value,
    allocated_days: form.allocated_days.value,
    used_days: form.used_days.value,
    remaining_days: form.remaining_days.value
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${API_BASE}/api/leave_balances/${id}`
      : `${API_BASE}/api/leave_balances`;

    await fetchWithAuth(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    bootstrap.Modal.getInstance(document.getElementById("leaveBalanceModal")).hide();
    form.reset();
    loadLeaveBalances();
  } catch (err) {
    console.error("Error saving leave balance", err);
  }
}

window.exportLeaveBalances = () => {
  exportTableToCSV("leave-balances-table", "leave-balances.csv");
};
