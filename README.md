# Vessyl — two website editions

An editorial website for Vessyl in Arenal, Costa Rica. Both editions share 17 pages in English and Latin American Spanish, approved content, original photography and enquiry destinations.

- **Classic 2D:** https://razdorsky.github.io/vessyl-website/classic/
- **Immersive 3D:** https://razdorsky.github.io/vessyl-website/immersive/

Classic and Immersive have separate page renderers and compositions. Immersive uses a continuous scroll-driven camera through 56 architectural and photographic chapters. The edition switch preserves the current page; Classic does not initialize WebGL.

## Local development

Requires Node.js 24 or newer and Python 3 for content validation.

```sh
npm ci
npm run build
npm run check
npm run preview
```

Open http://localhost:4173/classic/ or http://localhost:4173/immersive/. For development:

```sh
npm run dev -- --host 127.0.0.1 --port 5173
```

The site exports static HTML and needs no database or application backend.

## GitHub Pages

The Pages workflow builds and validates both editions on pushes to `main`, then deploys `outputs/github-pages`. Pull requests run the same validation without deployment. Repository Pages settings use **GitHub Actions** as the publishing source.

To reproduce the public artifact:

```sh
npm run build:github
NEXT_PUBLIC_BASE_PATH=/vessyl-website npm run check
```

The artifact includes `.nojekyll`, both editions, bundled scripts, fonts and media. Run `npm run build` again to restore root-relative URLs for the local preview.

## Pages and interactions

Home; Founder; Experience; Frequency Dome; Harmonic Hearth; Equine & Nature; Personal Sessions; Quantum; Wellness; Facilitators; AKEN Soul; El Rancho; App; Music; Press; Contact; FAQ.

Session filters, detail dialogs, room carousels, galleries and FAQ use keyboard-accessible controls. Galleries show a stacked preview and support keyboard arrows, image-edge clicks, drag/swipe and thumbnails. Menus and dialogs support Escape and focus restoration. All films use one player: silent looping playback on view, restart with sound and looping disabled on first activation, then shared sound and playback controls. Automatic playback respects reduced motion. The 3D renderer pauses offscreen and in hidden tabs. If WebGL fails, the complete journey remains available as text and full photographs.

The globe language selector preserves the page and edition. Spanish routes use `/classic/es-LA/` and `/immersive/es-LA/`, with `es-419` as the document language and formal usted address.

Booking opens the existing AKEN partner. App downloads remain disabled until release destinations are available; the app page links to the existing waitlist. Personal sessions use email enquiries. No booking, payment or form success is simulated.

## Content and typography

`lib/approved-copy.json` records approved wording and its source attribution. Spanish copy and image descriptions live in `lib/locales/`. `npm run check` validates all 68 edition/language routes, internal resources, source copy, translations, display-heading artwork and independent renderers. Generated QA reports are local and ignored by Git.

Fixed headings use Telugu MN glyph outlines and accessible HTML text. Body and interface text use bundled Roboto. Normal builds use the committed SVG artwork and do not require macOS fonts. See [typography generation](scripts/typography/README.md). The Roboto license is in `public/licenses`.

Classic mobile headings use 16px side gutters and wrap their word outlines to the available width. H1 is 39px Bold; H2/H3 retain their approved sizes. This applies to both languages without changing desktop or Immersive typography, or the insets of paragraphs and photographs.

Only prepared website assets are included. Raw source archives and local research records are excluded from this repository.

## Required page-background contract

The document canvas (`html` and `body`), the opaque top edge of the page header, and the server-rendered `theme-color` must share the color defined in `lib/header-theme.ts`. This applies to both editions, both languages, initial rendering, page transitions and the background exposed by mobile overscroll or unused viewport space. Classic Home and Immersive use the warm header color; other Classic pages use the dark header color. Authored section backgrounds remain separate from this outer canvas.

Keep the browser's automatic safe-area layout and native scrolling; do not introduce `viewport-fit=cover`, disabled zoom or scroll suppression as a background fix. If full-bleed safe-area layout is introduced later, account for all safe-area insets before shipping. Browser-owned controls receive the matching `theme-color` hint; their final appearance remains browser-controlled.

Do not override document backgrounds with white, paper or a separate arbitrary color. Change header colors through the shared palette and validate the route's rendered background and browser theme together. The export check enforces matching header tokens and theme metadata on all routes, including Home and 404; UI changes also require mobile browser inspection.
