document.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await populateSelect('user_id', 'users/options');
  await populateSelect('leave_type_id', 'leave-types');
  loadLeaveBalances();

  document.getElementById('leaveBalanceForm').addEventListener('submit', submitLeaveBalanceForm);
});

async function loadLeaveBalances(page = 1) {
  const search = document.getElementById('searchInput')?.value || '';
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave-balances?page=${page}&search=${search}`);
    const data = Array.isArray(res) ? res : res.data || [];
    const totalPages = res.totalPages || 1;

    const tbody = document.getElementById('leave-balances-table-body');
    tbody.innerHTML = '';

    data.forEach(lb => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="d-none">${lb.id}</td>
        <td>${lb.user_name || '-'}</td>
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

    renderPagination('leave-balance-pagination', totalPages, page, loadLeaveBalances);
  } catch (err) {
    console.error('Failed to load leave balances:', err);
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
    loadLeaveBalances();
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
    modal.querySelector('.modal-body').innerHTML = `
      <p><strong>User:</strong> ${data.user_name}</p>
      <p><strong>Leave Type:</strong> ${data.leave_type_name}</p>
      <p><strong>Year:</strong> ${data.year}</p>
      <p><strong>Allocated Days:</strong> ${data.allocated_days}</p>
      <p><strong>Used Days:</strong> ${data.used_days}</p>
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
    loadLeaveBalances();
  } catch (err) {
    console.error('Failed to delete leave balance:', err);
  }
};
