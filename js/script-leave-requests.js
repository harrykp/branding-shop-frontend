// js/script-leave-requests.js

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();
  loadLeaveRequests();
  populateSelect("user_id", "users", "name");
  populateSelect("leave_type_id", "leave_types", "name");

  const form = document.getElementById("leave-request-form");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
});

async function loadLeaveRequests(page = 1) {
  const search = document.getElementById("searchInput")?.value || "";
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_requests?page=${page}&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();

    const tbody = document.getElementById("leave-requests-table-body");
    tbody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.employee_name}</td>
        <td>${row.leave_type_name}</td>
        <td>${row.start_date}</td>
        <td>${row.end_date}</td>
        <td>${row.status}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewLeaveRequest(${row.id})">View</button>
          <button class="btn btn-sm btn-primary" onclick="editLeaveRequest(${row.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteLeaveRequest(${row.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination("pagination-container", total, page, loadLeaveRequests);
  } catch (err) {
    console.error("Failed to load leave requests:", err);
  }
}

window.editLeaveRequest = async (id) => {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_requests/${id}`);
    const data = await res.json();
    for (const field in data) {
      const el = document.getElementById(field);
      if (el) el.value = data[field];
    }
    const modal = new bootstrap.Modal(document.getElementById("leaveRequestModal"));
    modal.show();
  } catch (err) {
    console.error("Error loading leave request", err);
  }
};

window.viewLeaveRequest = async (id) => {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_requests/${id}`);
    const data = await res.json();
    const container = document.getElementById("view-leave-request-body");
    container.innerHTML = `
      <p><strong>Employee:</strong> ${data.employee_name}</p>
      <p><strong>Leave Type:</strong> ${data.leave_type_name}</p>
      <p><strong>Start Date:</strong> ${data.start_date}</p>
      <p><strong>End Date:</strong> ${data.end_date}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p><strong>Status:</strong> ${data.status}</p>
    `;
    const modal = new bootstrap.Modal(document.getElementById("viewLeaveRequestModal"));
    modal.show();
  } catch (err) {
    console.error("Error viewing leave request", err);
  }
};

window.deleteLeaveRequest = async (id) => {
  if (!confirm("Are you sure you want to delete this request?")) return;
  try {
    await fetchWithAuth(`${API_BASE}/api/leave_requests/${id}`, { method: "DELETE" });
    loadLeaveRequests();
  } catch (err) {
    console.error("Error deleting leave request", err);
  }
};

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const id = document.getElementById("id").value;
  const formData = {
    user_id: form.user_id.value,
    leave_type_id: form.leave_type_id.value,
    start_date: form.start_date.value,
    end_date: form.end_date.value,
    reason: form.reason.value,
    status: form.status.value
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${API_BASE}/api/leave_requests/${id}`
      : `${API_BASE}/api/leave_requests`;

    await fetchWithAuth(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    bootstrap.Modal.getInstance(document.getElementById("leaveRequestModal")).hide();
    form.reset();
    loadLeaveRequests();
  } catch (err) {
    console.error("Error saving leave request", err);
  }
}

window.exportLeaveRequests = () => {
  exportTableToCSV("leave-requests-table", "leave-requests.csv");
};
