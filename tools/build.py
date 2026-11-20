#!/usr/bin/env python3
"""
Builds the Trailnama website from src/ into the site root.

    python3 tools/build.py

Edit the shared pieces in src/partials/ and the pages in src/pages/, then run this.
Every page gets the same header, footer and floating buttons, plus its own
title, description, canonical URL and structured data for Google.
"""
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
SITE = "https://trailnama.vercel.app/"
PHONE = "+91-8003742763"
EMAIL = "Trailnamaadventures@gmail.com"
IG = "https://www.instagram.com/trailnama_adventures"
FONT = ("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;"
        "1,9..144,600&family=Inter:wght@400;500;600&display=swap")

AGENCY = {
    "@type": "TravelAgency", "@id": SITE + "#agency", "name": "Trailnama Adventures", "url": SITE,
    "logo": SITE + "assets/icons/icon-512.png", "image": SITE + "assets/og.jpg",
    "description": "Guided Himalayan treks, weekend getaways and small-group trips in India.",
    "telephone": PHONE, "email": EMAIL, "areaServed": {"@type": "Country", "name": "India"},
    "sameAs": [IG],
    "founder": {"@type": "Person", "name": "Harsh", "jobTitle": "Founder",
                "sameAs": "https://www.instagram.com/harshbackpack"},
    "contactPoint": {"@type": "ContactPoint", "telephone": PHONE, "contactType": "customer service",
                     "availableLanguage": ["English", "Hindi"]},
}
WEBSITE = {"@type": "WebSite", "@id": SITE + "#website", "url": SITE, "name": "Trailnama Adventures",
           "inLanguage": "en-IN", "publisher": {"@id": SITE + "#agency"}}

# ---------- pages ----------
PAGES = [
    {"key": "home", "path": "", "file": "home.html", "nav": "home",
     "title": "Trailnama Adventures | Himalayan Treks & Group Trips in India",
     "description": "Guided Himalayan treks, weekend getaways and small-group trips in India with clear pricing "
                    "and WhatsApp support. Led by trekking creator Harsh (@harshbackpack).",
     "og_title": "Trailnama Adventures | Find your trail beyond the city"},
    {"key": "trips", "path": "trips/", "file": "trips.html", "nav": "trips", "crumb": "Upcoming trips",
     "title": "Upcoming Treks & Group Trips | Trailnama Adventures",
     "description": "Himalayan treks, valley and river journeys, weekend getaways and high altitude treks. "
                    "Small groups, a trip lead who knows the route and clear pricing. Ask for the next dates.",
     "og_title": "Upcoming treks and group trips | Trailnama Adventures"},
    {"key": "about", "path": "about/", "file": "about.html", "nav": "about", "crumb": "About us",
     "title": "About Us | Trailnama Adventures, led by Harsh (@harshbackpack)",
     "description": "Trailnama Adventures is led by Harsh, a trekking creator and mountain athlete. "
                    "Small groups, honest pricing and well-planned days outdoors.",
     "og_title": "About Trailnama Adventures"},
    {"key": "contact", "path": "contact/", "file": "contact.html", "nav": "contact", "crumb": "Contact",
     "title": "Contact Trailnama Adventures | Plan Your Trek on WhatsApp",
     "description": "Plan your trek or group trip with Trailnama Adventures. WhatsApp +91 80037 42763, "
                    "email Trailnamaadventures@gmail.com or send an enquiry.",
     "og_title": "Contact Trailnama Adventures"},
]

NAV = [("home", "", "Home"), ("trips", "trips/", "Upcoming trips"),
       ("about", "about/", "About us"), ("contact", "contact/", "Contact")]


def read(p):
    return (SRC / p).read_text()


def include(text, depth=0):
    """Replace {{> name}} with src/partials/name.html (nested allowed)."""
    if depth > 5:
        return text
    return re.sub(r"\{\{>\s*([\w-]+)\s*\}\}",
                  lambda m: include(read(f"partials/{m.group(1)}.html"), depth + 1), text)


def jsonld(page, body):
    graph = [AGENCY, WEBSITE]
    url = SITE + page["path"]
    if page["key"] != "home":
        graph.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE},
            {"@type": "ListItem", "position": 2, "name": page["crumb"], "item": url}]})
    if page["key"] in ("home", "trips"):
        trips = re.findall(r'data-trip-name="([^"]+)"[^>]*data-trip-desc="([^"]+)"[^>]*data-trip-img="([^"]+)"', body)
        if trips:
            graph.append({"@type": "ItemList", "name": "Trailnama trips", "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "item": {
                    "@type": "TouristTrip", "name": n, "description": d,
                    "image": SITE + img.replace("{{R}}", ""), "provider": {"@id": SITE + "#agency"}}}
                for i, (n, d, img) in enumerate(trips)]})
    if page["key"] == "about":
        graph.append({"@type": "AboutPage", "url": url, "name": page["title"], "about": {"@id": SITE + "#agency"}})
    if page["key"] == "contact":
        graph.append({"@type": "ContactPage", "url": url, "name": page["title"]})
    faqs = re.findall(r"<details><summary>(.*?)</summary><p>(.*?)</p></details>", body)
    if faqs:
        graph.append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]})
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, indent=1, ensure_ascii=False)


def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;")


def nav_html(active):
    current = ' class="active" aria-current="page"'
    return "\n".join(
        f'      <a href="{{{{R}}}}{href}"{current if key == active else ""}>{label}</a>'
        for key, href, label in NAV)


def render(page):
    depth = page["path"].count("/")
    R = "../" * depth
    body = include(read(f"pages/{page['file']}"))
    url = SITE + page["path"]
    head = f"""<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(page['title'])}</title>
<meta name="description" content="{esc(page['description'])}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#22120e">

<meta property="og:type" content="website">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="Trailnama Adventures">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{esc(page['og_title'])}">
<meta property="og:description" content="{esc(page['description'])}">
<meta property="og:image" content="{SITE}assets/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Trailnama Adventures: Find your trail beyond the city">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(page['og_title'])}">
<meta name="twitter:description" content="{esc(page['description'])}">
<meta name="twitter:image" content="{SITE}assets/og.jpg">

<link rel="icon" href="{R}favicon.ico" sizes="any">
<link rel="icon" href="{R}assets/icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{R}assets/icons/apple-touch-icon.png">
<link rel="manifest" href="{R}site.webmanifest">

{read('partials/intro-script.html').strip()}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="{FONT}">
<link rel="stylesheet" href="{FONT}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="{FONT}"></noscript>
<link rel="stylesheet" href="{R}styles.css">

<script type="application/ld+json">
{jsonld(page, body)}
</script>
</head>
<body data-page="{page['key']}">

{include(read('partials/loader.html')).strip()}

<a class="skip" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"><i></i></div>

<header class="nav" id="top">
  <div class="nav-inner">
    <a href="{{{{R}}}}" class="brand" aria-label="Trailnama Adventures home"><img src="{{{{R}}}}assets/logo-crop.jpeg" alt="Trailnama Adventures" width="56" height="48"></a>
    <button class="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="links"><span></span><span></span><span></span></button>
    <nav class="links" id="links" aria-label="Main">
{nav_html(page['nav'])}
      <a href="{{{{R}}}}contact/#enquiry" class="btn btn-sm">Enquire</a>
    </nav>
  </div>
</header>

<main id="main">
"""
    tail = f"""</main>

{include(read('partials/footer.html')).strip()}

{include(read('partials/floats.html')).strip()}

<script src="{{{{R}}}}content.js"></script>
<script src="{{{{R}}}}script.js"></script>
<script src="{{{{R}}}}motion.js"></script>
</body>
</html>
"""
    html = head + body.rstrip() + "\n" + tail
    html = html.replace("{{R}}", R).replace("{{year}}", str(date.today().year))
    out = ROOT / page["path"] / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html)
    return out


def sitemap():
    today = date.today().isoformat()
    urls = []
    for p in PAGES:
        urls.append(f"""  <url>
    <loc>{SITE}{p['path']}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{'weekly' if p['key'] in ('home', 'trips') else 'monthly'}</changefreq>
    <priority>{'1.0' if p['key'] == 'home' else '0.8'}</priority>
  </url>""")
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>\n")


if __name__ == "__main__":
    for p in PAGES:
        print("built", render(p).relative_to(ROOT))
    sitemap()
    print("built sitemap.xml")
