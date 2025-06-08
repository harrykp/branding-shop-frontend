// js/includes.js

async function includeHTML() {
  const elements = document.querySelectorAll("[w3-include-html]");
  for (const el of elements) {
    const file = el.getAttribute("w3-include-html");
    if (!file) continue;

    try {
      const res = await fetch(file);
      const text = await res.text();
      el.innerHTML = text;
      el.removeAttribute("w3-include-html");
    } catch (e) {
      el.innerHTML = "Navigation failed to load.";
    }
  }

  await injectNavLinks();
}

async function injectNavLinks() {
  const user = getCurrentUser();
  if (!user) return;

  const isAdmin = user.roles.includes("admin");
  const navId = isAdmin ? "admin-nav-links" : "user-nav-links";
  const container = document.getElementById(navId);
  if (!container) return;

  const navGroups = isAdmin ? {
    "Core": {
      "Dashboard": "admin.html",
      "Users": "admin-users.html",
      "Roles": "admin-roles.html"
    },
    "CRM": {
      "Leads": "admin-leads.html",
      "Deals": "admin-deals.html",
      "Customers": "admin-customers.html",
      "Quotes": "admin-quotes.html",
      "Orders": "admin-orders.html"
    },
    "Production": {
      "Products": "admin-products.html",
      "Catalog": "admin-catalog.html",
      "Production": "admin-production.html",
      "Purchase Orders": "admin-purchase-orders.html",
      "Suppliers": "admin-suppliers.html"
    },
    "HR": {
      "HR Info": "admin-hr.html",
      "Leave Types": "admin-leave-types.html"
    },
    "Finance": {
      "Payments": "admin-payments.html",
      "Commissions": "admin-commissions.html",
      "Finance": "admin-finance.html",
      "Pricing Rules": "admin-pricing.html"
    },
    "Reports": {
      "Reports": "admin-reports.html"
    }
  } : {
    "Main": {
      "Dashboard": "dashboard.html",
      "Customers": "customers.html",
      "Products": "products.html",
      "Quotes": "quotes.html",
      "Orders": "orders.html",
      "Production": "production.html"
    },
    "CRM": {
      "Leads": "leads.html",
      "Deals": "deals.html"
    },
    "HR": {
      "HR": "hr.html"
    },
    "Finance": {
      "Payments": "payments.html",
      "Commissions": "commissions.html",
      "Finance/Payments": "finance.html"
    },
    "Reports": {
      "Reports": "reports.html"
    }
  };

  for (const [group, links] of Object.entries(navGroups)) {
    const dropdown = document.createElement("li");
    dropdown.className = "nav-item dropdown";
    dropdown.innerHTML = `
      <a class="nav-link dropdown-toggle" href="#" id="${group}-dropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        ${group}
      </a>
      <ul class="dropdown-menu" aria-labelledby="${group}-dropdown">
        ${Object.entries(links).map(([label, href]) =>
          `<li><a class="dropdown-item" href="${href}">${label}</a></li>`).join('')}
      </ul>
    `;
    container.appendChild(dropdown);
  }

  // Display current user's email
  const emailSpan = document.getElementById(isAdmin ? "admin-user-email" : "user-email");
  if (emailSpan) emailSpan.textContent = user.email || "";
}
