
document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();
  const tbody = document.querySelector("#customer-table tbody");
  const res = await fetchWithAuth("/api/users");
  const users = await res.json();

  tbody.innerHTML = "";
  users.forEach(u => {
    if (u.roles.includes("customer")) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${u.full_name}</td><td>${u.phone}</td><td>${u.email}</td>`;
      tbody.appendChild(tr);
    }
  });
});
