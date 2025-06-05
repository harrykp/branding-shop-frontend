document.addEventListener("DOMContentLoaded", () => {
  fetchLeads();
  populateSelect("customers", "customer_id");
  populateSelect("users", "sales_rep_id");
  populateSelect("industries", "industry_id");
  populateSelect('leadReferral', 'referralSources');
  populateSelect('leadInterests', 'product-categories', true);
});

let currentPage = 1;
const limit = 10;

async function fetchLeads(page = 1) {
  currentPage = page;
  const search = document.getElementById("lead-search").value;

  try {
    const res = await fetchWithAuth(`/api/leads?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`);
    const data = await res.json();
    const tbody = document.getElementById("lead-table-body");
    tbody.innerHTML = "";

    data.results.forEach(lead => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${lead.name}</td>
        <td>${lead.email || ""}</td>
        <td>${lead.phone || ""}</td>
        <td>${lead.industry_name || ""}</td>
        <td>${lead.referral_source_name || ""}</td>
        <td>${lead.priority || ""}</td>
        <td>${lead.status || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editLead(${lead.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteLead(${lead.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPagination(data.total, "pagination-container", fetchLeads, limit, currentPage);
  } catch (err) {
    console.error("Failed to load leads:", err);
  }
}

function openNewLeadModal() {
  document.getElementById("lead-form").reset();
  document.getElementById("lead-id").value = "";
  document.getElementById("lead_interests").value = [];
}

async function saveLead(e) {
  e.preventDefault();
  const id = document.getElementById("lead-id").value;

  const payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    website_url: document.getElementById("website_url").value,
    industry_id: document.getElementById("industry_id").value,
    referral_source_id: document.getElementById("referral_source_id").value,
    priority: document.getElementById("priority").value,
    status: document.getElementById("status").value,
    customer_id: document.getElementById("customer_id").value || null,
    sales_rep_id: document.getElementById("sales_rep_id").value || null,
    notes: document.getElementById("notes").value,
    last_contacted_at: document.getElementById("last_contacted_at").value || null,
    next_follow_up_at: document.getElementById("next_follow_up_at").value || null,
    lead_interests: Array.from(document.getElementById("lead_interests").selectedOptions).map(o => o.value)
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/leads/${id}` : "/api/leads";

    const res = await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      bootstrap.Modal.getOrCreateInstance(document.getElementById("leadModal")).hide();
      fetchLeads(currentPage);
    } else {
      const error = await res.json();
      alert(error.message || "Save failed");
    }
  } catch (err) {
    console.error("Save failed:", err);
  }
}

async function editLead(id) {
  try {
    const res = await fetchWithAuth(`/api/leads/${id}`);
    const lead = await res.json();

    document.getElementById("lead-id").value = lead.id;
    document.getElementById("name").value = lead.name || "";
    document.getElementById("email").value = lead.email || "";
    document.getElementById("phone").value = lead.phone || "";
    document.getElementById("website_url").value = lead.website_url || "";
    document.getElementById("industry_id").value = lead.industry_id || "";
    document.getElementById("referral_source_id").value = lead.referral_source_id || "";
    document.getElementById("priority").value = lead.priority || "";
    document.getElementById("status").value = lead.status || "";
    document.getElementById("customer_id").value = lead.customer_id || "";
    document.getElementById("sales_rep_id").value = lead.sales_rep_id || "";
    document.getElementById("notes").value = lead.notes || "";
    document.getElementById("last_contacted_at").value = lead.last_contacted_at ? lead.last_contacted_at.split('T')[0] : "";
    document.getElementById("next_follow_up_at").value = lead.next_follow_up_at ? lead.next_follow_up_at.split('T')[0] : "";

    const interests = lead.lead_interests || [];
    const interestSelect = document.getElementById("lead_interests");
    Array.from(interestSelect.options).forEach(opt => {
      opt.selected = interests.includes(parseInt(opt.value));
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById("leadModal")).show();
  } catch (err) {
    console.error("Load error:", err);
  }
}

async function deleteLead(id) {
  if (!confirm("Delete this lead?")) return;

  try {
    const res = await fetchWithAuth(`/api/leads/${id}`, { method: "DELETE" });
    if (res.ok) fetchLeads(currentPage);
    else alert("Delete failed");
  } catch (err) {
    console.error("Delete error:", err);
  }
}
