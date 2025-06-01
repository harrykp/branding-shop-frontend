const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  await requireAdmin();
  includeHTML();
  renderCharts();
});

async function renderCharts() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/reports/sales/timeseries`);
    const timeseries = await res.json();

    if (!Array.isArray(timeseries)) {
      console.error("Expected array, got:", timeseries);
      return;
    }

    const labels = timeseries.map(entry => entry.date);
    const revenueData = timeseries.map(entry => parseFloat(entry.total_revenue || 0));

    new Chart(document.getElementById("revenueChart"), {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Revenue",
          data: revenueData
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
  } catch (err) {
    console.error("Analytics load error:", err);
  }
}
