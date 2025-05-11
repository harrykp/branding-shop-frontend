// branding-shop-frontend/pricing-calculator.js

/**
 * Real-time pricing calculator for the Quote form.
 * Only shows Product, Quantity, Unit Price, and Total Price.
 * Fetches pricing rules and calculates total on the backend.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Element references
  const productSelect    = document.getElementById('product-select');
  const quantityInput    = document.getElementById('quantity-input');
  const unitPriceDisplay = document.getElementById('unit-price-display');
  const totalPriceDisplay = document.getElementById('total-price-display');

  // Bail if not on the quote form view
  if (!productSelect || !quantityInput || !unitPriceDisplay || !totalPriceDisplay) {
    return;
  }

  // Recalculate on changes
  [productSelect, quantityInput].forEach(el => el.addEventListener('input', calculatePrice));

  // Initial calculation
  calculatePrice();

  async function calculatePrice() {
    const payload = {
      product_id: parseInt(productSelect.value, 10) || null,
      quantity:   parseInt(quantityInput.value, 10) || 0
    };

    // Reset if invalid
    if (!payload.product_id || payload.quantity < 1) {
      unitPriceDisplay.textContent  = '0.00';
      totalPriceDisplay.textContent = '0.00';
      return;
    }

    try {
      // Use global fetchJSON (includes auth headers & base URL)
      const { unitPrice, total } = await fetchJSON(
        '/pricing-rules/calc',
        { method: 'POST', body: JSON.stringify(payload) }
      );
      unitPriceDisplay.textContent  = unitPrice.toFixed(2);
      totalPriceDisplay.textContent = total.toFixed(2);
    } catch (err) {
      console.error('Pricing calculation error:', err);
      // Keep displays at last known values or zeros
    }
  }
});
