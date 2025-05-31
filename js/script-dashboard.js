
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const statsContainer = document.getElementById("admin-dashboard-stats");

  const endpoints = {
    users: "/api/users",
    orders: "/api/orders",
    payments: "/api/payments"
  };

  const results = await Promise.all(
    Object.entries(endpoints).map(([key, url]) =>
      fetchWithAuth(url).then(res => res.json()).catch(() => [])
    )
  );

  const labels = ["Users", "Orders", "Payments"];
  statsContainer.innerHTML = results.map((data, i) => `
    <div class="col-md-4">
      <div class="card text-white bg-success mb-3">
        <div class="card-body">
          <h5 class="card-title">${labels[i]}</h5>
          <p class="card-text">Count: ${data.length}</p>
        </div>
      </div>
    </div>
  `).join("");
});
