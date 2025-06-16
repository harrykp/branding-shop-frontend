document.addEventListener('DOMContentLoaded', async () => {
  await populateSelect('users/options', 'user_id');
  await populateSelect('leave-types', 'leave_type_id');
  await populateSelect('users/options', 'approved_by');
  loadLeaveRequests();

  document.getElementById('leaveRequestForm').addEventListener('submit', submitLeaveRequestForm);
});


async function loadLeaveRequests(page = 1) {
  const search = document.getElementById('searchInput')?.value || '';
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave-requests?page=${page}&search=${search}`);
    const data = Array.isArray(res) ? res : res.data || [];
    const totalPages = res.totalPages || res.total || 1;
    const tbody = document.getElementById('leave-request-table-body');
    tbody.innerHTML = '';

    data.forEach(lr => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="d-none">${lr.id}</td>
        <td>${lr.user_name || '-'}</td>
        <td>${lr.leave_type_name || '-'}</td>
        <td>${lr.start_date}</td>
        <td>${lr.end_date}</td>
        <td>${lr.status}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewLeaveRequest(${lr.id})">View</button>
          <button class="btn btn-sm btn-primary" onclick="editLeaveRequest(${lr.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteLeaveRequest(${lr.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination('leave-request-pagination', totalPages, page, loadLeaveRequests);
  } catch (err) {
    console.error('Failed to load leave requests:', err);
  }
}

async function submitLeaveRequestForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.leave_request_id.value;
  const payload = {
    user_id: form.user_id.value,
    leave_type_id: form.leave_type_id.value,
    start_date: form.start_date.value,
    end_date: form.end_date.value,
    reason: form.reason.value,
    status: form.status.value
  };

  try {
    const url = `${API_BASE}/api/leave-requests${id ? `/${id}` : ''}`;
    const method = id ? 'PUT' : 'POST';
    await fetchWithAuth(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('leaveRequestModal')).hide();
    form.reset();
    loadLeaveRequests();
  } catch (err) {
    console.error('Failed to submit leave request:', err);
  }
}

window.editLeaveRequest = async function (id) {
  try {
    const data = await fetchWithAuth(`${API_BASE}/api/leave-requests/${id}`);
    const form = document.getElementById('leaveRequestForm');
    form.leave_request_id.value = data.id;
    form.user_id.value = data.user_id;
    form.leave_type_id.value = data.leave_type_id;
    form.start_date.value = data.start_date;
    form.end_date.value = data.end_date;
    form.reason.value = data.reason;
    form.status.value = data.status;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('leaveRequestModal')).show();
  } catch (err) {
    console.error('Failed to load leave request for editing:', err);
  }
};

window.viewLeaveRequest = async function (id) {
  try {
    const data = await fetchWithAuth(`${API_BASE}/api/leave-requests/${id}`);
    const modal = document.getElementById('viewLeaveRequestModal');
    modal.querySelector('.modal-body').innerHTML = `
      <p><strong>User:</strong> ${data.user_name}</p>
      <p><strong>Leave Type:</strong> ${data.leave_type_name}</p>
      <p><strong>Start Date:</strong> ${data.start_date}</p>
      <p><strong>End Date:</strong> ${data.end_date}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p><strong>Status:</strong> ${data.status}</p>
    `;
    bootstrap.Modal.getOrCreateInstance(modal).show();
  } catch (err) {
    console.error('Failed to view leave request:', err);
  }
};

window.deleteLeaveRequest = async function (id) {
  if (!confirm('Delete this leave request?')) return;
  try {
    await fetchWithAuth(`${API_BASE}/api/leave-requests/${id}`, { method: 'DELETE' });
    loadLeaveRequests();
  } catch (err) {
    console.error('Failed to delete leave request:', err);
  }
};

