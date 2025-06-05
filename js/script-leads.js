// ✅ Fixed script-leads.js

document.addEventListener("DOMContentLoaded", () => {
  fetchLeads();
  populateSelect("leadIndustry", "industries");
  populateSelect("leadReferral", "referralSources");
  populateSelect("leadInterests", "product-categories", true);

  document.getElementById("leadForm").addEventListener("submit", handleFormSubmit);
  document.getElementById("searchInput").addEventListener("input", handleSearch);
});

let leads = [];
let currentPage = 1;
let rowsPerPage = 10;

async function fetchLeads(query = '') {
  try {
    const res = await fetchWithAuth(`/api/leads?search=${encodeURIComponent(query)}&page=${currentPage}&limit=${rowsPerPage}`);
    const data = await res.json();
    leads = Array.isArray(data.results) ? data.results : [];
    renderLeads(leads);

    if (data.total) {
      renderPagination(data.total, "pagination", (page) => {
        currentPage = page;
        fetchLeads(query);
      }, rowsPerPage, currentPage);
    }
  } catch (err) {
    console.error("Failed to load leads:", err);
  }
}

function renderLeads(leads) {
  const tbody = document.getElementById("leads-table-body");
  tbody.innerHTML = "";
  leads.forEach((lead) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${lead.name}</td>
      <td>${lead.email || ''}</td>
      <td>${lead.phone || ''}</td>
      <td>${lead.industry_name || ''}</td>
      <td>${lead.referral_source_name || ''}</td>
      <td>${lead.status}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="viewLead(${lead.id})">View</button>
        <button class="btn btn-sm btn-warning" onclick="editLead(${lead.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteLead(${lead.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function handleSearch(e) {
  fetchLeads(e.target.value);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("leadId").value;
  const payload = {
    name: document.getElementById("leadName").value,
    email: document.getElementById("leadEmail").value,
    phone: document.getElementById("leadPhone").value,
    website_url: document.getElementById("leadWebsite").value,
    industry_id: document.getElementById("leadIndustry").value || null,
    referral_source_id: document.getElementById("leadReferral").value || null,
    lead_interests: Array.from(document.getElementById("leadInterests").selectedOptions).map(o => o.value),
    notes: document.getElementById("leadNotes").value,
    status: document.getElementById("leadStatus").value,
    priority: document.getElementById("leadPriority").value,
    next_follow_up_at: document.getElementById("leadNextFollowUp").value || null,
    last_contacted_at: document.getElementById("leadLastContacted").value || null
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/leads/${id}` : `/api/leads`;
    const res = await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Save failed");

    document.getElementById("leadForm").reset();
    bootstrap.Modal.getInstance(document.getElementById("editLeadModal")).hide();
    fetchLeads();
  } catch (err) {
    console.error("Save error:", err);
  }
}

window.editLead = async function(id) {
  try {
    const res = await fetchWithAuth(`/api/leads/${id}`);
    const data = await res.json();
    document.getElementById("leadId").value = data.id;
    document.getElementById("leadName").value = data.name || '';
    document.getElementById("leadEmail").value = data.email || '';
    document.getElementById("leadPhone").value = data.phone || '';
    document.getElementById("leadWebsite").value = data.website_url || '';
    document.getElementById("leadIndustry").value = data.industry_id || '';
    document.getElementById("leadReferral").value = data.referral_source_id || '';
    document.getElementById("leadNotes").value = data.notes || '';
    document.getElementById("leadStatus").value = data.status || 'new';
    document.getElementById("leadPriority").value = data.priority || 'medium';
    document.getElementById("leadNextFollowUp").value = data.next_follow_up_at?.split("T")[0] || '';
    document.getElementById("leadLastContacted").value = data.last_contacted_at?.split("T")[0] || '';

    const interestSelect = document.getElementById("leadInterests");
    Array.from(interestSelect.options).forEach(opt => {
      opt.selected = data.lead_interests?.includes(parseInt(opt.value)) || false;
    });

    new bootstrap.Modal(document.getElementById("editLeadModal")).show();
  } catch (err) {
    console.error("Edit error:", err);
  }
};

window.viewLead = async function(id) {
  try {
    const res = await fetchWithAuth(`/api/leads/${id}`);
    const data = await res.json();
    const body = document.getElementById("viewLeadBody");
    body.innerHTML = `
      <tr><td>Name</td><td>${data.name}</td></tr>
      <tr><td>Email</td><td>${data.email || ''}</td></tr>
      <tr><td>Phone</td><td>${data.phone || ''}</td></tr>
      <tr><td>Website</td><td>${data.website_url || ''}</td></tr>
      <tr><td>Industry</td><td>${data.industry_name || ''}</td></tr>
      <tr><td>Referral</td><td>${data.referral_source_name || ''}</td></tr>
      <tr><td>Status</td><td>${data.status}</td></tr>
      <tr><td>Priority</td><td>${data.priority}</td></tr>
      <tr><td>Next Follow Up</td><td>${data.next_follow_up_at?.split('T')[0] || ''}</td></tr>
      <tr><td>Last Contacted</td><td>${data.last_contacted_at?.split('T')[0] || ''}</td></tr>
      <tr><td>Notes</td><td>${data.notes || ''}</td></tr>
    `;
    new bootstrap.Modal(document.getElementById("viewLeadModal")).show();
  } catch (err) {
    console.error("View error:", err);
  }
};

window.deleteLead = async function(id) {
  if (!confirm("Are you sure you want to delete this lead?")) return;
  try {
    const res = await fetchWithAuth(`/api/leads/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    fetchLeads();
  } catch (err) {
    console.error("Delete error:", err);
  }
};
