// ✅ FINAL: js/script-leads.js

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  populateSelect("industry_id", "industries");
  populateSelect("referral_source_id", "referral-sources");
  populateSelect("interested_in", "product-categories", true);
  fetchLeads();

  document.getElementById("searchInput").addEventListener("input", fetchLeads);
  document.getElementById("leadForm").addEventListener("submit", handleLeadSubmit);
});

async function fetchLeads() {
  const search = document.getElementById("searchInput").value;
  try {
    const res = await fetchWithAuth(`/api/leads?search=${encodeURIComponent(search)}&page=1&limit=10`);
    const { data, total } = await res.json();
    renderLeads(data);
    renderPagination(total, 1, 10, fetchLeads, "pagination-container");
  } catch (err) {
    console.error("Failed to load leads:", err);
  }
}

function renderLeads(leads) {
  const tbody = document.getElementById("lead-table-body");
  tbody.innerHTML = "";

  leads.forEach((lead) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${lead.name}</td>
      <td>${lead.email || ""}</td>
      <td>${lead.phone || ""}</td>
      <td>${lead.company || ""}</td>
      <td>${lead.industry_name || ""}</td>
      <td>${lead.referral_source_name || ""}</td>
      <td>${lead.status || ""}</td>
      <td>${lead.priority || ""}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick='editLead(${JSON.stringify(lead)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick='deleteLead(${lead.id})'>Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editLead(lead) {
  document.getElementById("lead-id").value = lead.id;
  document.getElementById("name").value = lead.name;
  document.getElementById("email").value = lead.email || "";
  document.getElementById("phone").value = lead.phone || "";
  document.getElementById("company").value = lead.company || "";
  document.getElementById("position").value = lead.position || "";
  document.getElementById("website_url").value = lead.website_url || "";
  document.getElementById("industry_id").value = lead.industry_id || "";
  document.getElementById("referral_source_id").value = lead.referral_source_id || "";
  document.getElementById("status").value = lead.status || "";
  document.getElementById("priority").value = lead.priority || "";
  document.getElementById("last_contacted_at").value = lead.last_contacted_at?.split("T")[0] || "";
  document.getElementById("next_follow_up_at").value = lead.next_follow_up_at?.split("T")[0] || "";
  document.getElementById("notes").value = lead.notes || "";

  const interestSelect = document.getElementById("interested_in");
  [...interestSelect.options].forEach(opt => {
    opt.selected = (lead.interested_in || []).some(i => i.id == opt.value);
  });

  bootstrap.Modal.getOrCreateInstance(document.getElementById("leadModal")).show();
}

async function handleLeadSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("lead-id").value;

  const payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    company: document.getElementById("company").value,
    position: document.getElementById("position").value,
    website_url: document.getElementById("website_url").value,
    industry_id: document.getElementById("industry_id").value || null,
    referral_source_id: document.getElementById("referral_source_id").value || null,
    status: document.getElementById("status").value,
    priority: document.getElementById("priority").value,
    last_contacted_at: document.getElementById("last_contacted_at").value || null,
    next_follow_up_at: document.getElementById("next_follow_up_at").value || null,
    notes: document.getElementById("notes").value,
    lead_interests: [...document.getElementById("interested_in").selectedOptions].map(o => parseInt(o.value)),
    user_id: getCurrentUser()?.userId || null
  };

  const url = id ? `/api/leads/${id}` : `/api/leads`;
  const method = id ? "PUT" : "POST";

  try {
    await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });

    bootstrap.Modal.getInstance(document.getElementById("leadModal")).hide();
    document.getElementById("leadForm").reset();
    fetchLeads();
  } catch (err) {
    console.error("Error saving lead:", err);
  }
}

async function deleteLead(id) {
  if (!confirm("Are you sure you want to delete this lead?")) return;
  try {
    await fetchWithAuth(`/api/leads/${id}`, { method: "DELETE" });
    fetchLeads();
  } catch (err) {
    console.error("Error deleting lead:", err);
  }
}
