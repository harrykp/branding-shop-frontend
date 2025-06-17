// script-bonuses.js

document.addEventListener('DOMContentLoaded', async () => {
  await populateSelect('users/options', 'user_id');
  await populateSelect('users/options', 'awarded_by');
  document.getElementById('searchInput').value = '';
  await loadBonuses();

  document.getElementById('bonusForm').addEventListener('submit', submitBonusForm);
  document.getElementById('searchInput').addEventListener('input', () => loadBonuses(1));
});

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function formatNumber(n) {
  return n !== undefined ? parseFloat(n).toFixed(2) : '-';
}

async function loadBonuses(page = 1) {
  const search = document.getElementById('searchInput')?.value || '';
  const tbody = document.getElementById('bonus-table-body');

  try {
    const response = await fetchWithAuth(`${API_BASE}/api/bonuses?page=${page}&search=${encodeURIComponent(search)}`);
    const result = await response.json();
    const data = result.data || [];
    const total = result.total || 0;

    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No bonuses found</td></tr>';
      return;
    }

    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.user_name || '-'}</td>
        <td>${formatNumber(row.amount)}</td>
        <td>${row.reason || '-'}</td>
        <td>${row.awarded_by_name || '-'}</td>
        <td>${formatDate(row.awarded_date)}</td>
        <td>${row.notes || '-'}</td>
        <td>
          <button class="btn btn-sm btn-info me-1" onclick="viewBonus(${row.id})">View</button>
          <button class="btn btn-sm btn-primary me-1" onclick="editBonus(${row.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteBonus(${row.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination('bonus-pagination', total, page, loadBonuses);
  } catch (err) {
    console.error('Failed to load bonuses:', err);
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${err.message}</td></tr>`;
  }
}

async function submitBonusForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.bonus_id.value;

  const payload = {
    user_id: form.user_id.value,
    amount: form.amount.value,
    reason: form.reason.value,
    awarded_by: form.awarded_by.value,
    awarded_date: form.awarded_date.value,
    notes: form.notes.value
  };

  try {
    const url = `${API_BASE}/api/bonuses${id ? `/${id}` : ''}`;
    const method = id ? 'PUT' : 'POST';

    await fetchWithAuth(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('bonusModal')).hide();
    form.reset();
    await loadBonuses();
  } catch (err) {
    console.error('Failed to submit bonus:', err);
  }
}

window.editBonus = async function (id) {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/bonuses/${id}`);
    const data = await response.json();
    const form = document.getElementById('bonusForm');

    form.bonus_id.value = data.id;
    form.user_id.value = data.user_id;
    form.amount.value = data.amount;
    form.reason.value = data.reason;
    form.awarded_by.value = data.awarded_by;
    form.awarded_date.value = data.awarded_date;
    form.notes.value = data.notes;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('bonusModal')).show();
  } catch (err) {
    console.error('Failed to load bonus for editing:', err);
  }
};

window.viewBonus = async function (id) {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/bonuses/${id}`);
    const data = await response.json();
    const modal = document.getElementById('viewBonusModal');
    const body = modal.querySelector('.modal-body');

    body.innerHTML = `
      <p><strong>User:</strong> ${data.user_name}</p>
      <p><strong>Amount:</strong> ${formatNumber(data.amount)}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p><strong>Awarded By:</strong> ${data.awarded_by_name}</p>
      <p><strong>Awarded Date:</strong> ${formatDate(data.awarded_date)}</p>
      <p><strong>Notes:</strong> ${data.notes || '-'}</p>
    `;
    bootstrap.Modal.getOrCreateInstance(modal).show();
  } catch (err) {
    console.error('Failed to view bonus:', err);
  }
};

window.deleteBonus = async function (id) {
  if (!confirm('Delete this bonus?')) return;
  try {
    await fetchWithAuth(`${API_BASE}/api/bonuses/${id}`, { method: 'DELETE' });
    await loadBonuses();
  } catch (err) {
    console.error('Failed to delete bonus:', err);
  }
};
