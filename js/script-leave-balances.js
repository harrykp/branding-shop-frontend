// script-leave-balances.js

// Load dropdowns and initialize

document.addEventListener('DOMContentLoaded', async () => {
  await populateSelect('users/options', 'user_id');
  await populateSelect('leave-types', 'leave_type_id');
  document.getElementById('searchInput').value = '';
  await loadLeaveBalances();

  document.getElementById('leaveBalanceForm').addEventListener('submit', submitLeaveBalanceForm);

  document.getElementById('searchInput').addEventListener('input', () => {
    loadLeaveBalances(1);
  });
});

function formatNumber(n) {
  return n !== undefined ? parseFloat(n).toFixed(2) : '-';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadLeaveBalances(page = 1) {
  const search = document.getElementById('searchInput')?.value || '';
  const tbody = document.getElementById('leave-balance-table-body');

  try {
    const res = await fetchWithAuth(`${API_BASE}/api/leave-balances?page=${page}&search=${search}`);
    const result = await res.json();
    const data = result.data || [];
    const total = result.total || 0;

    console.log('Leave Balances Data:', data);

    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No leave balances found</td></tr>';
      return;
    }

    data.forEach(lb => {
      const remaining = parseFloat(lb.allocated_days) - parseFloat(lb.used_days);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="d-none">${lb.id}</td>
        <td>${lb.employee_name || '-'}</td>
        <td>${lb.leave_type_name || '-'}</td>
        <td>${lb.year}</td>
        <td>${formatNumber(lb.allocated_days)}</td>
        <td>${formatNumber(lb.used_days)}</td>
        <td>${formatNumber(remaining)}</td>
        <td>
          <button class="btn btn-sm btn-info me-1" onclick="viewLeaveBalance(${lb.id})">View</button>
          <button class="btn btn-sm btn-primary me-1" onclick="editLeaveBalance(${lb.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteLeaveBalance(${lb.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination('leave-balance-pagination', total, page, loadLeaveBalances);
  } catch (err) {
    console.error('Failed to load leave balances:', err);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading leave balances: ${err.message}</td></tr>`;
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
    const response = await fetchWithAuth(`${API_BASE}/api/leave-balances/${id}`);
    const data = await response.json();

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
    const response = await fetchWithAuth(`${API_BASE}/api/leave-balances/${id}`);
    const data = await response.json();
    const remaining = parseFloat(data.allocated_days) - parseFloat(data.used_days);

    const modal = document.getElementById('viewLeaveBalanceModal');
    modal.querySelector('.modal-body').innerHTML = `
      <p><strong>User:</strong> ${data.employee_name}</p>
      <p><strong>Leave Type:</strong> ${data.leave_type_name}</p>
      <p><strong>Year:</strong> ${data.year}</p>
      <p><strong>Allocated:</strong> ${formatNumber(data.allocated_days)}</p>
      <p><strong>Used:</strong> ${formatNumber(data.used_days)}</p>
      <p><strong>Remaining:</strong> ${formatNumber(remaining)}</p>
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
