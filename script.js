/* Trailnama Adventures: shared script for every page. Each block checks its elements exist. */
const WHATSAPP = "918003742763";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = s => document.querySelector(s);
const waLink = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

/* ---------- opened straight from a computer (file://): make page links open each page's index.html ---------- */
if (location.protocol === "file:") {
  document.querySelectorAll("a[href]").forEach(a => {
    const href = a.getAttribute("href");
    if (/^(https?:|mailto:|tel:|#)/.test(href)) return;
    const m = href.match(/^([^?#]*)(.*)$/);
    if (m[1] === "" || m[1].endsWith("/")) a.setAttribute("href", m[1] + "index.html" + m[2]);
  });
}

/* ---------- home hero: the walker dot follows the drawn trail line exactly ---------- */
const walkPath = $(".walked");
const walker = $(".walker");
if (walkPath && walker && walkPath.getAnimations) {
  const len = walkPath.getTotalLength();
  const place = p => { const pt = walkPath.getPointAtLength(p * len); walker.setAttribute("transform", `translate(${pt.x} ${pt.y})`); };
  (function step() {
    const anim = walkPath.getAnimations().find(x => x.animationName === "draw");
    if (!anim) return place(1);
    place(Math.min(Math.max(((anim.currentTime || 0) - 3000) / 6000, 0), 1));
    if (anim.playState !== "finished") requestAnimationFrame(step);
  })();
}

/* ---------- mobile menu ---------- */
const menuBtn = $(".menu-btn");
const links = $("#links");
function setMenu(open) {
  links.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
  document.body.classList.toggle("menu-open", open);
}
addEventListener("resize", () => { if (innerWidth > 860 && links.classList.contains("open")) setMenu(false); });
menuBtn.addEventListener("click", e => { e.stopPropagation(); setMenu(!links.classList.contains("open")); });
links.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("click", e => { if (links.classList.contains("open") && !links.contains(e.target)) setMenu(false); });

/* ---------- contact form -> WhatsApp ---------- */
const form = $("#enquiry");
if (form) {
  // arriving from "Send an enquiry" on a trip: pick that trip and highlight the form
  const wanted = new URLSearchParams(location.search).get("trip");
  const tripField = $("#trip-field");
  if (wanted && tripField && [...tripField.options].some(o => o.value === wanted || o.text === wanted)) {
    tripField.value = wanted;
    setTimeout(() => form.classList.add("flash"), 700);
    setTimeout(() => form.classList.remove("flash"), 2500);
  }
  const note = $("#form-note");
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
}

/* ---------- home hero planner -> WhatsApp ---------- */
const planner = $("#planner");
if (planner) {
  const plDate = $("#pl-date");
  plDate.min = new Date().toISOString().slice(0, 10);
  planner.addEventListener("submit", e => {
    e.preventDefault();
    const trip = $("#pl-trip").value;
    const lines = ["Hi Trailnama Adventures, I'd like to check availability."];
    if (trip) lines.push(`Trip: ${trip}`);
    if (plDate.value) lines.push(`Preferred date: ${new Date(plDate.value + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
}

/* ---------- trips page: filter chips ---------- */
const chips = document.querySelectorAll(".chip[data-filter]");
chips.forEach(chip => chip.addEventListener("click", () => {
  chips.forEach(c => { c.classList.toggle("active", c === chip); c.setAttribute("aria-pressed", c === chip); });
  const f = chip.dataset.filter;
  document.querySelectorAll(".trip[data-kind]").forEach(t => { t.hidden = f !== "all" && t.dataset.kind !== f; });
}));

/* ---------- reveal on scroll, staggered within each group ---------- */
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".section .wrap > *:not(.cards):not(.gallery):not(.steps):not(.values):not(.ig-grid):not(.trip), .card, .g-item, .steps li, .checks li, .contact-list li, .trip, .value, .ig-tile")
    .forEach(el => {
      const i = [...el.parentElement.children].indexOf(el);
      el.style.setProperty("--d", Math.min(i, 6) * 0.08 + "s");
      el.classList.add("fade");
      io.observe(el);
    });
}

/* ---------- scroll effects: nav, progress bar, altitude, floating buttons, hero parallax ---------- */
const nav = $(".nav");
const bar = $(".progress i");
const altEl = $("#alt");
const altLabel = $("#alt-label");
const heroEl = $(".hero") || $(".page-hero");
const layers = [[".m1", 0.07], [".m2", 0.13], [".sun", 0.2]].map(([s, k]) => [heroEl && heroEl.querySelector(s), k]);
const stages = [[0, "Base camp"], [0.2, "Forest trail"], [0.4, "Tree line"], [0.6, "High ridge"], [0.8, "Snow line"], [0.97, "Summit!"]];
const SUMMIT = 5364; // just for fun, not a real peak
let ticking = false, lastY = scrollY, idle;
function onScroll() {
  const y = scrollY;
  // floating buttons step aside while you scroll down, and come back when you pause or scroll up
  if (y > lastY + 4) document.body.classList.add("float-hide");
  else if (y < lastY - 4) document.body.classList.remove("float-hide");
  clearTimeout(idle);
  idle = setTimeout(() => document.body.classList.remove("float-hide"), 700);
  lastY = y;
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(y / max, 1) : 0;
  nav.classList.toggle("scrolled", y > 20);
  document.body.classList.toggle("floats", y > 240);
  if (bar) bar.style.width = p * 100 + "%";
  if (altEl) {
    altEl.textContent = Math.round(p * SUMMIT).toLocaleString("en-IN");
    altLabel.textContent = stages.filter(s => p >= s[0]).pop()[1];
  }
  if (!reduce && heroEl && y < heroEl.offsetHeight) layers.forEach(([el, k]) => { if (el) el.style.transform = `translateY(${y * k}px)`; });
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
  document.querySelectorAll("#enquiry, #planner").forEach(f => formWatch.observe(f));
}

/* ---------- founder card ---------- */
const fab = $("#founder-fab");
const pop = $("#founder-pop");
function setPop(open) {
  pop.hidden = !open;
  fab.setAttribute("aria-expanded", open);
  if (open) pop.querySelector("a").focus({ preventScroll: true });
}
if (fab && pop) {
  fab.addEventListener("click", e => { e.stopPropagation(); setPop(pop.hidden); });
  document.addEventListener("click", e => { if (!pop.hidden && !pop.contains(e.target)) setPop(false); });
}
addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (pop && !pop.hidden) { setPop(false); fab.focus(); }
  if (links.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
});
