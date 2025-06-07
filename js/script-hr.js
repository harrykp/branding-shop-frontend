document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  await includeHTML();

  populateSelect("users/options", "user_id");
  populateSelect("departments", "department_id");

  document.getElementById("searchInput").addEventListener("input", () => loadHR(1));
  document.getElementById("hrForm").addEventListener("submit", handleSubmit);

  loadHR();
});

let currentPage = 1;

async function loadHR(page = 1) {
  currentPage = page;
  const search = document.getElementById("searchInput").value.trim();
  try {
    const res = await fetchWithAuth(`/api/hr_info?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const result = await res.json();
    const hr = Array.isArray(result.data) ? result.data : [];
    renderHR(hr);
    renderPagination(result.total || hr.length, "pagination-container", loadHR, 10, page);
  } catch (err) {
    console.error("Failed to load HR:", err);
  }
}

function renderHR(hrList) {
  const tbody = document.getElementById("hr-table-body");
  tbody.innerHTML = "";
  hrList.forEach(hr => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${hr.photo_url || '/placeholder.png'}" width="50"/></td>
      <td>${hr.employee_name || ""}</td>
      <td>${hr.department_name || ""}</td>
      <td>${hr.position || ""}</td>
      <td>${hr.employment_type || ""}</td>
      <td>${hr.start_date?.split("T")[0] || ""}</td>
      <td>${hr.end_date?.split("T")[0] || ""}</td>
      <td>${hr.salary || ""}</td>
      <td>${hr.ssnit_number || ""}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="viewHR(${hr.id})">View</button>
        <button class="btn btn-sm btn-primary" onclick='editHR(${JSON.stringify(hr)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteHR(${hr.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editHR(hr) {
  document.getElementById("hr-id").value = hr.id;
  [
    "user_id", "department_id", "position", "employment_type", "salary",
    "bank_account", "ssnit_number", "tin_number", "nhis_number", "photo_url",
    "next_of_kin_name", "next_of_kin_phone", "next_of_kin_relationship", "notes"
  ].forEach(id => document.getElementById(id).value = hr[id] || "");

  ["start_date", "end_date"].forEach(id => {
    document.getElementById(id).value = hr[id]?.split("T")[0] || "";
  });

  bootstrap.Modal.getOrCreateInstance(document.getElementById("hrModal")).show();
}

async function viewHR(id) {
  try {
    const res = await fetchWithAuth(`/api/hr_info/${id}`);
    const hr = await res.json();
    const body = document.getElementById("view-hr-body");
    body.innerHTML = `
      <table class="table">
        <tr><th>Employee</th><td>${hr.employee_name || ""}</td></tr>
        <tr><th>Department</th><td>${hr.department_name || ""}</td></tr>
        <tr><th>Position</th><td>${hr.position || ""}</td></tr>
        <tr><th>Employment Type</th><td>${hr.employment_type || ""}</td></tr>
        <tr><th>Start Date</th><td>${hr.start_date?.split("T")[0] || ""}</td></tr>
        <tr><th>End Date</th><td>${hr.end_date?.split("T")[0] || ""}</td></tr>
        <tr><th>Salary</th><td>${hr.salary || ""}</td></tr>
        <tr><th>Bank Account</th><td>${hr.bank_account || ""}</td></tr>
        <tr><th>SSNIT</th><td>${hr.ssnit_number || ""}</td></tr>
        <tr><th>TIN</th><td>${hr.tin_number || ""}</td></tr>
        <tr><th>NHIS</th><td>${hr.nhis_number || ""}</td></tr>
        <tr><th>Photo</th><td><img src="${hr.photo_url || '/placeholder.png'}" width="100"/></td></tr>
        <tr><th>Next of Kin</th><td>${hr.next_of_kin_name || ""} (${hr.next_of_kin_relationship || ""}) - ${hr.next_of_kin_phone || ""}</td></tr>
        <tr><th>Notes</th><td>${hr.notes || ""}</td></tr>
      </table>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("viewModal")).show();
  } catch (err) {
    console.error("View error:", err);
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("hr-id").value;
  const payload = {
    user_id: document.getElementById("user_id").value,
    department_id: document.getElementById("department_id").value,
    position: document.getElementById("position").value,
    employment_type: document.getElementById("employment_type").value,
    start_date: document.getElementById("start_date").value,
    end_date: document.getElementById("end_date").value,
    salary: document.getElementById("salary").value,
    bank_account: document.getElementById("bank_account").value,
    ssnit_number: document.getElementById("ssnit_number").value,
    tin_number: document.getElementById("tin_number").value,
    nhis_number: document.getElementById("nhis_number").value,
    photo_url: document.getElementById("photo_url").value,
    next_of_kin_name: document.getElementById("next_of_kin_name").value,
    next_of_kin_phone: document.getElementById("next_of_kin_phone").value,
    next_of_kin_relationship: document.getElementById("next_of_kin_relationship").value,
    notes: document.getElementById("notes").value
  };

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/hr_info/${id}` : "/api/hr_info";
    await fetchWithAuth(url, { method, body: JSON.stringify(payload) });
    bootstrap.Modal.getInstance(document.getElementById("hrModal")).hide();
    document.getElementById("hrForm").reset();
    loadHR(currentPage);
  } catch (err) {
    console.error("Submit failed:", err);
  }
}

async function deleteHR(id) {
  if (!confirm("Delete HR record?")) return;
  try {
    await fetchWithAuth(`/api/hr_info/${id}`, { method: "DELETE" });
    loadHR(currentPage);
  } catch (err) {
    console.error("Delete error:", err);
  }
}
