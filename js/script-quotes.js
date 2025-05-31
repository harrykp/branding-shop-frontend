
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#quote-table tbody");

  async function loadQuotes() {
    const res = await fetchWithAuth("/api/quotes");
    const quotes = await res.json();

    tableBody.innerHTML = "";
    quotes.forEach(q => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${q.customer_name || 'N/A'}</td>
        <td>${q.created_at?.split('T')[0]}</td>
        <td>${q.total}</td>
        <td>${q.status}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editQuote('${q.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteQuote('${q.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.editQuote = (id) => alert("Edit quote: " + id);
  window.deleteQuote = async (id) => {
    if (confirm("Delete this quote?")) {
      await fetchWithAuth("/api/quotes/" + id, { method: "DELETE" });
      loadQuotes();
    }
  };

  loadQuotes();
});
