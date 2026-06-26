# design-sync notes — kerenWebsite

## Setup

- **Shape**: `package` (no Storybook)
- **Entry**: `client/design-system.ts` — barrel file at `client/` root, re-exports all 15 components. This file IS committed and required for re-sync.
- **PKG_DIR**: resolved to `client/` via `client/package.json` (`name: "keren-client"`). All config paths (`cssEntry`, `tsconfig`, `srcDir`) are relative to `client/`.
- **CSS**: Built from Vite + Tailwind v4. Run `cd client && npm run build` first (recorded as `buildCmd`). The compiled CSS hash is `index-CYbOO3P-.css` — if it changes after a rebuild, update `cssEntry` in config.
- **No .d.ts files**: `tsconfig.app.json` has `"noEmit": true`. The DTS extractor finds 0 exports from `.d.ts`. Components are discovered purely via `componentSrcMap` entries in config (all 15 components pinned explicitly). Type bodies are synthesized by ts-morph from source.
- **Fonts**: All 4 families (Frank Ruhl Libre, Heebo, JetBrains Mono, Noto Serif SC) are loaded from Google Fonts at runtime via `index.css` `@import url(...)`. Set as `runtimeFontPrefixes` — no font files to ship.
- **Icons**: `Icon` is a compound namespace object (`Icon.Calendar`, `Icon.Check`, etc.) — shows as `[BUNDLE_EXPORT] 1 compound namespace`. Usable in previews as `<Icon.Calendar s={20} />`.

## Re-sync

Before re-syncing:
1. `cd client && npm run build` to refresh the compiled CSS (if components changed)
2. If the CSS hash changed, update `cssEntry` in `.design-sync/config.json` to match `client/dist/assets/index-*.css`
3. Run the driver: `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules client/node_modules --entry ./client/design-system.ts --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json`

## Known render warns

- `[RENDER_THIN]` on `Enso` floor card (before authoring): Enso is an SVG-only element with no text — expected thin warning on the auto-generated floor card. Resolved by the authored preview.
- `[RENDER_BLANK]` on `Button` floor card: The auto-generated floor card for Button rendered blank. Resolved by the authored preview.
- `[GRID_OVERFLOW]` on `BookingModal`, `ContactModal`: Both use `position: fixed` which escapes grid cells. Resolved with `cardMode: "single"` in `cfg.overrides`.

## Re-sync risks

- **CSS hash**: `cssEntry` is pinned to a specific Vite content-hash filename. If the client CSS changes, the hash changes and the re-sync will skip CSS — update `cssEntry` after every client build.
- **No TypeScript declarations**: Props bodies are `[key: string]: unknown` since no `.d.ts` files are emitted. If detailed prop types matter, add `cfg.dtsPropsFor.<Name>` entries or enable `declaration: true` in a separate tsconfig.
- **Page components load API modules**: `BookingModal`, `ClientPortal`, `Dashboard`, etc. import `../auth`, `../constants`, `../data`. These resolve fine via esbuild but if those modules change significantly, previews may break on re-sync.
- **`client/design-system.ts` barrel**: If components are added/removed from the app, update this barrel file to match.
