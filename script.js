const EMAIL = "Trailnamaadventures@gmail.com";
const WHATSAPP = "918003742763";

// Mobile menu
const btn = document.querySelector(".menu-btn");
const links = document.getElementById("links");
btn.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  btn.setAttribute("aria-expanded", open);
});
links.addEventListener("click", e => {
  if (e.target.tagName === "A") {
    links.classList.remove("open");
    btn.setAttribute("aria-expanded", false);
  }
});

// Trip filters
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    const f = chip.dataset.filter;
    document.querySelectorAll(".card").forEach(card => {
      card.hidden = f !== "all" && card.dataset.type !== f;
    });
  });
});

// Prefill trip on "Enquire"
document.querySelectorAll("[data-trip]").forEach(a => {
  a.addEventListener("click", () => {
    document.getElementById("trip-field").value = a.dataset.trip;
  });
});

// Enquiry form -> opens WhatsApp with the details prefilled
document.getElementById("enquiry").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  if (!f.name.value.trim() || !f.phone.value.trim()) {
    document.getElementById("form-note").textContent = "Please add your name and phone number.";
    return;
  }
  const lines = [
    "Hi Trailnama Adventures, I'd like to enquire about a trip.",
    "",
    `Name: ${f.name.value.trim()}`,
    `Phone: ${f.phone.value.trim()}`,
  ];
  if (f.email.value.trim()) lines.push(`Email: ${f.email.value.trim()}`);
  if (f.trip.value.trim()) lines.push(`Trip: ${f.trip.value.trim()}`);
  if (f.dates.value.trim()) lines.push(`Dates: ${f.dates.value.trim()}`);
  if (f.size.value) lines.push(`Group size: ${f.size.value}`);
  if (f.message.value.trim()) lines.push("", f.message.value.trim());
  location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
});

document.getElementById("yr").textContent = new Date().getFullYear();

// ---- Scroll animations ----
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reveal on scroll (staggered)
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".section h2, .section .sub, .eyebrow.dark, .filters, .card, .feature, .steps li, .about > *, details, .placeholder, .contact-grid > *, .strip-grid > div")
    .forEach((el, i) => {
      const sibs = [...el.parentElement.children].indexOf(el);
      el.style.setProperty("--d", Math.min(sibs, 5) * 0.09 + "s");
      el.classList.add("reveal");
      io.observe(el);
    });
}

// Progress bar + hiker, altimeter, hero parallax, plane
const bar = document.querySelector(".progress-bar");
const hiker = document.querySelector(".hiker");
const altEl = document.getElementById("alt");
const altLabel = document.getElementById("alt-label");
const layers = document.querySelectorAll(".layer");
const plane = document.querySelector(".plane");
const dash = document.querySelector(".dash-trail");
const hero = document.querySelector(".hero");
const stages = [[0, "Base camp"], [0.2, "Forest trail"], [0.4, "Tree line"], [0.6, "High ridge"], [0.8, "Snow line"], [0.97, "Summit!"]];
const SUMMIT = 5364;
let ticking = false;

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
  bar.style.width = p * 100 + "%";
  hiker.style.left = p * 100 + "%";
  altEl.textContent = Math.round(p * SUMMIT).toLocaleString("en-IN");
  altLabel.textContent = stages.filter(s => p >= s[0]).pop()[1];

  if (!reduce && scrollY < hero.offsetHeight + 100) {
    layers.forEach(l => l.style.transform = `translateY(${scrollY * l.dataset.speed}px)`);
    const hp = Math.min(scrollY / hero.offsetHeight, 1);
    const x = hp * (innerWidth + 80) ;
    const y = -hp * 140;
    plane.style.transform = `translate(${x}px, ${y}px) rotate(-${8 + hp * 10}deg)`;
    dash.style.width = x + "px";
    dash.style.opacity = 1 - hp;
  }
  ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener("resize", onScroll);
onScroll();

// ---- Hero + UX extras ----
// Rotating word
const rot = document.getElementById("rotator");
const words = ["mountains", "valleys", "rivers", "campfires", "unknown"];
let wi = 0;
if (!reduce) setInterval(() => {
  rot.classList.add("out");
  setTimeout(() => { wi = (wi + 1) % words.length; rot.textContent = words[wi]; rot.classList.remove("out"); }, 350);
}, 2600);

// Nav shadow + active link
const navEl = document.querySelector(".nav");
const navLinks = [...document.querySelectorAll(".links a[href^='#']:not(.btn)")];
const targets = navLinks.map(a => document.querySelector(a.getAttribute("href")));
function navState() {
  navEl.classList.toggle("scrolled", scrollY > 20);
  const y = scrollY + 120;
  let cur = -1;
  targets.forEach((t, i) => { if (t && t.offsetTop <= y) cur = i; });
  navLinks.forEach((a, i) => a.classList.toggle("active", i === cur));
}
addEventListener("scroll", navState, { passive: true });
navState();

// Subtle 3D tilt on trip cards (desktop only)
if (!reduce && matchMedia("(hover:hover)").matches) {
  document.querySelectorAll(".card").forEach(c => {
    c.addEventListener("mousemove", e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(700px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    });
    c.addEventListener("mouseleave", () => c.style.transform = "");
  });
}
