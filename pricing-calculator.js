// branding-shop-frontend/pricing-calculator.js

/**
 * Real-time pricing calculator for the Quote form.
 * Hooks into the global fetchJSON helper to include auth headers.
 * Does nothing on other views.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Element references
  const productSelect     = document.getElementById('product-select');
  const quantityInput     = document.getElementById('quantity-input');
  const materialCostInput = document.getElementById('material-cost-input');
  const laborCostInput    = document.getElementById('labor-cost-input');
  const shippingCostInput = document.getElementById('shipping-cost-input');
  const unitPriceDisplay  = document.getElementById('unit-price-display');
  const totalPriceDisplay = document.getElementById('total-price-display');

  // Only proceed if we're on the Quote form view
  if (!productSelect || !quantityInput || !unitPriceDisplay || !totalPriceDisplay) {
    return;
  }

  // Attach input listeners to update price on any change
  [
    productSelect,
    quantityInput,
    materialCostInput,
    laborCostInput,
    shippingCostInput
  ].forEach(el => {
    if (el) el.addEventListener('input', calculatePrice);
  });

  // Initial calculation
  calculatePrice();

  async function calculatePrice() {
    // Build calculator payload
    const payload = {
      product_id:    parseInt(productSelect.value, 10)    || null,
      quantity:      parseInt(quantityInput.value, 10)    || 0,
      material_cost: parseFloat(materialCostInput.value)  || 0,
      labor_cost:    parseFloat(laborCostInput.value)     || 0,
      shipping_cost: parseFloat(shippingCostInput.value)  || 0
    };

    // If no valid product or quantity, reset displays
    if (!payload.product_id || payload.quantity < 1) {
      unitPriceDisplay.textContent  = '0.00';
      totalPriceDisplay.textContent = '0.00';
      return;
    }

    try {
      // Use the global fetchJSON to include headers and proper base URL
      const { unitPrice, total } = await fetchJSON(
        '/pricing-rules/calc',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );

      // Update the UI with returned values
      unitPriceDisplay.textContent  = unitPrice.toFixed(2);
      totalPriceDisplay.textContent = total.toFixed(2);
    } catch (err) {
      console.error('Pricing calculation error:', err);
      // Keep previous values or zeros, and optionally show an inline error
    }
  }
});
