// Year in footer
document.querySelectorAll("#year").forEach(el => el.textContent = new Date().getFullYear());

// Mobile nav (simple toggle)
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.style.display === "flex";
    nav.style.display = open ? "none" : "flex";
    nav.style.flexDirection = "column";
    nav.style.gap = "12px";
    nav.style.background = "rgba(11,12,16,.92)";
    nav.style.position = "absolute";
    nav.style.right = "4vw";
    nav.style.top = "56px";
    nav.style.padding = "12px";
    nav.style.border = "1px solid rgba(255,255,255,.10)";
    nav.style.borderRadius = "14px";
    toggle.setAttribute("aria-expanded", String(!open));
  });
}

// Pre-fill quote form from query params
(function prefill() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const product = params.get("product");
  const pkg = params.get("package");

  const productSelect = document.getElementById("productSelect");
  if (product && productSelect) {
    // best-effort match
    for (const opt of productSelect.options) {
      if (opt.value === product || opt.text === product) {
        productSelect.value = opt.value || opt.text;
        break;
      }
    }
  }

  if (pkg) {
    const notes = form.querySelector('textarea[name="notes"]');
    if (notes && !notes.value) notes.value = `Interested in: ${pkg}\n`;
  }
})();

// Form submit: Formspree if configured, else fallback to mailto
(function quoteSubmit() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const status = document.getElementById("formStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const endpoint = window.IBZ3D_FORMSPREE_ENDPOINT;
    const fd = new FormData(form);

    // If no backend configured, open mailto with text (no file attachment)
    if (!endpoint) {
      const lines = [];
      fd.forEach((v, k) => {
        if (k === "attachment") return;
        lines.push(`${k}: ${v}`);
      });
      const body = encodeURIComponent(lines.join("\n"));
      window.location.href = `mailto:sales@ibz3d.ca?subject=IBZ3D Quote Request&body=${body}`;
      return;
    }

    try {
      status.textContent = "Sending…";

      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
        headers: { "Accept": "application/json" }
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Request failed.");
      }

      form.reset();
      status.textContent = "Thanks — we’ll reply within 24 hours with pricing and a mockup.";
    } catch (err) {
      status.textContent = "Something went wrong. Please email sales@ibz3d.ca instead.";
    }
  });
})();
