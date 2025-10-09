# Liquid Glass QR Generator

A playful, glassmorphic QR code creator built with Vite, React, and TypeScript. Tune gradients, embed logos, toggle module styles, and export crisp codes that run fully on GitHub Pages.

## Highlights

- **Liquid glass UI** with animated sheen, light/dark themes, and reduced-motion awareness.
- **Real-time preview** with controls for size, margin, ECC, gradients, module shapes, and finder eyes.
- **Logo embedding** that auto-bumps ECC when coverage is risky and supports uploads or external URLs.
- **One-click exports** to PNG, JPG, SVG, WEBP, plus clipboard copy with configurable resolution and transparency.
- **Stateful sharing** via encoded URLs so collaborators can reproduce presets instantly.

## Getting Started

```bash
npm install
npx playwright install    # once, to download browser engines
npm run dev               # start Vite on http://localhost:5173
```

Key commands:

- `npm run build` – type-check and bundle for GitHub Pages (`dist/`).
- `npm run preview` – serve the production build locally.
- `npm run lint` / `npm run format` – enforce ESLint + Prettier standards.
- `npm run test:e2e` – Playwright smoke tests across Chromium, Firefox, WebKit.
- `npm run check:accessibility` – focused accessibility assertions tagged with `@a11y`.

## Project Structure

```
├─ src/
│  ├─ App.tsx               # Composition of editor, preview, and export panels
│  ├─ components/           # GlassCard, QREditor, QRPreview, ExportPanel
│  ├─ lib/                  # QR helpers, export utilities, presets, URL/state helpers
│  ├─ styles/globals.css    # Tailwind layers + liquid glass theming
│  └─ main.tsx              # Vite bootstrap
├─ tests/e2e/               # Playwright specs & fixtures
├─ playwright.config.ts     # Test runner configuration
└─ tailwind.config.js       # Theme tokens and glassy shadows
```

## Deployment Notes

1. Ensure `vite.config.ts` `base` matches your GitHub Pages path (`/<repo>/`). Set `VITE_BASE_PATH` in the publish workflow for custom domains.
2. Run `npm run build`; deploy the `dist/` output via GitHub Pages or a static host.
3. Add `CNAME` (if using a custom domain) to `public/` before building so Vite copies it across.
4. Verify clipboard and download flows in Safari and Chrome—both are covered by automated tests but real devices are recommended.

## Accessibility & Performance

- All inputs are label-linked, keyboard navigable, and announce preview updates through `aria-live`.
- Color contrast guidance warns when gradients reduce scannability.
- Animations automatically disable when `prefers-reduced-motion` is set.
- QR updates are debounced to balance responsiveness with rendering cost; export routines spawn transient instances to keep the bundle small.

## Credits

Released under the MIT License. Built for contributors who want a fast, beautiful QR sandbox that stays static-friendly on GitHub Pages.
