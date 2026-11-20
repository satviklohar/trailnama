/* ============================================================
   EDIT ME: photos, videos, reviews and Instagram posts.
   - src:   the full photo, shown when someone opens it
   - thumb: a clean crop for the grid (optional, falls back to src)
   Put new files in assets/gallery/ (full) and assets/photos/ (crops).
   ============================================================ */

const GALLERY = [
  { type: "image", src: "assets/gallery/valley-trail.jpg", thumb: "assets/photos/valley-trail.jpg", caption: "Walking the valley trail" },
  { type: "image", src: "assets/gallery/waterfall.jpg", thumb: "assets/photos/waterfall.jpg", caption: "Waterfall in the mountains" },
  { type: "image", src: "assets/gallery/annapurna-south.jpg", thumb: "assets/photos/annapurna-south.jpg", caption: "Annapurna South, 7,219 m" },
  { type: "image", src: "assets/gallery/milky-way.jpg", thumb: "assets/photos/milky-way.jpg", caption: "Under the Milky Way" },
  { type: "image", src: "assets/gallery/river-bridge.jpg", thumb: "assets/photos/river-bridge.jpg", caption: "River and bridge in the hills" },
  { type: "image", src: "assets/photos/trail-rest.jpg", caption: "A pause on the trail" },
  { type: "image", src: "assets/gallery/jaipur-lake.jpg", thumb: "assets/photos/jaipur-lake.jpg", caption: "Views of Jaipur" },
  { type: "image", src: "assets/gallery/monsoon-train.jpg", thumb: "assets/photos/monsoon-train.jpg", caption: "Mumbai to Pune in monsoon" },
  // { type: "video", src: "assets/gallery/reel-1.mp4", caption: "Trail reel", poster: "assets/gallery/reel-1.jpg" },
];

/* ---------- INSTAGRAM SECTION (pick one, or leave both empty for a photo grid) ----------
   A) LIVE FEED, updates by itself: create a free feed at https://behold.so (log in with the
      Instagram account), choose "JSON", and paste the feed URL here. Shows the latest posts
      and reels as light thumbnails, so the site stays fast.
   B) YOUR BEST REELS: paste reel/post links (open the reel > ... > Copy link). They show with
      Instagram's official player, which only loads when a visitor scrolls near it. */
const INSTAGRAM_FEED_URL = "";
const INSTAGRAM_POSTS = [
  // paste 4 to 8 reels here, most-viewed first, e.g.
  // "https://www.instagram.com/reel/XXXXXXXXXXX/",
];
const INSTAGRAM_PROFILE = "https://www.instagram.com/trailnama_adventures/";

// Add ONLY genuine reviews, with the traveller's permission. The section stays hidden until you add one.
const REVIEWS = [
  // { name: "Traveller name", trip: "Trip name", rating: 5, text: "Their own words." },
];

/* ---------------- rendering (no need to edit below) ---------------- */
// photo paths above are written from the site root; this finds the root from any page
const SITE_ROOT = (document.currentScript && document.currentScript.src) ? new URL(".", document.currentScript.src).href : "";
const fromRoot = p => (/^(https?:|data:|\/)/.test(p) ? p : SITE_ROOT + p);
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Gallery
  const gEl = document.getElementById("gallery-grid");
  if (gEl) gEl.innerHTML = GALLERY.map((g, i) => g.type === "video"
    ? `<button class="g-item" data-i="${i}" aria-label="Play ${esc(g.caption || "video")}"><video src="${esc(fromRoot(g.src))}" ${g.poster ? `poster="${esc(fromRoot(g.poster))}"` : ""} muted playsinline preload="metadata"></video><span class="play" aria-hidden="true">▶</span><span class="cap">${esc(g.caption || "")}</span></button>`
    : `<button class="g-item" data-i="${i}" aria-label="Open photo: ${esc(g.caption || "trip photo")}"><img src="${esc(fromRoot(g.thumb || g.src))}" alt="${esc(g.caption || "Trailnama trip photo")}" loading="lazy" decoding="async"><span class="cap">${esc(g.caption || "")}</span></button>`
  ).join("");
  if (gEl && !GALLERY.length) gEl.closest("section").hidden = true;

  // Instagram section
  const feedEl = document.getElementById("ig-feed");
  const igEl = document.getElementById("ig-embeds");
  const igIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" class="fill"/></svg>`;
  const tile = (href, img, label, isVideo) =>
    `<a class="ig-tile" href="${esc(href)}" target="_blank" rel="noopener" aria-label="${esc(label)}"><img src="${esc(img)}" alt="${esc(label)}" loading="lazy" decoding="async">${isVideo ? `<span class="ig-play" aria-hidden="true">▶</span>` : ""}<span class="ig-over" aria-hidden="true">${igIcon}</span></a>`;
  function photoGrid() {
    // until a feed or reels are connected: our trail photos, each opening the Instagram profile
    feedEl.innerHTML = GALLERY.filter(g => g.type === "image").slice(0, 6)
      .map(g => tile(INSTAGRAM_PROFILE, fromRoot(g.thumb || g.src), (g.caption || "Trail photo") + " on Instagram", false)).join("");
  }
  if (feedEl) {
    const posts = INSTAGRAM_POSTS.map(u => String(u).split("?")[0])
      .filter(u => /^https:\/\/www\.instagram\.com\/(p|reel|tv)\/[\w-]+\/?$/.test(u));
    if (INSTAGRAM_FEED_URL) {
      photoGrid(); // shown instantly, swapped for the live feed when it arrives
      fetch(INSTAGRAM_FEED_URL).then(r => r.json()).then(data => {
        const list = (Array.isArray(data) ? data : data.posts || []).slice(0, 8);
        if (!list.length) return;
        feedEl.innerHTML = list.map(p => {
          const img = (p.sizes && p.sizes.medium && p.sizes.medium.mediaUrl) || p.thumbnailUrl || p.mediaUrl;
          const cap = (p.prunedCaption || p.caption || "Instagram post").slice(0, 90);
          return tile(p.permalink, img, cap, p.mediaType === "VIDEO");
        }).join("");
      }).catch(() => {});
    } else if (posts.length) {
      feedEl.hidden = true;
      igEl.hidden = false;
      igEl.innerHTML = posts.map(u => `<blockquote class="instagram-media" data-instgrm-permalink="${esc(u.replace(/\/?$/, "/"))}" data-instgrm-version="14"><a href="${esc(u)}" target="_blank" rel="noopener">View this reel on Instagram</a></blockquote>`).join("");
      // load Instagram's player only when the section is close, so the page stays light
      const load = () => { if (document.getElementById("ig-js")) return; const sc = document.createElement("script"); sc.id = "ig-js"; sc.async = true; sc.src = "https://www.instagram.com/embed.js"; document.body.appendChild(sc); };
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { load(); io.disconnect(); } }, { rootMargin: "600px" });
        io.observe(igEl);
      } else load();
    } else {
      photoGrid();
    }
  }

  // Reviews
  if (REVIEWS.length && document.getElementById("stories")) {
    document.getElementById("stories").hidden = false;
    document.getElementById("reviews-grid").innerHTML = REVIEWS.map(r =>
      `<figure class="review"><div class="stars" aria-label="${+r.rating || 5} out of 5">${"★".repeat(+r.rating || 5)}</div><blockquote>${esc(r.text)}</blockquote><figcaption><strong>${esc(r.name)}</strong>${r.trip ? `<span>${esc(r.trip)}</span>` : ""}</figcaption></figure>`
    ).join("");
  }

  // Lightbox: click, arrow keys, swipe on phones
  const lb = document.getElementById("lightbox");
  const stage = lb.querySelector(".lb-stage");
  let cur = 0, opener = null;
  function show(i) {
    cur = (i + GALLERY.length) % GALLERY.length;
    const g = GALLERY[cur];
    stage.innerHTML = (g.type === "video"
      ? `<video src="${esc(fromRoot(g.src))}" controls autoplay playsinline></video>`
      : `<img src="${esc(fromRoot(g.src))}" alt="${esc(g.caption || "")}">`)
      + `<p>${esc(g.caption || "")}<span>${cur + 1} / ${GALLERY.length}</span></p>`;
    if (lb.hidden) {
      opener = document.activeElement;
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb-close").focus();
    }
  }
  function close() {
    lb.hidden = true; stage.innerHTML = ""; document.body.style.overflow = "";
    if (opener) opener.focus();
  }
  if (gEl) gEl.addEventListener("click", e => { const b = e.target.closest("button[data-i]"); if (b) show(+b.dataset.i); });
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
  let x0 = null;
  lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
