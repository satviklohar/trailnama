const WHATSAPP = "918003742763";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const waLink = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

/* ---------- mobile menu ---------- */
const menuBtn = document.querySelector(".menu-btn");
const links = document.getElementById("links");
function setMenu(open) {
  links.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
}
menuBtn.addEventListener("click", e => { e.stopPropagation(); setMenu(!links.classList.contains("open")); });
links.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("click", e => { if (links.classList.contains("open") && !links.contains(e.target)) setMenu(false); });

/* ---------- "Get a quote" picks the trip and highlights the form ---------- */
const form = document.getElementById("enquiry");
document.querySelectorAll("[data-trip]").forEach(a => {
  a.addEventListener("click", () => {
    document.getElementById("trip-field").value = a.dataset.trip;
    form.classList.remove("flash");
    setTimeout(() => form.classList.add("flash"), 500);
    setTimeout(() => form.classList.remove("flash"), 2300);
  });
});

/* ---------- enquiry form -> WhatsApp ---------- */
const note = document.getElementById("form-note");
form.addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  const name = f.name.value.trim();
  const phone = f.phone.value.trim();
  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  f.name.setAttribute("aria-invalid", !name);
  f.phone.setAttribute("aria-invalid", !phoneOk);
  if (!name || !phoneOk) {
    note.textContent = !name ? "Please add your name." : "Please add a phone number with at least 10 digits.";
    note.classList.add("error");
    (!name ? f.name : f.phone).focus();
    return;
  }
  note.classList.remove("error");
  const lines = ["Hi Trailnama Adventures, I'd like to enquire about a trip.", "", `Name: ${name}`, `Phone: ${phone}`];
  if (f.email.value.trim()) lines.push(`Email: ${f.email.value.trim()}`);
  if (f.trip.value) lines.push(`Trip: ${f.trip.value}`);
  if (f.dates.value.trim()) lines.push(`When: ${f.dates.value.trim()}`);
  if (f.size.value) lines.push(`People: ${f.size.value}`);
  if (f.message.value.trim()) lines.push("", f.message.value.trim());
  note.textContent = "Opening WhatsApp…";
  location.href = waLink(lines.join("\n"));
});
form.addEventListener("input", e => {
  if (e.target.getAttribute("aria-invalid") === "true") e.target.removeAttribute("aria-invalid");
});

/* ---------- hero planner -> WhatsApp ---------- */
const plDate = document.getElementById("pl-date");
plDate.min = new Date().toISOString().slice(0, 10);
document.getElementById("planner").addEventListener("submit", e => {
  e.preventDefault();
  const trip = document.getElementById("pl-trip").value;
  const lines = ["Hi Trailnama Adventures, I'd like to check availability."];
  if (trip) lines.push(`Trip: ${trip}`);
  if (plDate.value) lines.push(`Preferred date: ${new Date(plDate.value + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`);
  window.open(waLink(lines.join("\n")), "_blank", "noopener");
});

document.getElementById("yr").textContent = new Date().getFullYear();

/* ---------- reveal on scroll, staggered within each group ---------- */
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".section .wrap > *:not(.cards):not(.gallery):not(.steps), .card, .g-item, .steps li, .checks li, .contact-list li")
    .forEach(el => {
      const i = [...el.parentElement.children].indexOf(el);
      el.style.setProperty("--d", Math.min(i, 6) * 0.08 + "s");
      el.classList.add("fade");
      io.observe(el);
    });
}

/* ---------- highlight the menu link for the section on screen ---------- */
const navLinks = [...document.querySelectorAll('.links a[href^="#"]:not(.btn)')];
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach(a => { const t = document.querySelector(a.getAttribute("href")); if (t) spy.observe(t); });
}

/* ---------- scroll effects: nav, progress bar, altitude, floating buttons, hero parallax ---------- */
const nav = document.querySelector(".nav");
const bar = document.querySelector(".progress i");
const altEl = document.getElementById("alt");
const altLabel = document.getElementById("alt-label");
const hero = document.querySelector(".hero");
const layers = [[".m1", 0.07], [".m2", 0.13], [".sun", 0.2]].map(([s, k]) => [document.querySelector(s), k]);
const stages = [[0, "Base camp"], [0.2, "Forest trail"], [0.4, "Tree line"], [0.6, "High ridge"], [0.8, "Snow line"], [0.97, "Summit!"]];
const SUMMIT = 5364; // just for fun, not a real peak
let ticking = false;
function onScroll() {
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(y / max, 1) : 0;
  nav.classList.toggle("scrolled", y > 20);
  document.body.classList.toggle("floats", y > 240);
  bar.style.width = p * 100 + "%";
  altEl.textContent = Math.round(p * SUMMIT).toLocaleString("en-IN");
  altLabel.textContent = stages.filter(s => p >= s[0]).pop()[1];
  if (!reduce && y < hero.offsetHeight) layers.forEach(([el, k]) => { if (el) el.style.transform = `translateY(${y * k}px)`; });
  ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener("resize", onScroll);
onScroll();

/* ---------- hide floating buttons while a form is on screen (they would cover it on phones) ---------- */
if ("IntersectionObserver" in window) {
  const near = new Set();
  const formWatch = new IntersectionObserver(entries => {
    entries.forEach(en => en.isIntersecting ? near.add(en.target) : near.delete(en.target));
    document.body.classList.toggle("near-form", near.size > 0);
  }, { threshold: 0.15 });
  formWatch.observe(form);
}

/* ---------- founder card ---------- */
const fab = document.getElementById("founder-fab");
const pop = document.getElementById("founder-pop");
function setPop(open) {
  pop.hidden = !open;
  fab.setAttribute("aria-expanded", open);
  if (open) pop.querySelector("a").focus({ preventScroll: true });
}
fab.addEventListener("click", e => { e.stopPropagation(); setPop(pop.hidden); });
document.addEventListener("click", e => { if (!pop.hidden && !pop.contains(e.target)) setPop(false); });
addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!pop.hidden) { setPop(false); fab.focus(); }
  if (links.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
});
