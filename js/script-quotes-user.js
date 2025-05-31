const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadQuotes(1);
});

async function loadQuotes() {
  try {
    const res = await fetchWithAuth(\`\${API_BASE}/api/quotes\`);
    const quotes = await res.json();
    const user = getCurrentUser();
    const tbody = document.getElementById("quote-table-body");
    tbody.innerHTML = "";

    quotes.forEach(q => {
      if (
        user.roles.includes("admin") ||
        user.roles.includes("sales") ||
        q.user_id === user.id
      ) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>#${q.id}</td>
          <td>${q.customer_name || ""}</td>
          <td>${q.items?.length || 0}</td>
          <td>₵${q.total_amount.toFixed(2)}</td>
          <td>${renderStatusDropdown(q)}</td>
          <td>${new Date(q.created_at).toLocaleDateString()}</td>
          <td>
            ${q.user_id === user.id || user.roles.includes("admin") ? `<button class="btn btn-sm btn-primary" onclick="editQuote(${q.id})">Edit</button>` : ""}
            ${q.user_id === user.id || user.roles.includes("admin") ? `<button class="btn btn-sm btn-danger" onclick="deleteQuote(${q.id})">Delete</button>` : ""}
          </td>
        `;
        tbody.appendChild(tr);
      }
    });
  } catch (err) {
    console.error("Error loading quotes:", err);
  }
}

function renderStatusDropdown(quote) {
  const user = getCurrentUser();
  if (user.roles.includes("admin") || user.roles.includes("sales")) {
    return `
      <select onchange="updateStatus(${quote.id}, this.value)">
        <option value="draft" ${quote.status === "draft" ? "selected" : ""}>Draft</option>
        <option value="submitted" ${quote.status === "submitted" ? "selected" : ""}>Submitted</option>
        <option value="approved" ${quote.status === "approved" ? "selected" : ""}>Approved</option>
      </select>`;
  }
  return quote.status;
}

function openNewQuoteForm() {
  // Show modal and load form
  const modal = new bootstrap.Modal(document.getElementById("quoteModal"));
  document.getElementById("quote-form").reset();
  document.getElementById("quote-form-fields").innerHTML = "<p>Form to be implemented</p>";
  modal.show();
}

function exportQuotes() {
  alert("Export to CSV coming soon...");
}


let allQuotes = [];
const PAGE_SIZE = 5;

async function loadQuotes(page = 1) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/quotes`);
    allQuotes = await res.json();
    const user = getCurrentUser();
    const tbody = document.getElementById("quote-table-body");
    const searchTerm = document.getElementById("search-input")?.value.toLowerCase() || "";

    let filtered = allQuotes.filter(q =>
      (user.roles.includes("admin") || user.roles.includes("sales") || q.user_id === user.id) &&
      (q.customer_name?.toLowerCase().includes(searchTerm) || q.status?.toLowerCase().includes(searchTerm))
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageQuotes = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    tbody.innerHTML = "";
    pageQuotes.forEach(q => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${q.id}</td>
        <td>${q.customer_name || ""}</td>
        <td>${q.items?.length || 0}</td>
        <td>₵${q.total_amount.toFixed(2)}</td>
        <td>${renderStatusDropdown(q)}</td>
        <td>${new Date(q.created_at).toLocaleDateString()}</td>
        <td>
          ${q.user_id === user.id || user.roles.includes("admin") ? `<button class="btn btn-sm btn-primary" onclick="editQuote(${q.id})">Edit</button>` : ""}
          ${q.user_id === user.id || user.roles.includes("admin") ? `<button class="btn btn-sm btn-danger" onclick="deleteQuote(${q.id})">Delete</button>` : ""}
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderPaginationControls(page, totalPages);
  } catch (err) {
    console.error("Error loading quotes:", err);
  }
}

function renderPaginationControls(current, total) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  for (let i = 1; i <= total; i++) {
    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-primary mx-1";
    btn.textContent = i;
    if (i === current) btn.classList.add("active");
    btn.onclick = () => loadQuotes(i);
    pagination.appendChild(btn);
  }
}
