const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  await includeHTML();     // Load nav and inject user links
  requireLogin();          // Enforce login
  loadDashboardStats();    // Load and display dashboard info
});

async function loadDashboardStats() {
  const user = getCurrentUser();
  try {
    const [orders, jobs, payments] = await Promise.all([
      fetchWithAuth(`${API_BASE}/api/orders`),
      fetchWithAuth(`${API_BASE}/api/jobs`),
      fetchWithAuth(`${API_BASE}/api/payments`)
    ]);

    const totalOrders = orders.filter(o => o.user_id === user.id).length;
    const completedJobs = jobs.filter(j => j.user_id === user.id && j.status.toLowerCase() === 'completed').length;
    const totalPayments = payments
      .filter(p => p.user_id === user.id)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    document.getElementById("total-orders").textContent = totalOrders;
    document.getElementById("completed-jobs").textContent = completedJobs;
    document.getElementById("total-payments").textContent = `₵${totalPayments.toFixed(2)}`;
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}
