let leadModal;
const tableBody = document.getElementById('leads-table-body');
const searchInput = document.getElementById('searchInput');
const leadForm = document.getElementById('leadForm');
let currentPage = 1;

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  leadModal = new bootstrap.Modal(document.getElementById('editLeadModal'));
  await populateSelect('industries', 'leadIndustry');
  await populateSelect('referral_sources', 'leadReferral');
  await populateSelect('product_categories', 'leadInterests');
  loadLeads();
});

searchInput.addEventListener('input', () => loadLeads(1));

async function loadLeads(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetchWithAuth(`/api/leads?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();
    tableBody.innerHTML = '';
    data.forEach(lead => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${lead.name}</td>
        <td>${lead.email || ''}</td>
        <td>${lead.phone || ''}</td>
        <td>${lead.industry_name || ''}</td>
        <td>${lead.referral_source_name || ''}</td>
        <td>${lead.status}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick='viewLead(${JSON.stringify(lead)})'>View</button>
          <button class="btn btn-sm btn-primary" onclick='editLead(${JSON.stringify(lead)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteLead(${lead.id})'>Delete</button>
        </td>`;
      tableBody.appendChild(tr);
    });
    renderPagination(total, 'pagination', loadLeads);
  } catch (err) {
    console.error('Error loading leads:', err);
  }
}

window.editLead = (lead) => {
  document.getElementById('leadId').value = lead.id;
  document.getElementById('leadName').value = lead.name;
  document.getElementById('leadEmail').value = lead.email || '';
  document.getElementById('leadPhone').value = lead.phone || '';
  document.getElementById('leadWebsite').value = lead.website_url || '';
  document.getElementById('leadIndustry').value = lead.industry_id || '';
  document.getElementById('leadReferral').value = lead.referral_source_id || '';
  document.getElementById('leadNotes').value = lead.notes || '';
  document.getElementById('leadStatus').value = lead.status || 'new';
  document.getElementById('leadPriority').value = lead.priority || 'low';
  document.getElementById('leadNextFollowUp').value = lead.next_follow_up_at?.split('T')[0] || '';

  const interests = document.getElementById('leadInterests');
  Array.from(interests.options).forEach(opt => opt.selected = (lead.interest_ids || []).includes(parseInt(opt.value)));

  leadModal.show();
};

window.viewLead = (lead) => {
  const body = document.getElementById('viewLeadBody');
  body.innerHTML = `
    <tr><td><strong>Name</strong></td><td>${lead.name}</td></tr>
    <tr><td><strong>Email</strong></td><td>${lead.email || ''}</td></tr>
    <tr><td><strong>Phone</strong></td><td>${lead.phone || ''}</td></tr>
    <tr><td><strong>Website</strong></td><td>${lead.website_url || ''}</td></tr>
    <tr><td><strong>Industry</strong></td><td>${lead.industry_name || ''}</td></tr>
    <tr><td><strong>Referral</strong></td><td>${lead.referral_source_name || ''}</td></tr>
    <tr><td><strong>Status</strong></td><td>${lead.status}</td></tr>
    <tr><td><strong>Priority</strong></td><td>${lead.priority}</td></tr>
    <tr><td><strong>Notes</strong></td><td>${lead.notes || ''}</td></tr>
    <tr><td><strong>Next Follow Up</strong></td><td>${lead.next_follow_up_at?.split('T')[0] || ''}</td></tr>
    <tr><td><strong>Interested In</strong></td><td>${(lead.interest_names || []).join(', ')}</td></tr>
  `;
  new bootstrap.Modal(document.getElementById('viewLeadModal')).show();
};

window.deleteLead = async (id) => {
  if (!confirm('Delete this lead?')) return;
  try {
    await fetchWithAuth(`/api/leads/${id}`, { method: 'DELETE' });
    loadLeads(currentPage);
  } catch (err) {
    console.error('Failed to delete lead:', err);
  }
};

leadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('leadId').value;
  const payload = {
    name: document.getElementById('leadName').value,
    email: document.getElementById('leadEmail').value,
    phone: document.getElementById('leadPhone').value,
    website_url: document.getElementById('leadWebsite').value,
    industry_id: document.getElementById('leadIndustry').value,
    referral_source_id: document.getElementById('leadReferral').value,
    notes: document.getElementById('leadNotes').value,
    status: document.getElementById('leadStatus').value,
    priority: document.getElementById('leadPriority').value,
    next_follow_up_at: document.getElementById('leadNextFollowUp').value,
    interest_ids: Array.from(document.getElementById('leadInterests').selectedOptions).map(opt => parseInt(opt.value))
  };
  try {
    const method = id ? 'PUT' : 'POST';
    const url = `/api/leads${id ? '/' + id : ''}`;
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    leadModal.hide();
    loadLeads(currentPage);
  } catch (err) {
    console.error('Failed to save lead:', err);
  }
});
