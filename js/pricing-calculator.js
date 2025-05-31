
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quote-form");
  const totalField = document.getElementById("quote-total");

  async function calculateTotal() {
    const formData = new FormData(form);
    const payload = {
      product_id: formData.get("product_id"),
      quantity: parseInt(formData.get("quantity")),
      print_type: formData.get("print_type")
    };
    const res = await fetch("/api/pricing-rules/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    totalField.textContent = `Total: GHS ${data.total}`;
  }

  form.addEventListener("change", calculateTotal);
});
