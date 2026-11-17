/* ============================================================
   EDIT ME: photos, videos, reviews and Instagram posts.
   Put files in assets/gallery/ and list them below.
   ============================================================ */

const GALLERY = [
  { type: "image", src: "assets/gallery/waterfall.jpg", caption: "Waterfall in the mountains" },
  { type: "image", src: "assets/gallery/valley-trail.jpg", caption: "Walking the valley trail" },
  { type: "image", src: "assets/gallery/annapurna-south.jpg", caption: "Annapurna South, 7,219 m" },
  { type: "image", src: "assets/gallery/milky-way.jpg", caption: "Under the Milky Way" },
  { type: "image", src: "assets/gallery/trail-rest.jpg", caption: "A pause on the trail" },
  { type: "image", src: "assets/gallery/river-bridge.jpg", caption: "River and bridge in the hills" },
  { type: "image", src: "assets/gallery/jaipur-lake.jpg", caption: "Views of Jaipur" },
  { type: "image", src: "assets/gallery/monsoon-train.jpg", caption: "Mumbai to Pune in monsoon" },
  // { type: "video", src: "assets/gallery/reel-1.mp4", caption: "Trail reel", poster: "assets/gallery/reel-1.jpg" },
];

// Paste Instagram post/reel links to show them with Instagram's official embed (needs the site to be online).
const INSTAGRAM_POSTS = [
  // "https://www.instagram.com/p/XXXXXXXXXXX/",
];

// Add ONLY genuine reviews, with the traveller's permission. The section stays hidden until you add one.
const REVIEWS = [
  // { name: "Traveller name", trip: "Trip name", rating: 5, text: "Their own words." },
];

/* ---------------- rendering (no need to edit below) ---------------- */
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Gallery
  const gEl = document.getElementById("gallery-grid");
  gEl.innerHTML = GALLERY.map((g, i) => g.type === "video"
    ? `<button class="g-item" data-i="${i}" aria-label="Play ${esc(g.caption || "video")}"><video src="${esc(g.src)}" ${g.poster ? `poster="${esc(g.poster)}"` : ""} muted playsinline preload="metadata"></video><span class="play">▶</span><span class="cap">${esc(g.caption || "")}</span></button>`
    : `<button class="g-item" data-i="${i}" aria-label="View ${esc(g.caption || "photo")}"><img src="${esc(g.src)}" alt="${esc(g.caption || "Trailnama trip photo")}" loading="lazy"><span class="cap">${esc(g.caption || "")}</span></button>`
  ).join("");
  if (!GALLERY.length) gEl.closest("section").hidden = true;

  // Instagram embeds
  const igEl = document.getElementById("ig-embeds");
  const posts = INSTAGRAM_POSTS.map(u => String(u).split("?")[0])
    .filter(u => /^https:\/\/www\.instagram\.com\/(p|reel|tv)\/[\w-]+\/?$/.test(u));
  if (posts.length) {
    igEl.hidden = false;
    igEl.innerHTML = posts.map(u => `<blockquote class="instagram-media" data-instgrm-permalink="${esc(u.replace(/\/?$/, "/"))}" data-instgrm-version="14"></blockquote>`).join("");
    const s = document.createElement("script");
    s.async = true; s.src = "https://www.instagram.com/embed.js";
    document.body.appendChild(s);
  }

  // Reviews
  if (REVIEWS.length) {
    document.getElementById("stories").hidden = false;
    document.getElementById("reviews-grid").innerHTML = REVIEWS.map(r =>
      `<figure class="review"><div class="stars" aria-label="${+r.rating || 5} out of 5">${"★".repeat(+r.rating || 5)}</div><blockquote>${esc(r.text)}</blockquote><figcaption><strong>${esc(r.name)}</strong>${r.trip ? `<span>${esc(r.trip)}</span>` : ""}</figcaption></figure>`
    ).join("");
  }

  // Lightbox
  const lb = document.getElementById("lightbox");
  const stage = lb.querySelector(".lb-stage");
  let cur = 0;
  function show(i) {
    cur = (i + GALLERY.length) % GALLERY.length;
    const g = GALLERY[cur];
    stage.innerHTML = (g.type === "video"
      ? `<video src="${esc(g.src)}" controls autoplay playsinline></video>`
      : `<img src="${esc(g.src)}" alt="${esc(g.caption || "")}">`) + (g.caption ? `<p>${esc(g.caption)}</p>` : "");
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function close() { lb.hidden = true; stage.innerHTML = ""; document.body.style.overflow = ""; }
  gEl.addEventListener("click", e => { const b = e.target.closest("button[data-i]"); if (b) show(+b.dataset.i); });
  lb.querySelector(".lb-close").onclick = close;
  lb.querySelector(".lb-prev").onclick = () => show(cur - 1);
  lb.querySelector(".lb-next").onclick = () => show(cur + 1);
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
  addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
})();
