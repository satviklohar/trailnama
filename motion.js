/* =====================================================================
   Trailnama motion system
   Scroll reveals, masked headings, image masks, count-ups, timelines,
   parallax and the FAQ accordion. Works on every page; each part only
   runs where its elements exist. html.motion is set in <head> unless the
   visitor prefers reduced motion.
   ===================================================================== */
(function () {
  const root = document.documentElement;
  const on = root.classList.contains("motion");
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const EASE = "cubic-bezier(.22,1,.36,1)";

  /* ---------- FAQ: smooth open and close (instant when motion is off) ---------- */
  $$("details").forEach(d => {
    const summary = d.querySelector("summary");
    if (!summary) return;
    const body = document.createElement("div");
    body.className = "faq-body";
    while (summary.nextSibling) body.appendChild(summary.nextSibling);
    d.appendChild(body);
    summary.addEventListener("click", e => {
      if (!on || !body.animate) return;
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = "1";
      const done = () => { delete d.dataset.busy; body.style.height = ""; };
      if (!d.open) {
        d.open = true;
        const h = body.scrollHeight;
        body.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 450, easing: EASE }).onfinish = done;
      } else {
        d.classList.add("closing");
        const h = body.scrollHeight;
        body.style.height = h + "px";
        body.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 340, easing: "cubic-bezier(.65,0,.35,1)" })
          .onfinish = () => { d.open = false; d.classList.remove("closing"); done(); };
      }
    });
  });

  if (!on) return;

  /* ---------- small markup helpers (no visual change) ---------- */
  $$(".strip-grid > img").forEach(img => {          // photo strip: wrapper for hover zoom + reveal
    const s = document.createElement("span");
    s.className = "m-zoom";
    img.before(s); s.appendChild(img);
  });
  $$(".foot-bottom a").forEach(a => {               // back to top: the arrow can lift
    a.innerHTML = a.innerHTML.replace("↑", '<span class="m-arrow" aria-hidden="true">↑</span>');
  });

  /* ---------- masked headings: split into words, measure lines ---------- */
  function split(el) {
    if (el.classList.contains("m-split")) return;
    const wrapUnit = node => {
      const w = document.createElement("span"); w.className = "m-word";
      const inner = document.createElement("span"); inner.className = "m-w";
      w.appendChild(inner);
      node.parentNode.insertBefore(w, node);
      inner.appendChild(node);
    };
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 3) {
        const parts = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          const w = document.createElement("span"); w.className = "m-word";
          const inner = document.createElement("span"); inner.className = "m-w"; inner.textContent = p;
          w.appendChild(inner); frag.appendChild(w);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === 1 && node.tagName !== "BR") {
        wrapUnit(node);                              // e.g. the italic "trail" with its underline
      }
    });
    const words = $$(".m-word", el);
    let line = -1, lastTop = null;
    words.forEach((w, i) => {
      const t = w.offsetTop;
      if (lastTop === null || Math.abs(t - lastTop) > 4) { line++; lastTop = t; }
      w.style.setProperty("--li", line);
      w.style.setProperty("--wi", i);
    });
    el.classList.add("m-split");
  }
  $$(".hero h1, .page-hero h1, .section h2, .band h2").forEach(split);

  /* ---------- assign reveal types ---------- */
  const STAGGER = 0.09;
  const groups = [];
  const add = (sel, cls, extra) => groups.push({ sel, cls, extra });

  // text and blocks that fade and rise
  add(".section-head .eyebrow, .section-head .head-side, .section-head > .link, .section-head > .sub", "m-up");
  add(".about-text > .eyebrow, .about-text > p:not(.eyebrow), .about-text .link-row, .about-text .stats li, .about-person figcaption", "m-up");
  add(".split > div > .eyebrow, .split > div > .sub, .split > div > .btn", "m-up");
  add(".checks li", "m-up");
  add(".card", "m-up");
  add(".trip-body > p, .trip-body > h3, .facts > div, .ticks li, .trip-cta .btn", "m-up");
  add(".value", "m-up");
  add(".contact-grid > div > .eyebrow, .contact-grid > div > .sub, .contact-list li, .direct", "m-up");
  add(".form", "m-up");
  add(".form > *", "m-up", el => el.style.setProperty("--d", (0.15 + Array.from(el.parentElement.children).indexOf(el) * 0.07).toFixed(2) + "s"));
  add("#faq .eyebrow, details", "m-up");
  add(".band-in > div > p, .band .btn", "m-up");
  add(".foot-grid > div, .foot-bottom > *", "m-up");
  add(".ig-embeds", "m-up");
  add(".review", "m-side");
  // images
  add(".card-media", "m-mask", el => { el.style.setProperty("--from", "100% 0 0 0"); });
  add(".trips-list .trip:nth-child(odd) .trip-media", "m-mask", el => el.style.setProperty("--from", "0 100% 0 0"));
  add(".trips-list .trip:nth-child(even) .trip-media", "m-mask", el => el.style.setProperty("--from", "0 0 0 100%"));
  add(".ig-tile", "m-mask", el => el.style.setProperty("--from", "100% 0 0 0"));
  add(".contact-photo", "m-mask", el => { el.style.setProperty("--from", "100% 0 0 0"); el.classList.add("m-px"); });
  add(".m-zoom", "m-mask", el => el.style.setProperty("--from", "100% 0 0 0"));
  add(".sp-main", "m-mask-self", el => el.style.setProperty("--from", "0 100% 0 0"));
  add(".sp-small", "m-mask-self", el => { el.style.setProperty("--from", "100% 0 0 0"); el.style.setProperty("--d", ".35s"); });
  add(".g-item", "m-mask", (el, i) => {
    el.style.setProperty("--from", ["0 100% 0 0", "100% 0 0 0", "0 0 0 100%", "0 0 100% 0"][i % 4]);
    el.classList.add("m-px");
  });
  add(".about-person img, .direct img", "m-portrait");

  const targets = new Set();
  groups.forEach(g => {
    $$(g.sel).forEach((el, i) => {
      if (el.closest(".hero, .page-hero")) return;
      el.classList.add(g.cls);
      // stagger with siblings of the same kind
      if (!el.style.getPropertyValue("--d")) {
        const sibs = Array.from(el.parentElement.children).filter(s => s.classList.contains(g.cls));
        el.style.setProperty("--d", (Math.min(sibs.indexOf(el), 6) * STAGGER).toFixed(2) + "s");
      }
      if (g.extra) g.extra(el, i);
      targets.add(el);
    });
  });
  // a card's photo and words follow the card itself
  $$(".card").forEach(card => {
    const d = parseFloat(card.style.getPropertyValue("--d")) || 0;
    const media = card.querySelector(".card-media");
    if (media) media.style.setProperty("--d", (d + 0.1).toFixed(2) + "s");
    $$(".body > *", card).forEach((el, j) => {
      el.classList.add("m-up");
      el.style.setProperty("--d", (d + 0.3 + j * 0.08).toFixed(2) + "s");
      targets.add(el);
    });
  });

  /* ---------- booking steps: timeline geometry ---------- */
  function measureSteps() {
    $$(".steps").forEach(steps => {
      const bs = $$("b", steps);
      $$("li", steps).forEach((li, i) => li.style.setProperty("--i", i));
      if (bs.length < 2) return;
      const s = steps.getBoundingClientRect(), a = bs[0].getBoundingClientRect(), z = bs[bs.length - 1].getBoundingClientRect();
      const vertical = Math.abs(a.top - z.top) > 5;
      steps.classList.toggle("tl-v", vertical);
      if (vertical) {
        steps.style.setProperty("--tl-x", (a.left - s.left + a.width / 2 - 1) + "px");
        steps.style.setProperty("--tl-top", (a.top - s.top + a.height / 2) + "px");
        steps.style.setProperty("--tl-h", (z.top - a.top) + "px");
      }
    });
  }
  measureSteps();
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(measureSteps, 150); });
  $$(".steps").forEach(s => targets.add(s));
  $$(".section h2, .band h2").forEach(h => targets.add(h));

  /* ---------- count-ups ---------- */
  function countUp(b, delay) {
    const m = b.textContent.trim().match(/^(\d+)(.*)$/);
    if (!m || b.dataset.counted) return;
    b.dataset.counted = "1";
    const end = +m[1], suffix = m[2], finalText = b.textContent;
    b.style.display = "inline-block";
    b.style.minWidth = b.getBoundingClientRect().width + "px";  // no layout shift while counting
    b.textContent = "0" + suffix;
    setTimeout(() => {
      const t0 = performance.now(), D = 1500;
      (function tick(t) {
        const p = Math.min((t - t0) / D, 1);
        b.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else { b.textContent = finalText; b.style.minWidth = ""; b.style.display = ""; }
      })(t0);
    }, delay);
  }

  /* ---------- reveal on scroll, then hand back to normal styles ---------- */
  const CLEAN = { "m-up": 900, "m-side": 900, "m-mask": 1800, "m-mask-self": 1300, "m-portrait": 1300 };
  function reveal(el) {
    el.classList.add("in");
    if (el.matches(".stats li")) { const b = el.querySelector("b"); if (b) countUp(b, 250); }
    const kind = Object.keys(CLEAN).find(k => el.classList.contains(k));
    if (!kind) return;
    const d = parseFloat(el.style.getPropertyValue("--d")) || 0;
    setTimeout(() => el.classList.remove(kind, "in"), CLEAN[kind] + d * 1000 + 100);
  }
  // masked elements are invisible to the browser's "is it on screen" check while clipped,
  // so they are triggered by their (unclipped) container instead
  const MASKS = ["m-mask", "m-mask-self", "m-portrait"];
  const byTrigger = new Map();
  // a card in a sideways swipe row (phones) is triggered by the whole row, so cards are ready before they're swiped in
  const cardTrigger = card => {
    const row = card.parentElement;
    return row.scrollWidth > row.clientWidth + 5 ? row : card;
  };
  targets.forEach(el => {
    if (el.closest("[hidden]")) return;
    const card = el.closest(".card");
    const trigger = card ? cardTrigger(card) : MASKS.some(k => el.classList.contains(k)) ? el.parentElement : el;
    if (!byTrigger.has(trigger)) byTrigger.set(trigger, []);
    byTrigger.get(trigger).push(el);
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      (byTrigger.get(en.target) || []).forEach(reveal);
      io.unobserve(en.target);
    });
  }, { threshold: 0.1 });
  byTrigger.forEach((_, trigger) => io.observe(trigger));

  /* ---------- hero and page banners: reveal on load (after the opening screen) ---------- */
  function intro() {
    $$(".hero h1, .page-hero h1").forEach(h => { h.style.setProperty("--d", ".12s"); h.classList.add("in"); });
    $$(".hero .stats-card b").forEach((b, i) => countUp(b, 950 + i * 100));
  }
  if (root.classList.contains("loading")) document.addEventListener("loader:leaving", intro, { once: true });
  else requestAnimationFrame(intro);

  /* ---------- gentle parallax (larger screens only) ---------- */
  if (matchMedia("(hover: hover) and (min-width: 861px)").matches) {
    const px = [
      ...$$(".g-item img").map(el => ({ el, amp: 10, prop: "translate" })),
      ...$$(".contact-photo img").map(el => ({ el, amp: 16, prop: "translate" })),
      ...$$(".band").map(el => ({ el, amp: 40, prop: "--band-y" })),
    ];
    let busy = false;
    const run = () => {
      const vh = innerHeight;
      px.forEach(p => {
        const r = (p.prop === "translate" ? p.el.parentElement : p.el).getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const v = ((r.top + r.height / 2 - vh / 2) / vh) * -p.amp;
        if (p.prop === "translate") p.el.style.translate = `0 ${v.toFixed(1)}px`;
        else p.el.style.setProperty(p.prop, v.toFixed(1) + "px");
      });
      busy = false;
    };
    addEventListener("scroll", () => { if (!busy) { busy = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  root.classList.add("motion-ready");
})();
