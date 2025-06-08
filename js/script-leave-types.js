// script-leave-types.js

document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();

  document.getElementById("searchInput").addEventListener("input", () => loadLeaveTypes(1));
  document.getElementById("leaveTypeForm").addEventListener("submit", handleSubmit);

  loadLeaveTypes();
});

let currentPage = 1;

async function loadLeaveTypes(page = 1) {
  currentPage = page;
  const search = document.getElementById("searchInput").value.trim();
  try {
    const res = await fetchWithAuth(`/api/leave-types?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const result = await res.json();
    const data = Array.isArray(result.data) ? result.data : [];
    renderLeaveTypes(data);
    renderPagination(result.total || data.length, "pagination-container", loadLeaveTypes, 10, page);
  } catch (err) {
    console.error("Failed to load leave types:", err);
  }
}

function renderLeaveTypes(list) {
  const tbody = document.getElementById("leave-types-table-body");
  tbody.innerHTML = "";
  list.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.description || ""}</td>
      <td>${item.default_allocation}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick='viewLeaveType(${JSON.stringify(item)})'>View</button>
        <button class="btn btn-sm btn-primary" onclick='editLeaveType(${JSON.stringify(item)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick='deleteLeaveType(${item.id})'>Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editLeaveType(data) {
  document.getElementById("leave-type-id").value = data.id;
  document.getElementById("name").value = data.name;
  document.getElementById("description").value = data.description;
  document.getElementById("default_allocation").value = data.default_allocation;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("leaveTypeModal")).show();
}

function viewLeaveType(data) {
  const body = document.getElementById("view-body");
  body.innerHTML = `
    <table class="table">
      <tr><th>Name</th><td>${data.name}</td></tr>
      <tr><th>Description</th><td>${data.description || ""}</td></tr>
      <tr><th>Default Allocation</th><td>${data.default_allocation}</td></tr>
    </table>
  `;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("viewModal")).show();
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("leave-type-id").value;
  const payload = {
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    default_allocation: parseInt(document.getElementById("default_allocation").value)
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/leave-types/${id}` : "/api/leave-types";
    await fetchWithAuth(url, { method, body: JSON.stringify(payload) });
    bootstrap.Modal.getInstance(document.getElementById("leaveTypeModal")).hide();
    document.getElementById("leaveTypeForm").reset();
    loadLeaveTypes(currentPage);
  } catch (err) {
    console.error("Submit failed:", err);
  }
}

async function deleteLeaveType(id) {
  if (!confirm("Delete this leave type?")) return;
  try {
    await fetchWithAuth(`/api/leave-types/${id}`, { method: "DELETE" });
    loadLeaveTypes(currentPage);
  } catch (err) {
    console.error("Delete error:", err);
  }
}

function printDiv(divId) {
  const content = document.getElementById(divId).innerHTML;
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Print</title>');
  printWindow.document.write('</head><body >');
  printWindow.document.write(content);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}
