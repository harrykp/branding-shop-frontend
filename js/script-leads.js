// /js/script-leads.js

let leads = [];
let currentPage = 1;
let leadModal;

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  leadModal = new bootstrap.Modal(document.getElementById('leadModal'));
  await loadLeads();
  await populateSelect('industries', 'leadIndustry');
  await populateSelect('referral_sources', 'leadReferralSource');
  await populateSelect('product_categories', 'leadInterests', true);
});

document.getElementById('leadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('leadId').value;
  const payload = {
    name: document.getElementById('leadName').value,
    email: document.getElementById('leadEmail').value,
    phone: document.getElementById('leadPhone').value,
    website_url: document.getElementById('leadWebsite').value,
    company: document.getElementById('leadCompany').value,
    position: document.getElementById('leadPosition').value,
    industry_id: document.getElementById('leadIndustry').value || null,
    referral_source_id: document.getElementById('leadReferralSource').value || null,
    priority: document.getElementById('leadPriority').value,
    converted: document.getElementById('leadConverted').value === 'true',
    last_contacted_at: document.getElementById('leadLastContacted').value,
    next_follow_up_at: document.getElementById('leadNextFollowUp').value,
    notes: document.getElementById('leadNotes').value,
    interests: Array.from(document.getElementById('leadInterests').selectedOptions).map(opt => opt.value)
  };

  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/leads/${id}` : '/api/leads';
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    leadModal.hide();
    loadLeads();
  } catch (err) {
    console.error('Failed to save lead:', err);
  }
});

async function loadLeads(page = 1) {
  currentPage = page;
  const search = document.getElementById('searchInput').value || '';
  try {
    const res = await fetchWithAuth(`/api/leads?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
    const { data, total } = await res.json();
    leads = data;
    renderLeads();
    renderPagination(total, 'pagination', loadLeads);
  } catch (err) {
    console.error('Error loading leads:', err);
  }
}

function renderLeads() {
  const tbody = document.getElementById('leadsTableBody');
  tbody.innerHTML = '';
  leads.forEach(lead => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${lead.name}</td>
      <td>${lead.email || ''}</td>
      <td>${lead.phone || ''}</td>
      <td>${lead.company || ''}</td>
      <td>${lead.industry_name || ''}</td>
      <td>${lead.referral_source_name || ''}</td>
      <td>${lead.converted ? 'Yes' : 'No'}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick='viewLead(${JSON.stringify(lead)})'>View</button>
        <button class="btn btn-sm btn-primary" onclick='editLead(${JSON.stringify(lead)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick='deleteLead(${lead.id})'>Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.editLead = function(lead) {
  document.getElementById('leadId').value = lead.id;
  document.getElementById('leadName').value = lead.name || '';
  document.getElementById('leadEmail').value = lead.email || '';
  document.getElementById('leadPhone').value = lead.phone || '';
  document.getElementById('leadWebsite').value = lead.website_url || '';
  document.getElementById('leadCompany').value = lead.company || '';
  document.getElementById('leadPosition').value = lead.position || '';
  document.getElementById('leadIndustry').value = lead.industry_id || '';
  document.getElementById('leadReferralSource').value = lead.referral_source_id || '';
  document.getElementById('leadPriority').value = lead.priority || 'normal';
  document.getElementById('leadConverted').value = lead.converted ? 'true' : 'false';
  document.getElementById('leadLastContacted').value = lead.last_contacted_at?.substring(0, 10) || '';
  document.getElementById('leadNextFollowUp').value = lead.next_follow_up_at?.substring(0, 10) || '';
  document.getElementById('leadNotes').value = lead.notes || '';

  const interestSelect = document.getElementById('leadInterests');
  Array.from(interestSelect.options).forEach(opt => {
    opt.selected = lead.interests?.includes(parseInt(opt.value)) || false;
  });

  leadModal.show();
}

window.viewLead = function(lead) {
  alert(`Lead: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone}`);
}

window.deleteLead = async function(id) {
  if (!confirm('Delete this lead?')) return;
  try {
    await fetchWithAuth(`/api/leads/${id}`, { method: 'DELETE' });
    loadLeads();
  } catch (err) {
    console.error('Failed to delete lead:', err);
  }
}

document.getElementById('searchInput').addEventListener('input', () => loadLeads(1));
