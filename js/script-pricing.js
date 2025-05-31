
document.addEventListener("DOMContentLoaded", async () => {
  requireAdmin();
  const tableBody = document.querySelector("#pricing-table tbody");

  async function loadPricingRules() {
    const res = await fetchWithAuth("/api/pricing-rules");
    const rules = await res.json();

    tableBody.innerHTML = "";
    rules.forEach(rule => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${rule.category}</td>
        <td>${rule.min_quantity}</td>
        <td>${rule.max_quantity}</td>
        <td>${rule.unit_price}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editRule('${rule.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRule('${rule.id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.editRule = (id) => alert("Edit pricing rule: " + id);
  window.deleteRule = async (id) => {
    if (confirm("Delete this rule?")) {
      await fetchWithAuth("/api/pricing-rules/" + id, { method: "DELETE" });
      loadPricingRules();
    }
  };

  loadPricingRules();
});
