// branding-shop-frontend/pricing-calculator.js

async function calculatePrice() {
  const productSelect    = document.getElementById('product-select');
  const quantityInput    = document.getElementById('quantity-input');
  const unitPriceDisplay = document.getElementById('unit-price-display');
  const totalPriceDisplay= document.getElementById('total-price-display');

  if (!productSelect || !quantityInput) return;

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
    const { unitPrice, total } = await fetchJSON(
      '/pricing-rules/calc',
      { method: 'POST', body: JSON.stringify(payload) }
    );
    unitPriceDisplay.textContent  = unitPrice.toFixed(2);
    totalPriceDisplay.textContent = total.toFixed(2);
  } catch (err) {
    console.error(err);
  }
}

window.calculatePrice = calculatePrice;

document.addEventListener('DOMContentLoaded', () => {
  const prod = document.getElementById('product-select');
  const qty  = document.getElementById('quantity-input');
  if (prod && qty) {
    prod.addEventListener('change', calculatePrice);
    qty.addEventListener('input', calculatePrice);
    calculatePrice();
  }
});
