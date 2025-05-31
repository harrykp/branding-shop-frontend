
document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("product-list");
  const res = await fetch("/api/products");
  const data = await res.json();

  list.innerHTML = "";
  data.forEach(product => {
    const div = document.createElement("div");
    div.className = "col-md-4";
    div.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.description || ''}</p>
          <p class="card-text">GHS ${product.unit_price}</p>
        </div>
      </div>
    `;
    list.appendChild(div);
  });
});
