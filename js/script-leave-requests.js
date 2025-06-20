document.addEventListener('DOMContentLoaded', async () => {
  await populateSelect('users/options', 'user_id');
  await populateSelect('leave-types', 'leave_type_id');
  await populateSelect('users/options', 'approved_by');
  document.getElementById('searchInput').value = '';
  await loadLeaveRequests();

  document.getElementById('leaveRequestForm').addEventListener('submit', submitLeaveRequestForm);

  // ✅ Add search listener here
  document.getElementById('searchInput').addEventListener('input', () => {
    loadLeaveRequests(1);
  });
});

// ✅ Date formatting helper
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}


async function loadLeaveRequests(page = 1) {
  const searchBox = document.getElementById('searchInput');
  const search = searchBox && searchBox.value.trim() !== '' ? searchBox.value.trim() : '';
  const url = `${API_BASE}/api/leave-requests?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

  const tbody = document.getElementById('leave-request-table-body');
  if (!tbody) return;

  try {
    const response = await fetchWithAuth(url);
    const result = await response.json();
    const data = Array.isArray(result) ? result : Array.isArray(result.data) ? result.data : [];
    const total = result.total || 0;

    console.log('Leave Requests Result:', result);
    console.log('Parsed Leave Requests Data:', data);

    tbody.innerHTML = '';
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No leave requests found</td></tr>';
      return;
    }
    
    data.forEach(lr => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="d-none">${lr.id}</td>
        <td>${lr.user_name || '-'}</td>
        <td>${lr.leave_type_name || '-'}</td>
        <td>${formatDate(lr.start_date)}</td>
        <td>${formatDate(lr.end_date)}</td>
        <td>${lr.status || '-'}</td>
        <td>${lr.approved_by_name || '-'}</td>
        <td>
          <button class="btn btn-sm btn-info me-1" onclick="viewLeaveRequest(${lr.id})">View</button>
          <button class="btn btn-sm btn-primary me-1" onclick="editLeaveRequest(${lr.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteLeaveRequest(${lr.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination('leave-request-pagination', total, page, loadLeaveRequests);
  } catch (err) {
    console.error('Failed to load leave requests:', err);
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error loading leave requests: ${err.message}</td></tr>`;
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
    status: form.status.value,
    approved_by: form.approved_by?.value || null
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
    await loadLeaveRequests();
  } catch (err) {
    console.error('Failed to submit leave request:', err);
  }
}

window.editLeaveRequest = async function (id) {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/leave-requests/${id}`);
    const data = await response.json();

    const form = document.getElementById('leaveRequestForm');
    form.leave_request_id.value = data.id;
    form.user_id.value = data.user_id;
    form.leave_type_id.value = data.leave_type_id;
    form.start_date.value = data.start_date;
    form.end_date.value = data.end_date;
    form.reason.value = data.reason;
    form.status.value = data.status;
    if (form.approved_by) form.approved_by.value = data.approved_by || '';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('leaveRequestModal')).show();
  } catch (err) {
    console.error('Failed to load leave request for editing:', err);
  }
};

window.viewLeaveRequest = async function (id) {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/leave-requests/${id}`);
    const data = await response.json();

    const modal = document.getElementById('viewLeaveRequestModal');
    const body = modal.querySelector('.modal-body');

    body.innerHTML = `
      <p><strong>User:</strong> ${data.user_name}</p>
      <p><strong>Leave Type:</strong> ${data.leave_type_name}</p>
      <p><strong>Start Date:</strong> ${data.start_date}</p>
      <p><strong>End Date:</strong> ${data.end_date}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Approved By:</strong> ${data.approved_by_name || '-'}</p>
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
    await loadLeaveRequests();
  } catch (err) {
    console.error('Failed to delete leave request:', err);
  }
};

