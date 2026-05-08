// Toast helper
(function () {
  function host() {
    let el = document.getElementById("toast-host");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast-host";
      document.body.appendChild(el);
    }
    return el;
  }
  function toast(kind, msg) {
    const t = document.createElement("div");
    t.className = "toast " + kind;
    t.textContent = msg;
    host().appendChild(t);
    setTimeout(() => t.remove(), 4500);
  }
  window.Toast = {
    info: (m) => toast("info", m),
    success: (m) => toast("success", m),
    error: (m) => toast("error", m),
  };
})();

window.shortAddr = function (addr) {
  if (!addr) return "—";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
};

window.formatDate = function (ts) {
  const ms = Number(ts) * 1000;
  return new Date(ms).toLocaleString();
};

window.explorerTx = (h) => `${window.APP_CONFIG.EXPLORER}/tx/${h}`;
window.explorerAddr = (a) => `${window.APP_CONFIG.EXPLORER}/address/${a}`;

// Sidebar + topbar injection
window.renderShell = function ({ title, active }) {
  const NAV = [
    { href: "admin.html", id: "admin", label: "Admin", icon: "users" },
    { href: "manufacturer.html", id: "manufacturer", label: "Manufacturer", icon: "layout-dashboard" },
    { href: "products-new.html", id: "register", label: "Register", icon: "plus-circle" },
    { href: "scan.html", id: "scan", label: "Scan QR", icon: "qr-code" },
    { href: "verify.html", id: "verify", label: "Verify", icon: "shield-check" },
  ];
  const sidebar = document.querySelector("[data-sidebar]");
  if (sidebar) {
    sidebar.innerHTML = `
      <a href="index.html" style="display:flex;align-items:center;gap:.5rem;margin-bottom:2rem;padding:0 .5rem;color:white;text-decoration:none;">
        <i data-lucide="link-2" style="width:1.5rem;height:1.5rem;color:#3b82f6"></i>
        <span style="font-weight:600">Supply Verify</span>
      </a>
      <nav style="display:flex;flex-direction:column;gap:.25rem">
        ${NAV.map(n => `
          <a href="${n.href}" class="nav-item ${active === n.id ? "active" : ""}">
            <i data-lucide="${n.icon}" style="width:1rem;height:1rem"></i>
            ${n.label}
          </a>`).join("")}
      </nav>
      <div style="margin-top:auto;padding:0 .5rem;font-size:.75rem;color:#64748b">v0.1</div>
    `;
  }
  const topbar = document.querySelector("[data-topbar]");
  if (topbar) {
    topbar.innerHTML = `
      <h1 style="font-size:1.125rem;font-weight:600;color:#f1f5f9">${title}</h1>
      <div data-wallet-button></div>
    `;
  }
  if (window.lucide) window.lucide.createIcons();
};

// Yellow banner shown when CONTRACT_ADDRESS is not configured.
window.renderConfigBanner = function () {
  if (window.isContractConfigured && window.isContractConfigured()) return;
  const main = document.querySelector(".app-main") || document.querySelector("main") || document.body;
  if (main.querySelector("#config-banner")) return;
  const div = document.createElement("div");
  div.id = "config-banner";
  div.style.cssText = "background:#78350f;border:1px solid #b45309;color:#fef3c7;padding:.75rem 1rem;border-radius:.5rem;margin-bottom:1rem;font-size:.875rem;display:flex;gap:.75rem;align-items:flex-start;";
  div.innerHTML = `
    <i data-lucide="info" style="width:1.25rem;height:1.25rem;flex-shrink:0;color:#fbbf24"></i>
    <div>
      <strong>Demo not connected to a deployed contract.</strong>
      Deploy <code style="background:#451a03;padding:.1rem .3rem;border-radius:.25rem">contracts/SupplyChain.sol</code>
      to Sepolia and set <code style="background:#451a03;padding:.1rem .3rem;border-radius:.25rem">CONTRACT_ADDRESS</code>
      in <code style="background:#451a03;padding:.1rem .3rem;border-radius:.25rem">js/config.js</code>.
      Wallet connect, navigation, and form UI still work; chain reads/writes will fail until configured.
    </div>`;
  main.insertBefore(div, main.firstChild);
  if (window.lucide) window.lucide.createIcons();
  // Auto-show config banner on dashboard pages
  setTimeout(() => window.renderConfigBanner && window.renderConfigBanner(), 0);
};

window.statusBadge = function (status) {
  const label = window.STATUS_LABELS[Number(status)] || "Unknown";
  return `<span class="badge badge-${Number(status)}">${label}</span>`;
};

window.renderTimeline = function (checkpoints) {
  if (!checkpoints || !checkpoints.length) {
    return `<p style="font-size:.875rem;color:#94a3b8">No checkpoints yet.</p>`;
  }
  return `<ol class="timeline">${checkpoints.map(c => `
    <li>
      <div class="card" style="padding:1rem">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem">
          ${window.statusBadge(c.status)}
          <time style="font-size:.75rem;color:#64748b">${window.formatDate(c.timestamp)}</time>
        </div>
        <div style="margin-top:.5rem;display:flex;gap:.5rem;align-items:center;font-size:.875rem;color:#cbd5e1">
          <i data-lucide="map-pin" style="width:1rem;height:1rem;color:#64748b"></i>
          <span style="font-weight:500">${c.location || "—"}</span>
        </div>
        ${c.note ? `<p style="margin-top:.25rem;font-size:.875rem;color:#94a3b8">${c.note}</p>` : ""}
        <div style="margin-top:.5rem;font-size:.75rem;color:#64748b">
          Actor: <a href="${window.explorerAddr(c.actor)}" target="_blank" rel="noreferrer" style="color:#60a5fa;text-decoration:none">${window.shortAddr(c.actor)}</a>
        </div>
      </div>
    </li>`).join("")}</ol>`;
};
