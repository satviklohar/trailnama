/* ============================================================
   EDIT ME: add your real team and photos/videos here.
   - Put image/video files in assets/team/ and assets/gallery/
   - Leave a list empty ([]) to show the placeholder tiles.
   ============================================================ */

// Paste links of your Instagram posts/reels (and collab posts) here.
// They show on the site using Instagram's official embed, so no downloading needed.
const INSTAGRAM_POSTS = [
  // "https://www.instagram.com/p/XXXXXXXXXXX/",
  // "https://www.instagram.com/reel/XXXXXXXXXXX/",
];

const FOUNDER = {
  name: "Harsh",
  role: "Founder, Trailnama Adventures",
  photo: "assets/team/founder.jpg",   // small (150px) Instagram profile pic; replace with a larger photo any time
  photoSmall: true,                    // set to false once you use a large photo
  video: "",   // optional intro video, e.g. "assets/team/founder.mp4"
  quote: "Trekking creator and mountain athlete, sharing trail guides and gear tests from the mountains.",
  story: [
    "Harsh is a trekking creator and mountain athlete who shares trail guides, gear tests and travel reels from across India, from the mountains to the coast, on Instagram as @harshbackpack.",
    "Trailnama Adventures grew out of that love for the outdoors: well-planned trips led by someone who lives the trails."
  ],
  facts: [
    { value: "8K+", label: "Instagram followers" },
    { value: "🥾", label: "Trekking creator" },
    { value: "📸", label: "Gear tests & trail guides" }
  ],
  instagram: "https://www.instagram.com/harshbackpack",
  instagramLabel: "Follow @harshbackpack"
};

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

// Add ONLY genuine reviews, with the traveller's permission.
// Preview only: shows clearly labelled "Sample" cards so you can see the layout.
// Set to false before launch. Sample cards only appear while REVIEWS is empty.
const SHOW_SAMPLE_REVIEWS = true;
const SAMPLE_REVIEWS = [
  { name: "Sample traveller", trip: "Sample trip", rating: 5, text: "This is where a traveller's own words about their trip will appear." },
  { name: "Sample traveller", trip: "Sample trip", rating: 5, text: "Short, honest feedback about the group, the guides and the experience." },
  { name: "Sample traveller", trip: "Sample trip", rating: 5, text: "Real reviews, with permission, will replace these cards." },
];

const REVIEWS = [
  // { name: "Traveller name", trip: "Trip name", rating: 5, text: "Their own words.", photo: "" },
];

/* ---------------- rendering (no need to edit below) ---------------- */
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Instagram embeds
  const igEl = document.getElementById("ig-embeds");
  if (INSTAGRAM_POSTS.length) {
    igEl.hidden = false;
    igEl.innerHTML = INSTAGRAM_POSTS.map(u => {
      const url = String(u).split("?")[0];
      return /^https:\/\/www\.instagram\.com\/(p|reel|tv)\/[\w-]+\/?$/.test(url)
        ? `<blockquote class="instagram-media" data-instgrm-permalink="${esc(url)}/" data-instgrm-version="14"></blockquote>` : "";
    }).join("");
    const s = document.createElement("script");
    s.async = true; s.src = "https://www.instagram.com/embed.js";
    document.body.appendChild(s);
  }

  // Founder
  const fEl = document.getElementById("founder-card");
  const initials = FOUNDER.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const media = FOUNDER.video
    ? `<video src="${esc(FOUNDER.video)}" ${FOUNDER.photo ? `poster="${esc(FOUNDER.photo)}"` : ""} controls playsinline preload="metadata"></video>`
    : FOUNDER.photo
      ? `<img src="${esc(FOUNDER.photo)}" alt="${esc(FOUNDER.name)}" loading="lazy">`
      : `<div class="founder-ph"><span>${esc(initials)}</span><small>Founder photo here</small></div>`;
  fEl.innerHTML = `
    <div class="founder-media${FOUNDER.photoSmall ? " small" : ""}">${media}</div>
    <div class="founder-info">
      <h2>${esc(FOUNDER.name)}</h2>
      <p class="role">${esc(FOUNDER.role)}</p>
      <blockquote>${esc(FOUNDER.quote)}</blockquote>
      ${FOUNDER.story.map(p => `<p>${esc(p)}</p>`).join("")}
      <ul class="facts">${FOUNDER.facts.map(f => `<li><b>${esc(f.value)}</b><span>${esc(f.label)}</span></li>`).join("")}</ul>
      <a class="btn" href="${esc(FOUNDER.instagram)}" target="_blank" rel="noopener">${esc(FOUNDER.instagramLabel || "Follow on Instagram")}</a>
    </div>`;

  // Reviews
  const rEl = document.getElementById("reviews-grid");
  const card = (r, sample) => `<figure class="review${sample ? " sample" : ""}">${sample ? `<span class="sample-tag">Sample review, not a real customer</span>` : ""}<div class="stars" aria-label="${+r.rating || 5} out of 5">${"★".repeat(+r.rating || 5)}</div><blockquote>${esc(r.text)}</blockquote><figcaption><strong>${esc(r.name)}</strong>${r.trip ? `<span>${esc(r.trip)}</span>` : ""}</figcaption></figure>`;
  rEl.innerHTML = REVIEWS.length
    ? REVIEWS.map(r => card(r, false)).join("")
    : SHOW_SAMPLE_REVIEWS
      ? SAMPLE_REVIEWS.map(r => card(r, true)).join("")
      : `<div class="placeholder">Reviews from our travellers will appear here soon.</div>`;

  // Gallery
  const gEl = document.getElementById("gallery-grid");
  const tints = ["t1", "t2", "t3", "t4", "t3", "t1"];
  if (GALLERY.length) {
    gEl.innerHTML = GALLERY.map((g, i) => g.type === "video"
      ? `<button class="g-item video" data-i="${i}" aria-label="Play ${esc(g.caption || "video")}"><video src="${esc(g.src)}" ${g.poster ? `poster="${esc(g.poster)}"` : ""} muted playsinline preload="metadata"></video><span class="play">▶</span><span class="cap">${esc(g.caption || "")}</span></button>`
      : `<button class="g-item" data-i="${i}" aria-label="View ${esc(g.caption || "photo")}"><img src="${esc(g.src)}" alt="${esc(g.caption || "Trailnama trip photo")}" loading="lazy"><span class="cap">${esc(g.caption || "")}</span></button>`
    ).join("");
  } else {
    gEl.innerHTML = tints.map((t, i) => `<div class="g-item ph ${t}"><span class="ph-label">${["📸", "🏔", "⛺", "🥾", "🎥", "🌄"][i]}<small>Your trip photo here</small></span></div>`).join("");
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
