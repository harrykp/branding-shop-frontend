// script-leave-requests.js

document.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await loadLeaveRequests();
  await populateSelect('user_id', '/api/users');
  await populateSelect('leave_type_id', '/api/leave-types');

  document.getElementById('leaveRequestForm')?.addEventListener('submit', saveLeaveRequest);
});

async function loadLeaveRequests(page = 1) {
  const search = document.getElementById('searchInput')?.value || '';
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_requests?page=${page}&search=${search}`);
    const { data, total } = await res.json();
    const tbody = document.getElementById('leave-request-table-body');
    tbody.innerHTML = '';

    data.forEach(lr => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${lr.user_name}</td>
        <td>${lr.leave_type_name}</td>
        <td>${lr.start_date}</td>
        <td>${lr.end_date}</td>
        <td>${lr.status}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick='viewLeaveRequest(${JSON.stringify(lr)})'>View</button>
          <button class="btn btn-sm btn-primary" onclick='editLeaveRequest(${JSON.stringify(lr)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteLeaveRequest(${lr.id})'>Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
    renderPagination(total, page, loadLeaveRequests);
  } catch (err) {
    console.error('Failed to load leave requests:', err);
  }
}

async function saveLeaveRequest(e) {
  e.preventDefault();
  const id = document.getElementById('leave_request_id').value;
  const payload = {
    user_id: document.getElementById('user_id').value,
    leave_type_id: document.getElementById('leave_type_id').value,
    start_date: document.getElementById('start_date').value,
    end_date: document.getElementById('end_date').value,
    reason: document.getElementById('reason').value,
    status: document.getElementById('status').value,
    approved_by: document.getElementById('approved_by').value
  };

  try {
    const url = `${API_BASE}/api/leave_requests${id ? `/${id}` : ''}`;
    const method = id ? 'PUT' : 'POST';
    await fetchWithAuth(url, { method, body: JSON.stringify(payload) });
    bootstrap.Modal.getOrCreateInstance(document.getElementById('leaveRequestModal')).hide();
    await loadLeaveRequests();
  } catch (err) {
    console.error('Save failed:', err);
  }
}

function editLeaveRequest(lr) {
  document.getElementById('leave_request_id').value = lr.id;
  document.getElementById('user_id').value = lr.user_id;
  document.getElementById('leave_type_id').value = lr.leave_type_id;
  document.getElementById('start_date').value = lr.start_date;
  document.getElementById('end_date').value = lr.end_date;
  document.getElementById('reason').value = lr.reason;
  document.getElementById('status').value = lr.status;
  document.getElementById('approved_by').value = lr.approved_by;
  new bootstrap.Modal(document.getElementById('leaveRequestModal')).show();
}

function viewLeaveRequest(lr) {
  const body = document.getElementById('view-leave-request-body');
  body.innerHTML = `
    <p><strong>Employee:</strong> ${lr.user_name}</p>
    <p><strong>Leave Type:</strong> ${lr.leave_type_name}</p>
    <p><strong>Start:</strong> ${lr.start_date}</p>
    <p><strong>End:</strong> ${lr.end_date}</p>
    <p><strong>Status:</strong> ${lr.status}</p>
    <p><strong>Reason:</strong> ${lr.reason}</p>
    <p><strong>Approved By:</strong> ${lr.approved_by || 'N/A'}</p>
  `;
  new bootstrap.Modal(document.getElementById('viewLeaveRequestModal')).show();
}

async function deleteLeaveRequest(id) {
  if (confirm('Delete this leave request?')) {
    try {
      await fetchWithAuth(`${API_BASE}/api/leave_requests/${id}`, { method: 'DELETE' });
      await loadLeaveRequests();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }
}
