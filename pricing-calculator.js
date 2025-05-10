// branding-shop-frontend/pricing-calculator.js

(async function() {
  // —— Element refs ——
  const productSelect       = document.getElementById('product-select');
  const quantityInput       = document.getElementById('quantity-input');
  const materialCostInput   = document.getElementById('material-cost-input');
  const laborCostInput      = document.getElementById('labor-cost-input');
  const shippingCostInput   = document.getElementById('shipping-cost-input');
  const unitPriceDisplay    = document.getElementById('unit-price-display');
  const totalPriceDisplay   = document.getElementById('total-price-display');

  // —— Listen for any change —— 
  [productSelect, quantityInput, materialCostInput, laborCostInput, shippingCostInput]
    .forEach(el => el.addEventListener('input', calculate));

  // —— Initial calculation on load ——
  window.addEventListener('DOMContentLoaded', calculate);

  // —— Calculation function ——
  async function calculate() {
    const payload = {
      product_id:    parseInt(productSelect.value, 10),
      quantity:      parseInt(quantityInput.value, 10)      || 0,
      material_cost: parseFloat(materialCostInput.value)    || 0,
      labor_cost:    parseFloat(laborCostInput.value)       || 0,
      shipping_cost: parseFloat(shippingCostInput.value)    || 0
    };

    // if no product selected yet
    if (!payload.product_id || payload.quantity < 1) {
      unitPriceDisplay.textContent = '0.00';
      totalPriceDisplay.textContent = '0.00';
      return;
    }

    try {
      const res = await fetch('https://branding-shop-backend.onrender.com/api/pricing-rules/calc', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Calc failed: ${res.statusText}`);

      const { unitPrice, total } = await res.json();

      unitPriceDisplay.textContent  = unitPrice.toFixed(2);
      totalPriceDisplay.textContent = total.toFixed(2);

    } catch (err) {
      console.error('Pricing calculation error:', err);
      // optionally display an inline error to the user here
    }
  }
})();
