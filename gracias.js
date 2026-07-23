const CFG = window.EGREGOR_CONFIG || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let lead = {};
try { lead = JSON.parse(sessionStorage.getItem("egregorLead") || "{}"); } catch (e) { lead = {}; }

if (lead.nombre) {
  const first = String(lead.nombre).trim().split(" ")[0];
  const nameEl = $("[data-name]");
  if (nameEl && first) nameEl.textContent = `, ${first}`;
}

["nombre", "email", "telefono", "audiencia", "nivel"].forEach(key => {
  const el = $(`[data-field="${key}"]`);
  if (el) el.textContent = lead[key] ? lead[key] : "—";
});

$$("[data-whatsapp]").forEach(el => el.addEventListener("click", e => {
  if (!/^https:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//i.test(CFG.whatsappUrl || "")) {
    e.preventDefault();
    alert("Falta configurar el número de WhatsApp validado en assets/js/config.js");
  } else {
    el.href = CFG.whatsappUrl;
  }
}));
