const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadDashboardStats();
});

async function loadDashboardStats() {
  const user = getCurrentUser();
  try {
    const [ordersRes, jobsRes, paymentsRes] = await Promise.all([
      fetchWithAuth(`${API_BASE}/api/orders`),
      fetchWithAuth(`${API_BASE}/api/jobs`),
      fetchWithAuth(`${API_BASE}/api/payments`)
    ]);

    const orders = await ordersRes.json();
    const jobs = await jobsRes.json();
    const payments = await paymentsRes.json();

    const totalOrders = orders.filter(o => o.user_id === user.id).length;
    const completedJobs = jobs.filter(j => j.user_id === user.id && j.status === 'Completed').length;
    const totalPayments = payments
      .filter(p => p.user_id === user.id)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    document.getElementById("total-orders").textContent = totalOrders;
    document.getElementById("completed-jobs").textContent = completedJobs;
    document.getElementById("total-payments").textContent = `₵${totalPayments.toFixed(2)}`;
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}
