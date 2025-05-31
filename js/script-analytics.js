
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();

  const timeseries = await fetchWithAuth("/api/reports/sales/timeseries").then(res => res.json());
  const gateways = await fetchWithAuth("/api/reports/finance/payment-gateways").then(res => res.json());
  const deals = await fetchWithAuth("/api/reports/sales/deals-pipeline").then(res => res.json());
  const jobs = await fetchWithAuth("/api/reports/sales/jobs-status").then(res => res.json());

  const ctx1 = document.getElementById("revenueChart");
  new Chart(ctx1, {
    type: "bar",
    data: {
      labels: timeseries.labels,
      datasets: [{ label: "Revenue", data: timeseries.values }]
    }
  });

  const ctx2 = document.getElementById("orderStatusChart");
  new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: jobs.labels,
      datasets: [{ label: "Jobs", data: jobs.values }]
    }
  });

  const ctx3 = document.getElementById("paymentGatewayChart");
  new Chart(ctx3, {
    type: "pie",
    data: {
      labels: gateways.labels,
      datasets: [{ label: "Payments", data: gateways.values }]
    }
  });

  const ctx4 = document.getElementById("dealPipelineChart");
  new Chart(ctx4, {
    type: "bar",
    data: {
      labels: deals.labels,
      datasets: [{ label: "Deals", data: deals.values }]
    }
  });
});
