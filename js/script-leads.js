document.addEventListener("DOMContentLoaded", () => {
  requireAdmin();
  fetchLeads();
  populateSelect('industries', 'lead-industry');
  populateSelect('referral-sources', 'lead-referral');
  populateSelect('categories', 'lead-interests');

  document.getElementById("search-input").addEventListener("input", () => fetchLeads());

  document.getElementById("lead-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("lead-id").value;
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/leads/${id}` : "/api/leads";

    const leadData = {
      name: document.getElementById("lead-name").value,
      email: document.getElementById("lead-email").value,
      phone: document.getElementById("lead-phone").value,
      website_url: document.getElementById("lead-website").value,
      industry_id: document.getElementById("lead-industry").value || null,
      referral_source_id: document.getElementById("lead-referral").value || null,
      lead_interests: Array.from(document.getElementById("lead-interests").selectedOptions).map(opt => parseInt(opt.value)),
      notes: document.getElementById("lead-notes").value,
      status: document.getElementById("lead-status").value,
      priority: document.getElementById("lead-priority").value,
      last_contacted_at: document.getElementById("lead-last-contacted").value || null,
      next_follow_up_at: document.getElementById("lead-follow-up").value || null
    };

    try {
      await fetchWithAuth(url, {
        method,
        body: JSON.stringify(leadData)
      });

      bootstrap.Modal.getInstance(document.getElementById("leadModal")).hide();
      fetchLeads();
    } catch (err) {
      console.error("Failed to save lead:", err);
      alert("Error saving lead.");
    }
  });
});

let currentPage = 1;
const limit = 10;

async function fetchLeads(page = 1) {
  currentPage = page;
  const search = document.getElementById("search-input").value;
  try {
    const res = await fetchWithAuth(`/api/leads?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`);
    const { results, total } = await res.json();
    renderLeads(results);
    renderPagination(total, "pagination-container", fetchLeads, limit, page);
  } catch (err) {
    console.error("Failed to load leads:", err);
  }
}

function renderLeads(leads) {
  const tbody = document.getElementById("leads-body");
  tbody.innerHTML = "";

  leads.forEach((lead) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${lead.name}</td>
      <td>${lead.email || ''}</td>
      <td>${lead.phone || ''}</td>
      <td>${lead.industry_name || ''}</td>
      <td>${lead.referral_source_name || ''}</td>
      <td>${lead.status || ''}</td>
      <td>${lead.priority || ''}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editLead(${lead.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteLead(${lead.id})">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

window.openLeadModal = () => {
  document.getElementById("lead-form").reset();
  document.getElementById("lead-id").value = "";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("leadModal")).show();
};

window.editLead = async (id) => {
  try {
    const res = await fetchWithAuth(`/api/leads/${id}`);
    const lead = await res.json();

    document.getElementById("lead-id").value = lead.id;
    document.getElementById("lead-name").value = lead.name;
    document.getElementById("lead-email").value = lead.email || "";
    document.getElementById("lead-phone").value = lead.phone || "";
    document.getElementById("lead-website").value = lead.website_url || "";
    document.getElementById("lead-industry").value = lead.industry_id || "";
    document.getElementById("lead-referral").value = lead.referral_source_id || "";
    document.getElementById("lead-status").value = lead.status || "";
    document.getElementById("lead-priority").value = lead.priority || "";
    document.getElementById("lead-last-contacted").value = lead.last_contacted_at?.split('T')[0] || "";
    document.getElementById("lead-follow-up").value = lead.next_follow_up_at?.split('T')[0] || "";
    document.getElementById("lead-notes").value = lead.notes || "";

    const interestsSelect = document.getElementById("lead-interests");
    Array.from(interestsSelect.options).forEach(opt => {
      opt.selected = lead.lead_interests?.includes(parseInt(opt.value));
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById("leadModal")).show();
  } catch (err) {
    console.error("Failed to load lead:", err);
    alert("Error loading lead details.");
  }
};

window.deleteLead = async (id) => {
  if (!confirm("Are you sure you want to delete this lead?")) return;
  try {
    await fetchWithAuth(`/api/leads/${id}`, { method: "DELETE" });
    fetchLeads(currentPage);
  } catch (err) {
    console.error("Failed to delete lead:", err);
    alert("Error deleting lead.");
  }
};
