# 🍁 BillWatch

A non-partisan, plain-language tracker of the major bills moving through **Canada's federal Parliament** and **every provincial legislature** — with strengths, weaknesses, and **privacy & civil-liberties** implications flagged. Updated June 2026.

> This is a static website. No build step, no server, no dependencies. Just HTML/CSS/JS.

## Files
| File | What it is |
|---|---|
| `index.html` | The whole site (structure). |
| `styles.css` | All styling (light + dark mode). |
| `app.js` | Federal bill data + rendering, filtering, search, dark mode. |
| `provinces.js` | Provincial bill data (one entry per province). **Edit here to update provinces.** |
| `img/` | Infographics + social share image. |
| `downloads/` | The PDF packet. |
| `.nojekyll` | Tells GitHub Pages to serve files as-is (no Jekyll). |

## Deploy to GitHub Pages (the easy path)

1. **Create a repo** on GitHub (e.g. `billwatch`). Public.
2. **Push these files** to the `main` branch (commands below).
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Branch: **`main`**, folder: **`/ (root)`**. Save.
6. Wait ~1 minute. Your site is live at `https://<your-username>.github.io/billwatch/`.

### Push commands
```bash
# from inside this folder
git init
git add -A
git commit -m "BillWatch v1"
git branch -M main
git remote add origin https://github.com/<your-username>/billwatch.git
git push -u origin main
```
(Or use the GitHub CLI: `gh repo create billwatch --public --source=. --push`.)

## Custom domain (once you buy one)

1. Create a file named **`CNAME`** in this folder containing **only your domain**, e.g.:
   ```
   billwatch.ca
   ```
2. Commit & push it.
3. At your domain registrar, add DNS records pointing to GitHub Pages:
   - **Apex domain** (`billwatch.ca`): four `A` records →
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     (and optional `AAAA` records for IPv6).
   - **`www` subdomain**: a `CNAME` record → `<your-username>.github.io`.
4. In **Settings → Pages**, enter your custom domain and tick **Enforce HTTPS**.

## How to update content
- **A federal bill changed status?** Edit the matching object in `app.js` (`FEDERAL` array) — change the `status` and `st` fields.
- **A province?** Edit `provinces.js`.
- **The "as of" date?** Update it in `index.html` (hero + footer) and the `asOf` fields.
- Commit & push — GitHub Pages redeploys automatically.

## Disclaimer
Informational, non-partisan, and **not legal advice**. Statuses change quickly; always confirm on the official links (LEGISinfo for federal, each province's legislature site).
