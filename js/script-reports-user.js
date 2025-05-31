
document.addEventListener("DOMContentLoaded", () => {
  requireLogin();
  const list = document.getElementById("report-list");

  const links = [
    { name: "Payment Summary", path: "/api/reports/finance/payments.csv" },
    { name: "Order Report", path: "/api/reports/sales/orders.csv" },
    { name: "Tax Report", path: "/api/reports/taxes/report.csv" }
  ];

  list.innerHTML = links.map(link => `
    <li class="list-group-item">
      <a href="${link.path}" target="_blank">${link.name}</a>
    </li>
  `).join("");
});
