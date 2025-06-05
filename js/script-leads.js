// /js/script-leads.js

let leadModal;
const leadForm = document.getElementById("leadForm");
const leadsTableBody = document.getElementById("leads-table-body");
const searchInput = document.getElementById("searchInput");
let currentPage = 1;

function exportLeadsToCSV() {
  exportTableToCSV("leadsTable");
}

async function loadLeads(page = 1) {
  currentPage = page;
  const search = searchInput.value.trim();
  try {
    const res = await fetchWithAuth(`/api/leads?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const { data, total } = await res.json();
    leadsTableBody.innerHTML = "";

    data.forEach((lead) => {
      const tr = document.createElement("tr");
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
        </td>
      `;
      leadsTableBody.appendChild(tr);
    });

    renderPagination(total, "pagination", loadLeads);
  } catch (err) {
    console.error("Failed to load leads:", err);
  }
}

window.editLead = function (lead) {
  document.getElementById("leadId").value = lead.id;
  document.getElementById("leadName").value = lead.name;
  document.getElementById("leadEmail").value = lead.email || '';
  document.getElementById("leadPhone").value = lead.phone || '';
  document.getElementById("leadWebsite").value = lead.website_url || '';
  document.getElementById("leadIndustry").value = lead.industry_id || '';
  document.getElementById("leadReferral").value = lead.referral_source_id || '';
  document.getElementById("leadNotes").value = lead.notes || '';
  document.getElementById("leadStatus").value = lead.status;
  document.getElementById("leadPriority").value = lead.priority;
  document.getElementById("leadLastContacted").value = lead.last_contacted_at?.split("T")[0] || '';
  document.getElementById("leadNextFollowUp").value = lead.next_follow_up_at?.split("T")[0] || '';

  const interestsSelect = document.getElementById("leadInterests");
  Array.from(interestsSelect.options).forEach(opt => {
    opt.selected = lead.interests?.includes(parseInt(opt.value)) || false;
  });

  leadModal.show();
};

window.viewLead = function (lead) {
  alert(JSON.stringify(lead, null, 2)); // For now
};

window.deleteLead = async function (id) {
  if (!confirm("Delete this lead?")) return;
  try {
    await fetchWithAuth(`/api/leads/${id}`, { method: "DELETE" });
    loadLeads(currentPage);
  } catch (err) {
    console.error("Failed to delete lead:", err);
  }
};

leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("leadId").value;
  const payload = {
    name: document.getElementById("leadName").value,
    email: document.getElementById("leadEmail").value,
    phone: document.getElementById("leadPhone").value,
    website_url: document.getElementById("leadWebsite").value,
    industry_id: document.getElementById("leadIndustry").value,
    referral_source_id: document.getElementById("leadReferral").value,
    notes: document.getElementById("leadNotes").value,
    status: document.getElementById("leadStatus").value,
    priority: document.getElementById("leadPriority").value,
    last_contacted_at: document.getElementById("leadLastContacted").value,
    next_follow_up_at: document.getElementById("leadNextFollowUp").value,
    interests: Array.from(document.getElementById("leadInterests").selectedOptions).map(opt => parseInt(opt.value))
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = `/api/leads${id ? '/' + id : ''}`;
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });
    leadModal.hide();
    loadLeads(currentPage);
  } catch (err) {
    console.error("Failed to save lead:", err);
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();
  leadModal = new bootstrap.Modal(document.getElementById("editLeadModal"));
  await populateSelect("industries", "leadIndustry");
  await populateSelect("referral_sources", "leadReferral");
  await populateSelect("product_categories", "leadInterests");
  loadLeads();
});
