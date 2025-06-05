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
        <td>${lead.company || ''}</td>
        <td>${lead.position || ''}</td>
        <td>${lead.industry || ''}</td>
        <td>${lead.referral_source || ''}</td>
        <td>${lead.priority}</td>
        <td>${lead.converted ? 'Yes' : 'No'}</td>
        <td>${lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleDateString() : ''}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick='editLead(${JSON.stringify(lead)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick='deleteLead(${lead.id})'>Delete</button>
        </td>`;
      leadsTableBody.appendChild(tr);
    });

    renderPagination(total, 'pagination', loadLeads);
  } catch (err) {
    console.error('Failed to load leads:', err);
  }
}

window.editLead = function(lead) {
  document.getElementById('leadId').value = lead.id;
  document.getElementById('leadName').value = lead.name;
  document.getElementById('leadCompany').value = lead.company || '';
  document.getElementById('leadPosition').value = lead.position || '';
  document.getElementById('leadIndustry').value = lead.industry || '';
  document.getElementById('leadReferral').value = lead.referral_source || '';
  document.getElementById('leadPriority').value = lead.priority || 'medium';
  document.getElementById('leadLastContacted').value = lead.last_contacted_at ? lead.last_contacted_at.substring(0, 16) : '';
  document.getElementById('leadNextFollowUp').value = lead.next_follow_up_at ? lead.next_follow_up_at.substring(0, 16) : '';
  document.getElementById('leadNotes').value = lead.notes || '';
  document.getElementById('leadConverted').checked = lead.converted;

  leadModal.show();
}

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
  const payload = {
    name: document.getElementById('leadName').value,
    company: document.getElementById('leadCompany').value,
    position: document.getElementById('leadPosition').value,
    industry: document.getElementById('leadIndustry').value,
    referral_source: document.getElementById('leadReferral').value,
    priority: document.getElementById('leadPriority').value,
    last_contacted_at: document.getElementById('leadLastContacted').value,
    next_follow_up_at: document.getElementById('leadNextFollowUp').value,
    notes: document.getElementById('leadNotes').value,
    converted: document.getElementById('leadConverted').checked
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

searchInput.addEventListener('input', () => loadLeads(1));

window.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();
  await includeHTML();
  leadModal = new bootstrap.Modal(document.getElementById('editLeadModal'));
  loadLeads();
});
