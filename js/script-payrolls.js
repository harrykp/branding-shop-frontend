// === script-payrolls.js ===

document.addEventListener('DOMContentLoaded', async () => {
  await populateSelect('users/options', 'user_id');
  loadPayrolls();
  document.getElementById('payrollForm').addEventListener('submit', submitPayrollForm);
});

async function loadPayrolls(page = 1) {
  const search = document.getElementById('searchInput')?.value || '';
  const tbody = document.getElementById('payroll-table-body');
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/payrolls?page=${page}&search=${search}`);
    const data = res.data || [];
    const total = res.total || 0;

    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center">No payroll records found</td></tr>';
      return;
    }

    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.employee_name || '-'}</td>
        <td>${formatDate(row.period_start)} - ${formatDate(row.period_end)}</td>
        <td>${row.gross_pay}</td>
        <td>${row.bonuses}</td>
        <td>${row.ssnit}</td>
        <td>${row.paye}</td>
        <td>${row.deductions}</td>
        <td>${row.net_pay}</td>
        <td>${formatDate(row.payment_date)}</td>
        <td>${row.status}</td>
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
    tbody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Error loading data</td></tr>`;
  }
}

async function submitPayrollForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.payroll_id.value;
  const payload = {
    user_id: form.user_id.value,
    period_start: form.period_start.value,
    period_end: form.period_end.value,
    gross_pay: form.gross_pay.value,
    bonuses: form.bonuses.value,
    ssnit: form.ssnit.value,
    paye: form.paye.value,
    deductions: form.deductions.value,
    net_pay: form.net_pay.value,
    payment_date: form.payment_date.value,
    status: form.status.value,
    notes: form.notes.value
  };

  try {
    const method = id ? 'PUT' : 'POST';
    const url = `${API_BASE}/api/payrolls${id ? `/${id}` : ''}`;
    await fetchWithAuth(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('payrollModal')).hide();
    form.reset();
    loadPayrolls();
  } catch (err) {
    console.error('Failed to save payroll:', err);
  }
}

window.editPayroll = async function (id) {
  try {
    const data = await fetchWithAuth(`${API_BASE}/api/payrolls/${id}`);
    const form = document.getElementById('payrollForm');
    form.payroll_id.value = data.id;
    form.user_id.value = data.user_id;
    form.period_start.value = data.period_start;
    form.period_end.value = data.period_end;
    form.gross_pay.value = data.gross_pay;
    form.bonuses.value = data.bonuses;
    form.ssnit.value = data.ssnit;
    form.paye.value = data.paye;
    form.deductions.value = data.deductions;
    form.net_pay.value = data.net_pay;
    form.payment_date.value = data.payment_date;
    form.status.value = data.status;
    form.notes.value = data.notes;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('payrollModal')).show();
  } catch (err) {
    console.error('Failed to load payroll for editing:', err);
  }
};

window.viewPayroll = async function (id) {
  try {
    const data = await fetchWithAuth(`${API_BASE}/api/payrolls/${id}`);
    const body = document.getElementById('view-payroll-body');
    body.innerHTML = `
      <p><strong>Employee:</strong> ${data.employee_name}</p>
      <p><strong>Period:</strong> ${formatDate(data.period_start)} - ${formatDate(data.period_end)}</p>
      <p><strong>Gross Pay:</strong> ${data.gross_pay}</p>
      <p><strong>Bonuses:</strong> ${data.bonuses}</p>
      <p><strong>SSNIT:</strong> ${data.ssnit}</p>
      <p><strong>PAYE:</strong> ${data.paye}</p>
      <p><strong>Deductions:</strong> ${data.deductions}</p>
      <p><strong>Net Pay:</strong> ${data.net_pay}</p>
      <p><strong>Paid On:</strong> ${formatDate(data.payment_date)}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Notes:</strong> ${data.notes}</p>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('viewPayrollModal')).show();
  } catch (err) {
    console.error('Failed to view payroll:', err);
  }
};

window.deletePayroll = async function (id) {
  if (!confirm('Delete this payroll record?')) return;
  try {
    await fetchWithAuth(`${API_BASE}/api/payrolls/${id}`, { method: 'DELETE' });
    loadPayrolls();
  } catch (err) {
    console.error('Failed to delete payroll:', err);
  }
};
