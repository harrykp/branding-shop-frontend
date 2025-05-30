const API_BASE = 'https://branding-shop-backend.onrender.com';

async function fetchWithAuth(endpoint) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

async function renderCharts() {
  const timeseries = await fetchWithAuth('/api/reports/sales/timeseries');
  const statusCounts = await fetchWithAuth('/api/reports/orders/status');
  const gateways = await fetchWithAuth('/api/reports/payments/gateways');
  const pipeline = await fetchWithAuth('/api/reports/deals/pipeline');

  // Safety check
  if (!Array.isArray(timeseries)) return console.error("Invalid timeseries:", timeseries);
  if (!Array.isArray(statusCounts)) return console.error("Invalid status counts:", statusCounts);
  if (!Array.isArray(gateways)) return console.error("Invalid gateways:", gateways);
  if (!pipeline || !pipeline.deal_stages) return console.error("Invalid pipeline data:", pipeline);

  new Chart(document.getElementById('revenueChart'), {
    type: 'line',
    data: {
      labels: timeseries.map(e => e.date),
      datasets: [{
        label: 'Daily Revenue',
        data: timeseries.map(e => e.revenue),
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)'
      }]
    }
  });

  new Chart(document.getElementById('orderStatusChart'), {
    type: 'doughnut',
    data: {
      labels: statusCounts.map(e => e.status),
      datasets: [{
        label: 'Orders by Status',
        data: statusCounts.map(e => e.count),
        backgroundColor: ['#ffc107', '#0d6efd', '#198754', '#dc3545']
      }]
    }
  });

  new Chart(document.getElementById('paymentGatewayChart'), {
    type: 'bar',
    data: {
      labels: gateways.map(e => e.gateway),
      datasets: [{
        label: 'Payments by Gateway',
        data: gateways.map(e => e.total),
        backgroundColor: '#6f42c1'
      }]
    }
  });

  new Chart(document.getElementById('dealPipelineChart'), {
    type: 'pie',
    data: {
      labels: pipeline.deal_stages.map(e => e.status),
      datasets: [{
        label: 'Deals by Stage',
        data: pipeline.deal_stages.map(e => e.count),
        backgroundColor: ['#0dcaf0', '#fd7e14', '#198754']
      }]
    }
  });
}

document.addEventListener('DOMContentLoaded', renderCharts);
