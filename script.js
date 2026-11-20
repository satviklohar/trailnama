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

/* ---------- contact banner: the jeep drives the road to the destination pin ---------- */
const drive = $(".ph-drive");
if (drive) {
  const road = drive.querySelector("#drive-path");
  const car = drive.querySelector(".ph-car");
  const banner = drive.closest(".page-hero");
  const L = road.getTotalLength();
  const DRIVE = 7200, REST = 1600;
  const ease = x => 1 - Math.pow(1 - x, 1.7);        // eases off as it nears the horizon
  const place = e => {
    const a = road.getPointAtLength(e * L), b = road.getPointAtLength(Math.min(e * L + 2, L));
    const tilt = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI * 0.45;
    const size = 0.8 - 0.66 * Math.pow(e, 0.8);      // smaller with distance
    car.setAttribute("transform", `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) scale(${size.toFixed(3)}) rotate(${tilt.toFixed(1)})`);
    car.style.opacity = e < 0.05 ? e / 0.05 : e > 0.86 ? Math.max(0, (1 - e) / 0.14) : 1;
  };
  if (reduce) place(0.3);
  else {
    let start = null;
    (function loop(ts) {
      if (banner.classList.contains("is-offscreen") || document.documentElement.classList.contains("loading")) start = null;
      else {
        if (start === null) start = ts;
        const t = (ts - start) % (DRIVE + REST);
        if (t < DRIVE) place(ease(t / DRIVE)); else car.style.opacity = 0;
      }
      requestAnimationFrame(loop);
    })(performance.now());
  }
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
  if (bar) bar.style.transform = `scaleX(${p})`;
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

/* ---------- pause banner animations while they are off screen (smoother scrolling, less battery) ---------- */
if ("IntersectionObserver" in window) {
  const rest = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("is-offscreen", !e.isIntersecting)));
  document.querySelectorAll(".hero, .page-hero").forEach(el => rest.observe(el));
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
