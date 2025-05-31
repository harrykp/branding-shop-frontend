const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  renderCharts();
});

async function renderCharts() {
  try {
    const salesRes = await fetchWithAuth(`${API_BASE}/api/reports/sales/timeseries`);
    const salesData = await salesRes.json();
    const salesLabels = salesData.map(e => e.date);
    const salesValues = salesData.map(e => e.total);

    new Chart(document.getElementById("salesChart"), {
      type: 'bar',
      data: {
        labels: salesLabels,
        datasets: [{
          label: "Sales Over Time",
          data: salesValues,
        }]
      }
    });

    const leaveRes = await fetchWithAuth(`${API_BASE}/api/reports/leave`);
    const leaveData = await leaveRes.json();
    const leaveLabels = leaveData.map(e => e.employee);
    const leaveValues = leaveData.map(e => e.days);

    new Chart(document.getElementById("leaveChart"), {
      type: 'pie',
      data: {
        labels: leaveLabels,
        datasets: [{
          label: "Leave Days",
          data: leaveValues,
        }]
      }
    });
  } catch (err) {
    console.error("Reports chart error:", err);
  }
}
