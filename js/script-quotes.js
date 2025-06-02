let allQuotes = [];
let allProducts = [];
let currentPage = 1;
const QUOTES_PER_PAGE = 10;

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();
  await loadProducts();
  await loadQuotes();

  document.getElementById("search-quotes")?.addEventListener("input", () => {
    currentPage = 1;
    renderQuotesTable();
  });

  document.getElementById("edit-quote-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-quote-id").value;
    const product_id = document.getElementById("edit-quote-product").value;
    const quantity = parseInt(document.getElementById("edit-quote-quantity").value);

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_BASE}/api/quotes/${id}` : `${API_BASE}/api/quotes`;

    await fetchWithAuth(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id, quantity })
    });

    bootstrap.Modal.getInstance(document.getElementById("editQuoteModal")).hide();
    await loadQuotes();
  });
});

async function loadQuotes() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/quotes`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Invalid data returned");
    allQuotes = data;
    renderQuotesTable();
  } catch (err) {
    console.error("Failed to load quotes:", err);
  }
}

async function loadProducts() {
  const res = await fetchWithAuth(`${API_BASE}/api/products`);
  const products = await res.json();
  allProducts = products;
  const select = document.getElementById("edit-quote-product");
  if (select) {
    select.innerHTML = products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  }
}

function renderQuotesTable() {
  const tbody = document.querySelector("#quote-table tbody");
  const search = document.getElementById("search-quotes")?.value.toLowerCase() || "";
  const filtered = allQuotes.filter(q =>
    (q.product_name || "").toLowerCase().includes(search) ||
    (q.category_name || "").toLowerCase().includes(search)
  );

  const totalPages = Math.ceil(filtered.length / QUOTES_PER_PAGE);
  if (currentPage > totalPages) currentPage = 1;

  const pageItems = filtered.slice((currentPage - 1) * QUOTES_PER_PAGE, currentPage * QUOTES_PER_PAGE);

  tbody.innerHTML = "";
  for (const q of pageItems) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${q.product_name || ''}</td>
      <td>${q.category_name || ''}</td>
      <td>${q.quantity}</td>
      <td>${q.status || 'pending'}</td>
      <td>${new Date(q.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick="openEditQuote(${q.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteQuote(${q.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  renderPagination("pagination-quotes", filtered.length, QUOTES_PER_PAGE, currentPage, (page) => {
    currentPage = page;
    renderQuotesTable();
  });
}

window.openEditQuote = (id) => {
  const quote = allQuotes.find(q => q.id == id);
  if (!quote) return;
  document.getElementById("edit-quote-id").value = quote.id;
  document.getElementById("edit-quote-product").value = quote.product_id;
  document.getElementById("edit-quote-quantity").value = quote.quantity;
  new bootstrap.Modal(document.getElementById("editQuoteModal")).show();
};

window.deleteQuote = async (id) => {
  if (confirm("Delete this quote?")) {
    await fetchWithAuth(`${API_BASE}/api/quotes/${id}`, { method: "DELETE" });
    await loadQuotes();
  }
};

};
