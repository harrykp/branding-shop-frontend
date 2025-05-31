const API_BASE = "https://branding-shop-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  includeHTML();
  await requireLogin();
  loadHRInfo();
});

async function loadHRInfo() {
  try {
    const user = getCurrentUser();
    const res = await fetchWithAuth(`${API_BASE}/api/hr`);
    const allHR = await res.json();
    const entry = allHR.find(e => e.user_id === user.id);
    const div = document.getElementById("hr-info");

    if (!entry) return div.innerHTML = "<p class='text-danger'>No HR data found for your account.</p>";

    div.innerHTML = `
      <table class="table table-bordered w-100">
        <tr><th>Full Name</th><td>${entry.full_name}</td></tr>
        <tr><th>Position</th><td>${entry.position}</td></tr>
        <tr><th>Department</th><td>${entry.department}</td></tr>
        <tr><th>SSNIT</th><td>${entry.ssnit_number}</td></tr>
        <tr><th>Salary</th><td>₵${entry.salary}</td></tr>
      </table>
    `;
  } catch (err) {
    console.error("HR error:", err);
  }
}
