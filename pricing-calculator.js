// branding-shop-frontend/pricing-calculator.js

/**
 * Real-time pricing calculator for the Quote form.
 * Exposes calculatePrice() on window so other scripts can call it.
 * Relies on fetchJSON(path, opts) from script-user.js for auth headers.
 */

// 1) Define calculatePrice globally
async function calculatePrice() {
  const productSelect    = document.getElementById('product-select');
  const quantityInput    = document.getElementById('quantity-input');
  const unitPriceDisplay = document.getElementById('unit-price-display');
  const totalPriceDisplay= document.getElementById('total-price-display');

  // Bail if form not present
  if (!productSelect || !quantityInput || !unitPriceDisplay || !totalPriceDisplay) {
    return;
  }

  const payload = {
    product_id: parseInt(productSelect.value, 10) || null,
    quantity:   parseInt(quantityInput.value, 10) || 0
  };

  if (!payload.product_id || payload.quantity < 1) {
    unitPriceDisplay.textContent  = '0.00';
    totalPriceDisplay.textContent = '0.00';
    return;
  }

  try {
    // fetchJSON defined in script-user.js, includes API_BASE and auth headers
    const { unitPrice, total } = await fetchJSON(
      '/pricing-rules/calc',
      { method: 'POST', body: JSON.stringify(payload) }
    );
    unitPriceDisplay.textContent  = unitPrice.toFixed(2);
    totalPriceDisplay.textContent = total.toFixed(2);
  } catch (err) {
    console.error('Pricing calculation error:', err);
    // leave last values or zeros
  }
}

// 2) Wire calculatePrice to the form inputs once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const productSelect = document.getElementById('product-select');
  const quantityInput = document.getElementById('quantity-input');

  if (productSelect && quantityInput) {
    productSelect.addEventListener('change', calculatePrice);
    quantityInput.addEventListener('input', calculatePrice);
    // initial calculation
    calculatePrice();
  }
});

// Expose globally
window.calculatePrice = calculatePrice;
