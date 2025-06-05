// ✅ FILE: js/script-leads.js
document.addEventListener('DOMContentLoaded', async () => {
  await requireLogin();
  populateSelect('referral_source_id', 'referral-sources');
  populateSelect('industry_id', 'industries');
  populateSelect('interested_in', 'product-categories', true);
  fetchLeads();

  document.getElementById('searchInput').addEventListener('input', fetchLeads);
  document.getElementById('leadForm').addEventListener('submit', handleLeadSubmit);
});

async function fetchLeads() {
  const search = document.getElementById('searchInput').value;
  const { data, total } = await fetchWithAuth(`/api/leads?search=${encodeURIComponent(search)}&page=1&limit=10`);
  renderLeads(data);
  renderPagination(total, 1, 10, fetchLeads);
}

function renderLeads(leads) {
  const tbody = document.getElementById('lead-table-body');
  tbody.innerHTML = '';
  leads.forEach(lead => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${lead.name}</td>
      <td>${lead.email}</td>
      <td>${lead.phone}</td>
      <td>${lead.company}</td>
      <td>${lead.industry_name || ''}</td>
      <td>${lead.referral_source_name || ''}</td>
      <td>${lead.interested_in.map(i => i.name).join(', ')}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick='editLead(${JSON.stringify(lead)})'>Edit</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.editLead = (lead) => {
  document.getElementById('lead-id').value = lead.id;
  document.getElementById('name').value = lead.name;
  document.getElementById('email').value = lead.email;
  document.getElementById('phone').value = lead.phone;
  document.getElementById('company').value = lead.company;
  document.getElementById('industry_id').value = lead.industry_id || '';
  document.getElementById('referral_source_id').value = lead.referral_source_id || '';

  const multi = document.getElementById('interested_in');
  [...multi.options].forEach(option => {
    option.selected = lead.interested_in.some(cat => cat.id == option.value);
  });

  new bootstrap.Modal(document.getElementById('leadModal')).show();
};

async function handleLeadSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('lead-id').value;
  const payload = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    company: document.getElementById('company').value,
    industry_id: document.getElementById('industry_id').value || null,
    referral_source_id: document.getElementById('referral_source_id').value || null,
    interested_in: [...document.getElementById('interested_in').selectedOptions].map(o => o.value)
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/leads/${id}` : '/api/leads';
  await fetchWithAuth(url, { method, body: JSON.stringify(payload) });
  bootstrap.Modal.getInstance(document.getElementById('leadModal')).hide();
  fetchLeads();
  document.getElementById('leadForm').reset();
}
