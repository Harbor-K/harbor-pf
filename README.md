# harbor-pf

Harbor Kim's portfolio sites, plus the shared images and videos they use.

One folder per portfolio. Each folder is its own small web app (Vite + React + Tailwind),
copied from a Magic Patterns design.

| Folder | Portfolio | Copied from (Magic Patterns) |
| --- | --- | --- |
| `portfolio-1/` | First portfolio | https://www.magicpatterns.com/c/84rahdeb1hc8xcigczgbyq |
| `portfolio-2/` | Second portfolio | https://www.magicpatterns.com/c/8d5e2husgc9vjxk5jtpt1y |
| `assets/` | Images & videos (used by the portfolios and the landing_page repo) | — |

## Online address (GitHub Pages)

- Start page (both links): https://harbor-k.github.io/harbor-pf/
- First portfolio: https://harbor-k.github.io/harbor-pf/portfolio-1/
- Second portfolio: https://harbor-k.github.io/harbor-pf/portfolio-2/

Every push to `main` rebuilds the pages (`.github/workflows/deploy-pages.yml`).
One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

## Run a portfolio on your computer

```bash
cd portfolio-1
npm install
npm run dev      # opens a local preview
npm run build    # makes the finished site in portfolio-1/dist
```

## Notes

- Files in `assets/` are still reachable at their old raw GitHub links, so nothing that already uses them breaks.
- Changes made later in Magic Patterns are not copied here automatically — the folders need updating again.
- Fonts: Helvetica Neue everywhere (never Inter).
