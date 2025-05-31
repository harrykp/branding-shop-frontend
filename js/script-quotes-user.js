
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const tableBody = document.querySelector("#quotes-table tbody");

  async function loadQuotes() {
    const res = await fetchWithAuth("/api/quotes");
    const quotes = await res.json();

    tableBody.innerHTML = "";
    quotes.forEach(q => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${q.id}</td>
        <td>${q.total}</td>
        <td>${q.status}</td>
        <td>${q.created_at?.split('T')[0]}</td>
        <td>
          <a class="btn btn-sm btn-primary" href="quote-detail.html?id=${q.id}">View</a>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadQuotes();
});
