// js/script-payrolls.js

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
    const result = await res.json();
    const data = result.data || [];
    const total = result.total || 0;

    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center">No payroll records found</td></tr>';
      return;
    }

    data.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.employee_name}</td>
        <td>${formatDate(p.period_start)} - ${formatDate(p.period_end)}</td>
        <td>${p.gross_salary}</td>
        <td>${p.bonuses}</td>
        <td>${p.ssnit}</td>
        <td>${p.paye}</td>
        <td>${p.deductions}</td>
        <td>${p.net_salary}</td>
        <td>${p.paid_on ? formatDate(p.paid_on) : '-'}</td>
        <td>${p.status}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewPayroll(${p.id})">View</button>
          <button class="btn btn-sm btn-primary" onclick="editPayroll(${p.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deletePayroll(${p.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination('payroll-pagination', total, page, loadPayrolls);
  } catch (err) {
    console.error('Failed to load payrolls:', err);
    tbody.innerHTML = `<tr><td colspan="11" class="text-danger text-center">Error loading data</td></tr>`;
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
    gross_salary: form.gross_salary.value,
    bonuses: form.bonuses.value,
    ssnit: form.ssnit.value,
    paye: form.paye.value,
    deductions: form.deductions.value,
    net_salary: form.net_salary.value,
    paid_on: form.paid_on.value,
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

window.editPayroll = async function (id) {
  try {
    const data = await fetchWithAuth(`${API_BASE}/api/payrolls/${id}`).then(r => r.json());
    const form = document.getElementById('payrollForm');
    form.payroll_id.value = data.id;
    form.user_id.value = data.user_id;
    form.period_start.value = data.period_start;
    form.period_end.value = data.period_end;
    form.gross_salary.value = data.gross_salary;
    form.bonuses.value = data.bonuses;
    form.ssnit.value = data.ssnit;
    form.paye.value = data.paye;
    form.deductions.value = data.deductions;
    form.net_salary.value = data.net_salary;
    form.paid_on.value = data.paid_on;
    form.status.value = data.status;
    form.notes.value = data.notes;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('payrollModal')).show();
  } catch (err) {
    console.error('Failed to load payroll for editing:', err);
  }
};

window.viewPayroll = async function (id) {
  try {
    const data = await fetchWithAuth(`${API_BASE}/api/payrolls/${id}`).then(r => r.json());
    const container = document.getElementById('view-payroll-body');
    container.innerHTML = `
      <p><strong>Employee:</strong> ${data.employee_name}</p>
      <p><strong>Period:</strong> ${formatDate(data.period_start)} to ${formatDate(data.period_end)}</p>
      <p><strong>Gross:</strong> ${data.gross_salary}</p>
      <p><strong>Bonuses:</strong> ${data.bonuses}</p>
      <p><strong>SSNIT:</strong> ${data.ssnit}</p>
      <p><strong>PAYE:</strong> ${data.paye}</p>
      <p><strong>Deductions:</strong> ${data.deductions}</p>
      <p><strong>Net:</strong> ${data.net_salary}</p>
      <p><strong>Paid On:</strong> ${data.paid_on ? formatDate(data.paid_on) : '-'}</p>
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
