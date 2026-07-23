const CFG = window.EGREGOR_CONFIG || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---- Tema claro / oscuro ----
   El modo por defecto lo define el atributo data-theme ya presente en
   la etiqueta <html> de cada archivo (index.html = light, index-dark.html = dark).
   El botón solo alterna para la sesión actual de vista, sin persistir,
   así cada archivo conserva siempre su propio modo por defecto al recargar. */
const root = document.documentElement;
const themeToggle = $("[data-theme-toggle]");
function applyTheme(t) {
  root.setAttribute("data-theme", t);
  if (themeToggle) themeToggle.innerHTML = t === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}
applyTheme(root.getAttribute("data-theme") || "light");
themeToggle?.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
});

/* ---- Navbar: se contrae ligeramente al hacer scroll ---- */
const navShell = $(".nav-shell");
addEventListener("scroll", () => {
  navShell?.classList.toggle("scrolled", scrollY > 20);
}, { passive: true });

/* ---- Mobile menu ---- */
const mobileBtn = $(".menu-btn"), mobileMenu = $(".mobile-menu");
mobileBtn?.addEventListener("click", () => {
  const open = mobileMenu?.classList.toggle("open");
  mobileBtn.setAttribute("aria-expanded", String(open));
  mobileBtn.innerHTML = open ? "✕" : "☰";
});
$$(".mobile-menu a").forEach(a => a.addEventListener("click", () => mobileMenu?.classList.remove("open")));

/* ---- Modal: se abre al hacer click en un CTA y también al llegar al final del scroll ---- */
const modal = $("#leadModal");
let bottomLatch = false, ticking = false;

function openModal() {
  modal?.classList.add("open");
  modal?.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  mobileMenu?.classList.remove("open");
  setTimeout(() => $("#leadName")?.focus(), 100);
}
function closeModal() {
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}
$$("[data-open-modal]").forEach(b => b.addEventListener("click", (e) => { e.preventDefault(); openModal(); }));
$$("[data-close-modal]").forEach(b => b.addEventListener("click", closeModal));
addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function checkBottom() {
  const atBottom = Math.ceil(innerHeight + scrollY) >= document.documentElement.scrollHeight - 24;
  if (atBottom && !bottomLatch && !modal?.classList.contains("open")) {
    bottomLatch = true;
    openModal();
  } else if (!atBottom) {
    bottomLatch = false;
  }
  ticking = false;
}
addEventListener("scroll", () => {
  if (!ticking) { requestAnimationFrame(checkBottom); ticking = true; }
}, { passive: true });

/* ---- FAQ accordion ---- */
$$(".faq-btn").forEach(btn => btn.addEventListener("click", () => {
  const item = btn.closest(".faq-item");
  item.parentElement.querySelectorAll(".faq-item.active").forEach(x => {
    if (x !== item) { x.classList.remove("active"); x.querySelector(".faq-btn")?.setAttribute("aria-expanded", "false"); }
  });
  const open = item.classList.toggle("active");
  btn.setAttribute("aria-expanded", String(open));
}));

/* ---- Program tabs ---- */
const moduleButtons = $$(".program-btn");
const panelTag = $("[data-program-tag]");
const panelTitle = $("[data-program-title]");
const panelCopy = $("[data-program-copy]");
const panelImg = $("[data-program-img]");
moduleButtons.forEach(btn => btn.addEventListener("click", () => {
  moduleButtons.forEach(x => x.classList.remove("active"));
  btn.classList.add("active");
  if (panelTag) panelTag.textContent = btn.dataset.tag || "";
  if (panelTitle) panelTitle.textContent = btn.dataset.title || "";
  if (panelCopy) panelCopy.textContent = btn.dataset.copy || "";
  if (panelImg && btn.dataset.img) panelImg.setAttribute("src", btn.dataset.img);
}));

/* ---- Reveal on scroll ---- */
const observer = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
}), { threshold: .12 });
$$(".reveal").forEach(el => observer.observe(el));

/* ---- Lead form (demo frontend — conectar a CRM/HubSpot antes de publicar) ---- */
$$("[data-lead-form]").forEach(form => form.addEventListener("submit", e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form).entries());
  Object.assign(data, {
    programa: CFG.program,
    createdAt: new Date().toISOString()
  });
  sessionStorage.setItem("egregorLead", JSON.stringify(data));
  location.href = "gracias.html";
}));

/* ---- WhatsApp flotante: si aún no hay número validado, abre el popup en su lugar ---- */
$$("[data-whatsapp]").forEach(el => el.addEventListener("click", e => {
  if (!/^https:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//i.test(CFG.whatsappUrl || "")) {
    e.preventDefault();
    openModal();
  } else {
    el.href = CFG.whatsappUrl;
  }
}));

/* ---- Empresas: enlaza a la landing B2B validada, o queda como ancla pendiente ---- */
$$("[data-b2b]").forEach(el => {
  if (/^https?:\/\//i.test(CFG.b2bUrl || "")) el.href = CFG.b2bUrl;
});

/* ---- Aviso de privacidad ---- */
$$("[data-privacy]").forEach(el => {
  if (/^https?:\/\//i.test(CFG.privacyUrl || "")) el.href = CFG.privacyUrl;
});
