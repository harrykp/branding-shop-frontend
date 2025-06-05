// /js/script-leads.js

let leadModal;
const leadsTableBody = document.getElementById('leads-table-body');
const leadForm = document.getElementById('leadForm');
const searchInput = document.getElementById('searchInput');
let currentPage = 1;

function exportLeadsToCSV() {
  exportTableToCSV('leadsTable');
}

async function loadLeads(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetchWithAuth(`/api/leads?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();

    leadsTableBody.innerHTML = '';
    data.forEach(lead => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${lead.name}</td>
        <td>${lead.email || ''}</td>
        <td>${lead.phone || ''}</td>
        <td>${lead.company || ''}</td>
        <td>${lead.industry_name || ''}</td>
        <td>${lead.referral_source_name || ''}</td>
        <td>${lead.status || ''}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick='editLead(${JSON.stringify(lead)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteLead(${lead.id})'>Delete</button>
        </td>`;
      leadsTableBody.appendChild(tr);
    });

    renderPagination(total, 'pagination', loadLeads);
  } catch (err) {
    console.error('Failed to load leads:', err);
  }
}

window.editLead = async function (lead) {
  document.getElementById('leadId').value = lead.id;
  document.getElementById('name').value = lead.name;
  document.getElementById('email').value = lead.email || '';
  document.getElementById('phone').value = lead.phone || '';
  document.getElementById('website_url').value = lead.website_url || '';
  document.getElementById('company').value = lead.company || '';
  document.getElementById('position').value = lead.position || '';
  document.getElementById('industry_id').value = lead.industry_id || '';
  document.getElementById('referral_source_id').value = lead.referral_source_id || '';
  document.getElementById('priority').value = lead.priority || 'medium';
  document.getElementById('notes').value = lead.notes || '';
  document.getElementById('last_contacted_at').value = lead.last_contacted_at ? lead.last_contacted_at.substring(0, 10) : '';
  document.getElementById('next_follow_up_at').value = lead.next_follow_up_at ? lead.next_follow_up_at.substring(0, 10) : '';
  document.getElementById('status').value = lead.status || 'new';

  const interestSelect = document.getElementById('interests');
  Array.from(interestSelect.options).forEach(option => {
    option.selected = (lead.interests || []).includes(parseInt(option.value));
  });

  leadModal.show();
};

async function deleteLead(id) {
  if (!confirm('Delete this lead?')) return;
  try {
    await fetchWithAuth(`/api/leads/${id}`, { method: 'DELETE' });
    loadLeads(currentPage);
  } catch (err) {
    console.error('Failed to delete lead:', err);
  }
}

leadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('leadId').value;
  const interests = Array.from(document.getElementById('interests').selectedOptions).map(opt => parseInt(opt.value));
  const payload = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    website_url: document.getElementById('website_url').value,
    company: document.getElementById('company').value,
    position: document.getElementById('position').value,
    industry_id: document.getElementById('industry_id').value,
    referral_source_id: document.getElementById('referral_source_id').value,
    priority: document.getElementById('priority').value,
    notes: document.getElementById('notes').value,
    last_contacted_at: document.getElementById('last_contacted_at').value,
    next_follow_up_at: document.getElementById('next_follow_up_at').value,
    status: document.getElementById('status').value,
    interests
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

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  leadModal = new bootstrap.Modal(document.getElementById('editLeadModal'));
  await populateSelect('industries', 'industry_id');
  await populateSelect('referral_sources', 'referral_source_id');
  await populateSelect('product-categories', 'interests');
  loadLeads();
});
