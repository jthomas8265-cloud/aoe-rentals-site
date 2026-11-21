# AOE Rentals site

Static landing page for Agent Orange Equipment Rentals LLC (`aoerentalswyo.com`).

## Local preview
Open `index.html` in a browser, or serve the folder (paths are relative for GitHub Pages):

```bash
python3 -m http.server 8080
```

## Deploy
GitHub Pages (or Cloudflare Pages). Point `aoerentalswyo.com` A/CNAME at the host after DNS is live at Porkbun.

## Community board
Free yard sale, garden, and farm listings are in `data/yard-sales.json`, shown at `/yard-sales/`. Intake and commit steps: `/workspace/yard-sales/README.md`. Daily cleanup: `python3 scripts/prune-yard-sales.py`.
