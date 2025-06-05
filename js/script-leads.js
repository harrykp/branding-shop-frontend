// /js/script-leads.js

let currentPage = 1;
let leadModal;

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  leadModal = new bootstrap.Modal(document.getElementById('leadModal'));
  await populateSelect('industries', 'leadIndustry');
  await populateSelect('referral_sources', 'leadReferral');
  await populateSelect('product_categories', 'leadInterests', true);
  loadLeads();
});

document.getElementById('leadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('leadId').value;
  const payload = {
    name: document.getElementById('leadName').value,
    company: document.getElementById('leadCompany').value,
    position: document.getElementById('leadPosition').value,
    email: document.getElementById('leadEmail').value,
    phone: document.getElementById('leadPhone').value,
    website_url: document.getElementById('leadWebsite').value,
    industry_id: document.getElementById('leadIndustry').value,
    referral_source_id: document.getElementById('leadReferral').value,
    priority: document.getElementById('leadPriority').value,
    status: document.getElementById('leadStatus').value,
    last_contacted_at: document.getElementById('lastContacted').value,
    next_follow_up_at: document.getElementById('nextFollowUp').value,
    notes: document.getElementById('leadNotes').value,
    interests: Array.from(document.getElementById('leadInterests').selectedOptions).map(opt => opt.value)
  };

  try {
    const url = id ? `/api/leads/${id}` : '/api/leads';
    const method = id ? 'PUT' : 'POST';
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    leadModal.hide();
    loadLeads(currentPage);
  } catch (err) {
    console.error('Error saving lead:', err);
  }
});

async function loadLeads(page = 1) {
  currentPage = page;
  const search = document.getElementById('searchInput').value;
  try {
    const res = await fetchWithAuth(`/api/leads?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();

    const tbody = document.getElementById('leads-table-body');
    tbody.innerHTML = '';
    data.forEach(lead => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${lead.name}</td>
        <td>${lead.company || ''}</td>
        <td>${lead.email || ''}</td>
        <td>${lead.phone || ''}</td>
        <td>${lead.industry_name || ''}</td>
        <td>${lead.status || ''}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick='viewLead(${JSON.stringify(lead)})'>View</button>
          <button class="btn btn-sm btn-primary" onclick='editLead(${JSON.stringify(lead)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteLead(${lead.id})'>Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
    renderPagination(total, 'pagination', loadLeads);
  } catch (err) {
    console.error('Error loading leads:', err);
  }
}

window.editLead = function (lead) {
  document.getElementById('leadId').value = lead.id;
  document.getElementById('leadName').value = lead.name || '';
  document.getElementById('leadCompany').value = lead.company || '';
  document.getElementById('leadPosition').value = lead.position || '';
  document.getElementById('leadEmail').value = lead.email || '';
  document.getElementById('leadPhone').value = lead.phone || '';
  document.getElementById('leadWebsite').value = lead.website_url || '';
  document.getElementById('leadIndustry').value = lead.industry_id || '';
  document.getElementById('leadReferral').value = lead.referral_source_id || '';
  document.getElementById('leadPriority').value = lead.priority || '';
  document.getElementById('leadStatus').value = lead.status || '';
  document.getElementById('lastContacted').value = lead.last_contacted_at?.substring(0, 16) || '';
  document.getElementById('nextFollowUp').value = lead.next_follow_up_at?.substring(0, 16) || '';
  document.getElementById('leadNotes').value = lead.notes || '';

  const interestSelect = document.getElementById('leadInterests');
  Array.from(interestSelect.options).forEach(opt => {
    opt.selected = lead.interests?.includes(parseInt(opt.value)) || false;
  });

  leadModal.show();
};

window.viewLead = function (lead) {
  document.getElementById('viewLeadName').textContent = lead.name || '';
  document.getElementById('viewLeadCompany').textContent = lead.company || '';
  document.getElementById('viewLeadEmail').textContent = lead.email || '';
  document.getElementById('viewLeadPhone').textContent = lead.phone || '';
  document.getElementById('viewLeadIndustry').textContent = lead.industry_name || '';
  document.getElementById('viewLeadReferral').textContent = lead.referral_source_name || '';
  document.getElementById('viewLeadStatus').textContent = lead.status || '';
  document.getElementById('viewLeadPriority').textContent = lead.priority || '';
  document.getElementById('viewLeadConverted').textContent = lead.converted ? 'Yes' : 'No';
  document.getElementById('viewLeadNotes').textContent = lead.notes || '';
  new bootstrap.Modal(document.getElementById('viewLeadModal')).show();
};

window.deleteLead = async function (id) {
  if (!confirm('Delete this lead?')) return;
  try {
    await fetchWithAuth(`/api/leads/${id}`, { method: 'DELETE' });
    loadLeads(currentPage);
  } catch (err) {
    console.error('Failed to delete lead:', err);
  }
};

document.getElementById('searchInput').addEventListener('input', () => loadLeads(1));
