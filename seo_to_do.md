# SEO To-Do (Manual Steps)

Code changes (meta tags, sitemap.xml, robots.txt) are already done. Deploy those first, then proceed below.

---

## 1. Deploy the code changes
- Push the latest changes to GitHub so the updated `index.html`, `sitemap.xml`, and `robots.txt` go live at `https://angeliki-alexop.github.io/learn_aes/`

---

## 2. Google Search Console

### Setup
1. Go to https://search.google.com/search-console
2. Click **"Add property"** → choose **"URL prefix"**
3. Enter: `https://angeliki-alexop.github.io/learn_aes/`
4. Verify ownership:
   - Choose the **"HTML file"** verification method
   - Download the provided `.html` file (e.g. `googleXXXXXXXXXXXX.html`)
   - Place it in the `public/` folder of this project
   - Deploy again to GitHub Pages
   - Click **"Verify"** in Search Console

### After verification
1. Go to **Sitemaps** (left sidebar) → Add: `sitemap.xml` → click **Submit**
2. Go to **URL Inspection** → enter `https://angeliki-alexop.github.io/learn_aes/` → click **"Request Indexing"**

---

## 3. Bing Webmaster Tools (optional but easy)
- Go to https://www.bing.com/webmasters
- Add your site and import from Google Search Console (one-click if already set up)
- Bing also powers DuckDuckGo results

---

## 4. Get backlinks (helps ranking)
The more sites link to yours, the better Google ranks it. Easy options:
- Share the link on Reddit (e.g. r/cryptography, r/netsec, r/learnprogramming)
- Post on LinkedIn or Twitter/X
- Add the link to your GitHub profile README or portfolio site
- If you have a university profile or academic page, add it there
- Submit to directories like https://github.com/topics/aes or open-source lists

---

## 5. Monitor progress
- Check Google Search Console weekly for:
  - Index coverage (is the page indexed?)
  - Search queries (what terms bring people to the site)
  - Click-through rate (CTR)
- First indexing typically happens within **1–4 weeks** after submission

---

## Notes
- GitHub Pages SPA limitation: only the root URL is truly indexable by Google since there are no real sub-routes served server-side. This is fine for a single-page app.
- Do NOT use `noindex` anywhere (it would block Google).
