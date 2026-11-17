const EMAIL = "Trailnamaadventures@gmail.com";
const WHATSAPP = "918003742763";

// Mobile menu
const btn = document.querySelector(".menu-btn");
const links = document.getElementById("links");
btn.addEventListener("click", () => {
  btn.setAttribute("aria-expanded", links.classList.toggle("open"));
});
links.addEventListener("click", e => {
  if (e.target.tagName === "A") {
    links.classList.remove("open");
    btn.setAttribute("aria-expanded", false);
  }
});

// Prefill trip on "Get a quote"
document.querySelectorAll("[data-trip]").forEach(a => {
  a.addEventListener("click", () => {
    document.getElementById("trip-field").value = a.dataset.trip;
  });
});

// Enquiry form -> opens WhatsApp with the details filled in
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
  if (f.size.value) lines.push(`People: ${f.size.value}`);
  if (f.message.value.trim()) lines.push("", f.message.value.trim());
  location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
});

document.getElementById("yr").textContent = new Date().getFullYear();

// Fade/slide in as things scroll into view, staggered within each group
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".section .wrap > *:not(.cards):not(.gallery):not(.steps), .card, .g-item, .steps li, .contact-list li")
    .forEach(el => {
      const i = [...el.parentElement.children].indexOf(el);
      el.style.setProperty("--d", Math.min(i, 6) * 0.08 + "s");
      el.classList.add("fade");
      io.observe(el);
    });
}

// Header shadow once you scroll
const nav = document.querySelector(".nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 10), { passive: true });

// Highlight the menu link for the section you are in
const navLinks = [...document.querySelectorAll('.links a[href^="#"]:not(.btn)')];
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach(a => { const t = document.querySelector(a.getAttribute("href")); if (t) spy.observe(t); });
}

// Hero planner -> WhatsApp with the chosen trip and date
document.getElementById("planner").addEventListener("submit", e => {
  e.preventDefault();
  const trip = document.getElementById("pl-trip").value;
  const date = document.getElementById("pl-date").value;
  const lines = ["Hi Trailnama Adventures, I'd like to check availability."];
  if (trip) lines.push(`Trip: ${trip}`);
  if (date) lines.push(`Preferred date: ${new Date(date + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`);
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
});
