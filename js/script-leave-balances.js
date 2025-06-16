document.addEventListener('DOMContentLoaded', async () => {
  await populateSelect('users/options', 'user_id');
  await populateSelect('leave-types', 'leave_type_id');
  document.getElementById('searchInput').value = '';
  await loadLeaveBalances();

  document.getElementById('leaveBalanceForm').addEventListener('submit', submitLeaveBalanceForm);
});

async function loadLeaveBalances(page = 1) {
  const searchBox = document.getElementById('searchInput');
  const search = searchBox && searchBox.value.trim() !== '' ? searchBox.value.trim() : '';
  const url = `${API_BASE}/api/leave-balances?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

  const tbody = document.getElementById('leave-balance-table-body');
  if (!tbody) return;

  try {
    const res = await fetchWithAuth(url);
    const data = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
    const total = res.total || 1;

    console.log('Leave Balances Response:', res);
    console.log('Parsed Leave Balances Data:', data);

    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No leave balances found</td></tr>';
      return;
    }

    data.forEach(lb => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="d-none">${lb.id}</td>
        <td>${lb.employee_name || '-'}</td>
        <td>${lb.leave_type_name || '-'}</td>
        <td>${lb.year}</td>
        <td>${lb.allocated_days}</td>
        <td>${lb.used_days}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewLeaveBalance(${lb.id})">View</button>
          <button class="btn btn-sm btn-primary" onclick="editLeaveBalance(${lb.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteLeaveBalance(${lb.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination('leave-balance-pagination', total, page, loadLeaveBalances);
  } catch (err) {
    console.error('Failed to load leave balances:', err);
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error loading leave balances: ${err.message}</td></tr>`;
  }
}

async function submitLeaveBalanceForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.leave_balance_id.value;

  const payload = {
    user_id: form.user_id.value,
    leave_type_id: form.leave_type_id.value,
    year: form.year.value,
    allocated_days: form.allocated_days.value,
    used_days: form.used_days.value
  };

  try {
    const url = `${API_BASE}/api/leave-balances${id ? `/${id}` : ''}`;
    const method = id ? 'PUT' : 'POST';

    await fetchWithAuth(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('leaveBalanceModal')).hide();
    form.reset();
    await loadLeaveBalances();
  } catch (err) {
    console.error('Failed to submit leave balance:', err);
  }
}

window.editLeaveBalance = async function (id) {
  try {
    const data = await fetchWithAuth(`${API_BASE}/api/leave-balances/${id}`);
    const form = document.getElementById('leaveBalanceForm');

    form.leave_balance_id.value = data.id;
    form.user_id.value = data.user_id;
    form.leave_type_id.value = data.leave_type_id;
    form.year.value = data.year;
    form.allocated_days.value = data.allocated_days;
    form.used_days.value = data.used_days;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('leaveBalanceModal')).show();
  } catch (err) {
    console.error('Failed to load leave balance for editing:', err);
  }
};

window.viewLeaveBalance = async function (id) {
  try {
    const data = await fetchWithAuth(`${API_BASE}/api/leave-balances/${id}`);
    const modal = document.getElementById('viewLeaveBalanceModal');
    const body = modal.querySelector('.modal-body');

    body.innerHTML = `
      <p><strong>User:</strong> ${data.employee_name}</p>
      <p><strong>Leave Type:</strong> ${data.leave_type_name}</p>
      <p><strong>Year:</strong> ${data.year}</p>
      <p><strong>Allocated Days:</strong> ${data.allocated_days}</p>
      <p><strong>Used Days:</strong> ${data.used_days}</p>
      <p><strong>Remaining Days:</strong> ${data.remaining_days}</p>
    `;

    bootstrap.Modal.getOrCreateInstance(modal).show();
  } catch (err) {
    console.error('Failed to view leave balance:', err);
  }
};

window.deleteLeaveBalance = async function (id) {
  if (!confirm('Delete this leave balance?')) return;
  try {
    await fetchWithAuth(`${API_BASE}/api/leave-balances/${id}`, { method: 'DELETE' });
    await loadLeaveBalances();
  } catch (err) {
    console.error('Failed to delete leave balance:', err);
  }
};
