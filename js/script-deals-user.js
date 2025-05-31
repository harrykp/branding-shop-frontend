
document.addEventListener("DOMContentLoaded", () => {
  requireLogin();
  fetchAndRender();

  document.getElementById("search").addEventListener("input", function () {
    filterTable(this.value);
  });
});

function fetchAndRender(page = 1) {
  fetch(`/api/deals-user?page=${page}`, {
    headers: {
      Authorization: "Bearer " + (localStorage.getItem("token") || sessionStorage.getItem("token"))
    }
  })
    .then(res => res.json())
    .then(data => renderTable(data.items || []))
    .catch(err => console.error("Error loading deals-user:", err));
}

function renderTable(items) {
  const tbody = document.getElementById("deal-list");
  tbody.innerHTML = "";

  items.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.name || item.title || item.email || item.client || item.category || item.code || '-'}</td>
      <td>
        <select class='form-select form-select-sm' onchange='updateStatus(this, "${item.id}")'>
          <option value='pending' ${item.status === 'pending' ? 'selected' : ''}>pending</option>
          <option value='approved' ${item.status === 'approved' ? 'selected' : ''}>approved</option>
          <option value='rejected' ${item.status === 'rejected' ? 'selected' : ''}>rejected</option>
        </select>
      </td>
      <td>
        <button class='btn btn-sm btn-primary me-1' onclick='editItem("${item.id}")'>Edit</button>
        <button class='btn btn-sm btn-danger' onclick='deleteItem("${item.id}")'>Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function updateStatus(select, id) {
  const newStatus = select.value;
  fetch(`/api/deals-user/` + id, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: "Bearer " + (localStorage.getItem("token") || sessionStorage.getItem("token"))
    },
    body: JSON.stringify({ status: newStatus })
  })
    .then(res => res.json())
    .then(data => console.log("Status updated:", data))
    .catch(err => console.error("Error updating status:", err));
}

function exportCSV() {
  alert("Export to CSV not implemented yet.");
}

function openNewForm() {
  alert("New entry form not implemented.");
}

function filterTable(query) {
  query = query.toLowerCase();
  const rows = document.querySelectorAll("#deal-list tr");
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(query) ? "" : "none";
  });
}

function editItem(id) {
  alert("Edit feature for ID " + id + " not yet implemented.");
}

function deleteItem(id) {
  alert("Delete feature for ID " + id + " not yet implemented.");
}
