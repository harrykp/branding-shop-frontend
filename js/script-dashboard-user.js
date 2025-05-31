
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const summary = document.getElementById("dashboard-summary");

  const endpoints = {
    quotes: "/api/quotes",
    orders: "/api/orders",
    payments: "/api/payments"
  };

  const results = await Promise.all(Object.entries(endpoints).map(([key, url]) => 
    fetchWithAuth(url).then(res => res.json()).catch(() => [])
  ));

  const cards = ["Quotes", "Orders", "Payments"].map((label, i) => `
    <div class="col-md-4">
      <div class="card text-white bg-primary mb-3">
        <div class="card-body">
          <h5 class="card-title">${label}</h5>
          <p class="card-text">Count: ${results[i].length}</p>
        </div>
      </div>
    </div>
  `).join("");

  summary.innerHTML = cards;
});
