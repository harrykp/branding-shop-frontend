// js/script-leave-requests.js

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();
  await populateSelect("user_id", "/api/users");
  await populateSelect("leave_type_id", "/api/leave-types");
  loadLeaveRequests();

  document.getElementById("searchInput").addEventListener("input", () => loadLeaveRequests(1));
  document.getElementById("leaveForm").addEventListener("submit", handleSubmit);
});

let currentPage = 1;

async function loadLeaveRequests(page = 1) {
  currentPage = page;
  const search = document.getElementById("searchInput")?.value || "";

  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_requests?page=${page}&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();

    const tbody = document.getElementById("leave-table-body");
    tbody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.user_name}</td>
        <td>${row.leave_type_name}</td>
        <td>${row.start_date}</td>
        <td>${row.end_date}</td>
        <td>${row.reason}</td>
        <td>${row.status}</td>
        <td>
          <button class='btn btn-sm btn-primary' onclick='editLeaveRequest(${row.id})'>Edit</button>
          <button class='btn btn-sm btn-danger' onclick='deleteLeaveRequest(${row.id})'>Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
    renderPagination(total, page, loadLeaveRequests);
  } catch (err) {
    console.error("Failed to load leave requests:", err);
  }
}

window.editLeaveRequest = async (id) => {
  const res = await fetchWithAuth(`${API_BASE}/api/leave_requests/${id}`);
  const data = await res.json();
  document.getElementById("leave-id").value = data.id;
  document.getElementById("user_id").value = data.user_id;
  document.getElementById("leave_type_id").value = data.leave_type_id;
  document.getElementById("start_date").value = data.start_date?.split("T")[0];
  document.getElementById("end_date").value = data.end_date?.split("T")[0];
  document.getElementById("reason").value = data.reason;
  document.getElementById("status").value = data.status;
  new bootstrap.Modal(document.getElementById("leaveModal")).show();
}

window.deleteLeaveRequest = async (id) => {
  if (!confirm("Are you sure?")) return;
  await fetchWithAuth(`${API_BASE}/api/leave_requests/${id}`, { method: "DELETE" });
  loadLeaveRequests(currentPage);
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("leave-id").value;
  const payload = {
    user_id: document.getElementById("user_id").value,
    leave_type_id: document.getElementById("leave_type_id").value,
    start_date: document.getElementById("start_date").value,
    end_date: document.getElementById("end_date").value,
    reason: document.getElementById("reason").value,
    status: document.getElementById("status").value
  };
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_BASE}/api/leave_requests/${id}` : `${API_BASE}/api/leave_requests`;
  await fetchWithAuth(url, { method, body: JSON.stringify(payload) });
  bootstrap.Modal.getInstance(document.getElementById("leaveModal")).hide();
  loadLeaveRequests(currentPage);
}
