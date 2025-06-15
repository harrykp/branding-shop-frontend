// script-leave-balances.js

document.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await loadLeaveBalances();
  await populateSelect('user_id', '/api/users');
  await populateSelect('leave_type_id', '/api/leave-types');

  document.getElementById('leaveBalanceForm')?.addEventListener('submit', saveLeaveBalance);
});

async function loadLeaveBalances(page = 1) {
  const search = document.getElementById('searchInput')?.value || '';
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave_balances?page=${page}&search=${search}`);
    const { data, total } = await res.json();
    const tbody = document.getElementById('leave-balance-table-body');
    tbody.innerHTML = '';

    data.forEach(lb => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${lb.user_name}</td>
        <td>${lb.leave_type_name}</td>
        <td>${lb.allocated_days}</td>
        <td>${lb.used_days}</td>
        <td>${lb.remaining_days}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick='viewLeaveBalance(${JSON.stringify(lb)})'>View</button>
          <button class="btn btn-sm btn-primary" onclick='editLeaveBalance(${JSON.stringify(lb)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteLeaveBalance(${lb.id})'>Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
    renderPagination(total, page, loadLeaveBalances);
  } catch (err) {
    console.error('Failed to load leave balances:', err);
  }
}

async function saveLeaveBalance(e) {
  e.preventDefault();
  const id = document.getElementById('leave_balance_id').value;
  const payload = {
    user_id: document.getElementById('user_id').value,
    leave_type_id: document.getElementById('leave_type_id').value,
    allocated_days: document.getElementById('allocated_days').value,
    used_days: document.getElementById('used_days').value,
    remaining_days: document.getElementById('remaining_days').value
  };

  try {
    const url = `${API_BASE}/api/leave_balances${id ? `/${id}` : ''}`;
    const method = id ? 'PUT' : 'POST';
    await fetchWithAuth(url, { method, body: JSON.stringify(payload) });
    bootstrap.Modal.getOrCreateInstance(document.getElementById('leaveBalanceModal')).hide();
    await loadLeaveBalances();
  } catch (err) {
    console.error('Save failed:', err);
  }
}

function editLeaveBalance(lb) {
  document.getElementById('leave_balance_id').value = lb.id;
  document.getElementById('user_id').value = lb.user_id;
  document.getElementById('leave_type_id').value = lb.leave_type_id;
  document.getElementById('allocated_days').value = lb.allocated_days;
  document.getElementById('used_days').value = lb.used_days;
  document.getElementById('remaining_days').value = lb.remaining_days;
  new bootstrap.Modal(document.getElementById('leaveBalanceModal')).show();
}

function viewLeaveBalance(lb) {
  const body = document.getElementById('view-leave-balance-body');
  body.innerHTML = `
    <p><strong>Employee:</strong> ${lb.user_name}</p>
    <p><strong>Leave Type:</strong> ${lb.leave_type_name}</p>
    <p><strong>Allocated:</strong> ${lb.allocated_days} days</p>
    <p><strong>Used:</strong> ${lb.used_days} days</p>
    <p><strong>Remaining:</strong> ${lb.remaining_days} days</p>
  `;
  new bootstrap.Modal(document.getElementById('viewLeaveBalanceModal')).show();
}

async function deleteLeaveBalance(id) {
  if (confirm('Delete this leave balance?')) {
    try {
      await fetchWithAuth(`${API_BASE}/api/leave_balances/${id}`, { method: 'DELETE' });
      await loadLeaveBalances();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }
}
