// js/script-leave-balances.js

document.addEventListener("DOMContentLoaded", () => {
  loadLeaveBalances();
  document.getElementById("searchInput").addEventListener("input", loadLeaveBalances);
  document.getElementById("leaveForm").addEventListener("submit", handleSubmit);
});

async function loadLeaveBalances(page = 1) {
  const search = document.getElementById("searchInput").value || "";
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_balances?page=${page}&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();
    const tbody = document.getElementById("leave-balance-table-body");
    tbody.innerHTML = "";

    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.user_name || ""}</td>
        <td>${item.leave_type_name || ""}</td>
        <td>${item.year}</td>
        <td>${item.days_allocated}</td>
        <td>${item.days_used}</td>
        <td>${item.days_allocated - item.days_used}</td>
        <td>${item.notes || ""}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick='viewLeave(${JSON.stringify(item)})'>View</button>
          <button class="btn btn-sm btn-warning" onclick='editLeave(${JSON.stringify(item)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteLeave(${item.id})'>Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination(total, page, loadLeaveBalances);
  } catch (err) {
    console.error("Failed to load leave balances", err);
  }
}

function viewLeave(data) {
  const container = document.getElementById("view-leave-body");
  container.innerHTML = `
    <p><strong>Employee:</strong> ${data.user_name}</p>
    <p><strong>Leave Type:</strong> ${data.leave_type_name}</p>
    <p><strong>Year:</strong> ${data.year}</p>
    <p><strong>Days Allocated:</strong> ${data.days_allocated}</p>
    <p><strong>Days Used:</strong> ${data.days_used}</p>
    <p><strong>Remaining:</strong> ${data.days_allocated - data.days_used}</p>
    <p><strong>Notes:</strong> ${data.notes || "N/A"}</p>
  `;
  new bootstrap.Modal(document.getElementById("viewModal")).show();
}

function editLeave(data) {
  document.getElementById("leave_balance_id").value = data.id;
  document.getElementById("user_id").value = data.user_id;
  document.getElementById("leave_type_id").value = data.leave_type_id;
  document.getElementById("year").value = data.year;
  document.getElementById("days_allocated").value = data.days_allocated;
  document.getElementById("days_used").value = data.days_used;
  document.getElementById("notes").value = data.notes;
  new bootstrap.Modal(document.getElementById("leaveModal")).show();
}

async function deleteLeave(id) {
  if (!confirm("Delete this leave balance?")) return;
  try {
    await fetchWithAuth(`${API_BASE}/api/leave_balances/${id}`, { method: "DELETE" });
    loadLeaveBalances();
  } catch (err) {
    console.error("Delete failed", err);
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("leave_balance_id").value;
  const payload = {
    user_id: document.getElementById("user_id").value,
    leave_type_id: document.getElementById("leave_type_id").value,
    year: document.getElementById("year").value,
    days_allocated: document.getElementById("days_allocated").value,
    days_used: document.getElementById("days_used").value,
    notes: document.getElementById("notes").value
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `${API_BASE}/api/leave_balances/${id}` : `${API_BASE}/api/leave_balances`;
    await fetchWithAuth(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    bootstrap.Modal.getInstance(document.getElementById("leaveModal")).hide();
    loadLeaveBalances();
    document.getElementById("leaveForm").reset();
  } catch (err) {
    console.error("Save failed", err);
  }
}

// Populate dropdowns
(async function initDropdowns() {
  try {
    await includeHTML();
    requireAdmin();
    populateSelect("user_id", `${API_BASE}/api/users`, "name");
    populateSelect("leave_type_id", `${API_BASE}/api/leave_types`, "name");
  } catch (err) {
    console.error("Init error", err);
  }
})();
