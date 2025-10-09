# QR Generator

A lightweight QR code generator built with Vite, React, and TypeScript. Edit the text, tweak size and colors, optionally embed a logo, and export ready-to-share PNG/JPG/SVG/WEBP files.

## Highlights

- Clean, distraction-free interface with light/dark theme toggle.
- Live preview that reflects text, size, margin, color, and ECC changes immediately.
- Optional logo upload with scale and corner-radius controls.
- One-click exports (PNG/JPG/SVG/WEBP) plus clipboard copy with configurable resolution.
- Shareable URLs by encoding the current settings into the query string.

## Getting Started

```bash
npm install
npx playwright install    # once, to download browser engines
npm run dev               # start Vite on http://localhost:5173
```

Key scripts:

- `npm run build` – type-check and create the production bundle in `dist/`.
- `npm run preview` – serve the production build locally.
- `npm run lint` / `npm run format` – run ESLint and Prettier.
- `npm run test:e2e` – Playwright smoke tests across Chromium, Firefox, and WebKit.
- `npm run check:accessibility` – execute accessibility-tagged Playwright cases.

## Project Structure

```
├─ src/
│  ├─ App.tsx               # Orchestrates editor, preview, and export panels
│  ├─ components/           # PanelCard, QREditor, QRPreview, ExportPanel
│  ├─ lib/                  # QR helpers, export utilities, URL/state helpers
│  ├─ styles/globals.css    # Base styles and Tailwind layers
│  └─ main.tsx              # Vite bootstrap
├─ tests/e2e/               # Playwright specs & fixtures
├─ playwright.config.ts     # Cross-browser Playwright configuration
└─ tailwind.config.js       # Theme tokens and Tailwind plugins
```

## Deployment

1. GitHub Actions workflow (`.github/workflows/deploy.yml`) builds on every push to `main` and publishes `dist/` to Pages.
2. Ensure `VITE_BASE_PATH` matches the repository slug in the workflow (set automatically in the provided file).
3. For custom domains, add a `CNAME` file under `public/` prior to building.

## Accessibility & Tips

- All form controls have explicit labels and keyboard focus states.
- Transparent background toggle helps compose QR codes over other assets.
- Keep ECC at “H” when a logo covers a large portion of the code for best scanning reliability.

Released under the MIT License.
