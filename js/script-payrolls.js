// script-payrolls.js

document.addEventListener('DOMContentLoaded', async () => {
  await populateSelect('users/options', 'user_id');
  document.getElementById('searchInput').value = '';
  await loadPayrolls();

  document.getElementById('payrollForm').addEventListener('submit', submitPayrollForm);
  document.getElementById('searchInput').addEventListener('input', () => loadPayrolls(1));
});

function formatCurrency(n) {
  return n ? parseFloat(n).toFixed(2) : '0.00';
}

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
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No payrolls found</td></tr>';
      return;
    }

    data.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.employee_name || '-'}</td>
        <td>${formatCurrency(p.gross_pay)}</td>
        <td>${formatCurrency(p.deductions)}</td>
        <td>${formatCurrency(p.net_pay)}</td>
        <td>${formatDate(p.pay_period_start)} - ${formatDate(p.pay_period_end)}</td>
        <td>${formatDate(p.payment_date)}</td>
        <td>
          <button class="btn btn-sm btn-info me-1" onclick="viewPayroll(${p.id})">View</button>
          <button class="btn btn-sm btn-primary me-1" onclick="editPayroll(${p.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deletePayroll(${p.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination('payroll-pagination', total, page, loadPayrolls);
  } catch (err) {
    console.error('Failed to load payrolls:', err);
    tbody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">${err.message}</td></tr>`;
  }
}

async function submitPayrollForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.payroll_id.value;

  const payload = {
    user_id: form.user_id.value,
    gross_pay: form.gross_pay.value,
    deductions: form.deductions.value,
    net_pay: form.net_pay.value,
    pay_period_start: form.pay_period_start.value,
    pay_period_end: form.pay_period_end.value,
    payment_date: form.payment_date.value,
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
    form.gross_pay.value = data.gross_pay;
    form.deductions.value = data.deductions;
    form.net_pay.value = data.net_pay;
    form.pay_period_start.value = data.pay_period_start;
    form.pay_period_end.value = data.pay_period_end;
    form.payment_date.value = data.payment_date;
    form.notes.value = data.notes;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('payrollModal')).show();
  } catch (err) {
    console.error('Failed to load payroll for editing:', err);
  }
};

window.viewPayroll = async function (id) {
  try {
    const p = await fetchWithAuth(`${API_BASE}/api/payrolls/${id}`).then(r => r.json());
    const modal = document.getElementById('viewPayrollModal');
    modal.querySelector('.modal-body').innerHTML = `
      <p><strong>Employee:</strong> ${p.employee_name}</p>
      <p><strong>Gross Pay:</strong> ${formatCurrency(p.gross_pay)}</p>
      <p><strong>Deductions:</strong> ${formatCurrency(p.deductions)}</p>
      <p><strong>Net Pay:</strong> ${formatCurrency(p.net_pay)}</p>
      <p><strong>Period:</strong> ${formatDate(p.pay_period_start)} – ${formatDate(p.pay_period_end)}</p>
      <p><strong>Payment Date:</strong> ${formatDate(p.payment_date)}</p>
      <p><strong>Notes:</strong> ${p.notes || '-'}</p>
    `;
    bootstrap.Modal.getOrCreateInstance(modal).show();
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
