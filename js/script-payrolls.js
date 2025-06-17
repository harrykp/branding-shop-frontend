// === script-payrolls.js ===

// ✅ DOMContentLoaded
// Populate dropdowns, clear search, attach handlers

document.addEventListener('DOMContentLoaded', async () => {
  await populateSelect('users/options', 'user_id');
  document.getElementById('searchInput').value = '';
  await loadPayrolls();

  document.getElementById('payrollForm').addEventListener('submit', submitPayrollForm);

  // ✅ Search listener
  document.getElementById('searchInput').addEventListener('input', () => {
    loadPayrolls(1);
  });
});

// ✅ Format date to YYYY-MM-DD
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// ✅ Format number to 2 decimal places
function formatNumber(value) {
  if (value === null || value === undefined) return '-';
  return parseFloat(value).toFixed(2);
}

// ✅ Load Payrolls
async function loadPayrolls(page = 1) {
  const search = document.getElementById('searchInput')?.value || '';
  const tbody = document.getElementById('payroll-table-body');

  try {
    const res = await fetchWithAuth(`${API_BASE}/api/payrolls?page=${page}&search=${search}`);
    const data = Array.isArray(res) ? res : res.data || [];
    const total = res.total || 1;

    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center">No payroll records found</td></tr>';
      return;
    }

    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="d-none">${row.id}</td>
        <td>${row.employee_name || '-'}</td>
        <td>${formatDate(row.pay_period_start)} to ${formatDate(row.pay_period_end)}</td>
        <td>${formatNumber(row.gross_pay)}</td>
        <td>${formatNumber(row.bonuses)}</td>
        <td>${formatNumber(row.ssnit)}</td>
        <td>${formatNumber(row.paye)}</td>
        <td>${formatNumber(row.deductions)}</td>
        <td>${formatNumber(row.net_pay)}</td>
        <td>${formatDate(row.payment_date)}</td>
        <td>${row.status || '-'}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewPayroll(${row.id})">View</button>
          <button class="btn btn-sm btn-primary" onclick="editPayroll(${row.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deletePayroll(${row.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination('payroll-pagination', total, page, loadPayrolls);
  } catch (err) {
    console.error('Failed to load payrolls:', err);
    tbody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Error loading payrolls</td></tr>`;
  }
}

// ✅ Submit Form
async function submitPayrollForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.payroll_id.value;

  const payload = {
    user_id: form.user_id.value,
    gross_pay: form.gross_pay.value,
    bonuses: form.bonuses.value,
    ssnit: form.ssnit.value,
    paye: form.paye.value,
    deductions: form.deductions.value,
    net_pay: form.net_pay.value,
    pay_period_start: form.pay_period_start.value,
    pay_period_end: form.pay_period_end.value,
    payment_date: form.payment_date.value,
    status: form.status.value,
    notes: form.notes.value
  };

  try {
    const url = `${API_BASE}/api/payrolls${id ? `/${id}` : ''}`;
    const method = id ? 'PUT' : 'POST';

    await fetchWithAuth(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('payrollModal')).hide();
    form.reset();
    loadPayrolls();
  } catch (err) {
    console.error('Failed to submit payroll:', err);
  }
}

// ✅ View Payroll
window.viewPayroll = async function (id) {
  try {
    const data = await fetchWithAuth(`${API_BASE}/api/payrolls/${id}`);
    const modal = document.getElementById('viewPayrollModal');

    modal.querySelector('.modal-body').innerHTML = `
      <p><strong>Employee:</strong> ${data.employee_name}</p>
      <p><strong>Period:</strong> ${formatDate(data.pay_period_start)} to ${formatDate(data.pay_period_end)}</p>
      <p><strong>Gross Pay:</strong> ${formatNumber(data.gross_pay)}</p>
      <p><strong>Bonuses:</strong> ${formatNumber(data.bonuses)}</p>
      <p><strong>SSNIT:</strong> ${formatNumber(data.ssnit)}</p>
      <p><strong>PAYE:</strong> ${formatNumber(data.paye)}</p>
      <p><strong>Deductions:</strong> ${formatNumber(data.deductions)}</p>
      <p><strong>Net Pay:</strong> ${formatNumber(data.net_pay)}</p>
      <p><strong>Paid On:</strong> ${formatDate(data.payment_date)}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Notes:</strong> ${data.notes}</p>
    `;

    bootstrap.Modal.getOrCreateInstance(modal).show();
  } catch (err) {
    console.error('Failed to view payroll:', err);
  }
};

// ✅ Edit Payroll
window.editPayroll = async function (id) {
  try {
    const data = await fetchWithAuth(`${API_BASE}/api/payrolls/${id}`);
    const form = document.getElementById('payrollForm');

    form.payroll_id.value = data.id;
    form.user_id.value = data.user_id;
    form.gross_pay.value = data.gross_pay;
    form.bonuses.value = data.bonuses;
    form.ssnit.value = data.ssnit;
    form.paye.value = data.paye;
    form.deductions.value = data.deductions;
    form.net_pay.value = data.net_pay;
    form.pay_period_start.value = data.pay_period_start;
    form.pay_period_end.value = data.pay_period_end;
    form.payment_date.value = data.payment_date;
    form.status.value = data.status;
    form.notes.value = data.notes;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('payrollModal')).show();
  } catch (err) {
    console.error('Failed to load payroll for editing:', err);
  }
};

// ✅ Delete Payroll
window.deletePayroll = async function (id) {
  if (!confirm('Are you sure you want to delete this payroll record?')) return;

  try {
    await fetchWithAuth(`${API_BASE}/api/payrolls/${id}`, { method: 'DELETE' });
    loadPayrolls();
  } catch (err) {
    console.error('Failed to delete payroll:', err);
  }
};
