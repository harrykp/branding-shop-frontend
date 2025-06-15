// js/script-leave-requests.js

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();

  loadLeaveRequests();
  populateDropdowns();

  document.getElementById("leaveForm").addEventListener("submit", handleSubmit);
});

let currentPage = 1;

async function loadLeaveRequests(page = 1) {
  currentPage = page;
  const search = document.getElementById("searchInput")?.value || "";

  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_requests?page=${page}&limit=10&search=${search}`);
    const { data, total } = await res.json();
    renderLeaveRequestsTable(data);
    renderPagination(total, 10, page, loadLeaveRequests);
  } catch (err) {
    console.error("Failed to load leave requests:", err);
  }
}

function renderLeaveRequestsTable(requests) {
  const tbody = document.getElementById("leave-requests-table-body");
  tbody.innerHTML = "";

  requests.forEach((req) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${req.user_name || ""}</td>
      <td>${req.leave_type_name || ""}</td>
      <td>${req.start_date}</td>
      <td>${req.end_date}</td>
      <td>${req.status}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="openViewModal(${req.id})">View</button>
        <button class="btn btn-sm btn-warning" onclick="openEditModal(${req.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="handleDelete(${req.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function populateDropdowns() {
  await populateSelect("user_id", "/api/users", "name");
  await populateSelect("leave_type_id", "/api/leave_types", "name");
}

async function openEditModal(id) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_requests/${id}`);
    const data = await res.json();
    document.getElementById("leave-id").value = data.id;
    document.getElementById("user_id").value = data.user_id;
    document.getElementById("leave_type_id").value = data.leave_type_id;
    document.getElementById("start_date").value = data.start_date;
    document.getElementById("end_date").value = data.end_date;
    document.getElementById("status").value = data.status;
    document.getElementById("reason").value = data.reason || "";

    new bootstrap.Modal(document.getElementById("leaveModal")).show();
  } catch (err) {
    console.error("Failed to fetch leave request:", err);
  }
}

async function openViewModal(id) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_requests/${id}`);
    const data = await res.json();
    document.getElementById("view-leave-body").innerHTML = `
      <p><strong>User:</strong> ${data.user_name || ""}</p>
      <p><strong>Leave Type:</strong> ${data.leave_type_name || ""}</p>
      <p><strong>Start Date:</strong> ${data.start_date}</p>
      <p><strong>End Date:</strong> ${data.end_date}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Reason:</strong> ${data.reason || ""}</p>
    `;
    new bootstrap.Modal(document.getElementById("viewModal")).show();
  } catch (err) {
    console.error("Failed to view leave request:", err);
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("leave-id").value;
  const payload = {
    user_id: document.getElementById("user_id").value,
    leave_type_id: document.getElementById("leave_type_id").value,
    start_date: document.getElementById("start_date").value,
    end_date: document.getElementById("end_date").value,
    status: document.getElementById("status").value,
    reason: document.getElementById("reason").value,
  };

  try {
    const url = `${API_BASE}/api/leave_requests${id ? "/" + id : ""}`;
    const method = id ? "PUT" : "POST";
    await fetchWithAuth(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    bootstrap.Modal.getInstance(document.getElementById("leaveModal")).hide();
    document.getElementById("leaveForm").reset();
    loadLeaveRequests(currentPage);
  } catch (err) {
    console.error("Failed to save leave request:", err);
  }
}

async function handleDelete(id) {
  if (!confirm("Delete this leave request?")) return;
  try {
    await fetchWithAuth(`${API_BASE}/api/leave_requests/${id}`, { method: "DELETE" });
    loadLeaveRequests(currentPage);
  } catch (err) {
    console.error("Failed to delete leave request:", err);
  }
}
