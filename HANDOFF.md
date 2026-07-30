# HANDOFF — SKIÁ ATHENS
## Super high-end Greek clothing brand website — full build spec

> **Who this is for:** A fresh Claude Code chat (Opus) continuing this project.
> **Planned by:** Fable 5, 2026-07-29, after user Q&A + live extraction of the inspiration site.
> **Your job:** Execute this plan. Do not re-plan, do not re-ask the questions already answered below.

---

## 0. LOCKED DECISIONS (user-confirmed — do not re-litigate)

| Decision | Answer |
|---|---|
| Brand | **Invented from scratch** (spec in §2 — use it) |
| Site type | **Hybrid** — editorial/lookbook-first with a minimal shop section for select pieces (no cart/checkout; "ACQUIRE" → enquiry) |
| Language | **English only** (Greek identity expressed through design, naming, and Greek-letter motifs — not through Greek-language copy) |
| Stack | **Static HTML/CSS/JS + GSAP (ScrollTrigger)** — no framework, no build step |
| Design inspo | **https://grayscale-studio.jp/en — follow HEAVILY** (extraction in §3) |
| Skills to load | `/gpt-taste`, `/high-end-visual-design`, `/image-to-code` — load ALL THREE before writing any code, plus any others the process calls for |

---

## 1. REQUIRED WORKFLOW (order is mandatory)

1. **Load skills:** invoke `gpt-taste`, `high-end-visual-design`, `image-to-code` via the Skill tool.
2. **Image-first (per image-to-code):** generate **one large reference image per section** (§5 lists 8 sections → 8 images, plus detail/extraction images if text is unreadable). Use the available image-generation tool (the Hugging Face MCP `gr1_z_image_turbo_generate` tool is connected in this environment; if unavailable, ask the user to authorize it — do NOT skip to freeform coding). Never crop old images; regenerate fresh section images instead.
3. **Deep analysis:** extract text, type scale, spacing, buttons, palette, component logic from each image per the image-to-code rules.
4. **Implement:** static site in `/home/akos/skia/site/` matching the references faithfully (anti-drift rule). Output the gpt-taste `<design_plan>` block first — the RNG selections are already locked in §6; restate them, verify AIDA / hero math / bento density / label sweep, then code.
5. **Verify:** open in browser, check against §8 acceptance checklist.

---

## 2. BRAND IDENTITY (invented — locked, but cosmetic tweaks allowed if user asks)

- **Name:** **SKIÁ** (σκιά — Greek for *shadow*). Full lockup: **SKIÁ ATHENS** or **SKIÁ ATHENS EST. MMXXVI**.
- **Concept spine:** *Light and Shadow* — the famous Attic light of Greece and the shadow it casts. This is the Greek analog of Grayscale Studio's literal "BLACK WHITE / 000 fff" concept. Every design choice reduces to this duality: white marble / black shadow.
- **Tagline options:** "CUT FROM LIGHT AND SHADOW." / "THE ATTIC LIGHT, WORN." Pick one, keep it short.
- **Voice:** terse, declarative, museum-placard tone. No luxury clichés ("elevate", "timeless elegance", "seamless"). Sentences under 10 words where possible.
- **Product naming system:** garments named after Greek marbles/islands — **PENTELI** (overcoat), **PAROS** (shirt), **NAXOS** (trouser), **THASSOS** (knit), **TINOS** (jacket). Each carries a tone code (e.g. `PENTELI — ECEC EC`).
- **Signature motif (mirrors inspo's 000/fff SVG labels):** garment-tag style labels rendered as inline SVG/CSS chips: `[ SKIÁ — 000 ]`, `[ ΦΩΣ — FFF ]`, `[ ΑΘΗΝΑ 37.9838° N ]`. Used sparingly — 1 per section max (micro-UI clutter rules still apply).
- **Logotype:** wordmark "SKIÁ" set in the display face (Anton), all-caps, tight tracking, with the accent on the Á as the only "ornament". No icon logo.

---

## 3. INSPIRATION EXTRACTION — grayscale-studio.jp/en (verified from live site bundle)

Facts pulled from their actual CSS/JS on 2026-07-29 — this is the design DNA to follow:

- **Fonts:** **Anton** (heavy condensed display, all-caps) + Inter (body) + Noto Sans JP. *(We keep Anton; body font replaced per skill bans — see §4.)*
- **Palette:** strict grayscale, no color anywhere. Their exact ramp:
  `#000 #1e1e1e #232323 #2f2f2f #3c3c3c #4e4e4e #707070 #929292 #999 #b2b2b2 #d3d3d3 #d9d9d9 #ececec #fff`
- **Letter-spacing:** `-0.01em` on display type, `0.05em` on labels/micro-caps, `0` body.
- **Signature elements:** SVG hex-code labels (`000-label.svg`, `fff-label.svg`, `logo-label.svg`) treated like physical garment/product tags; "BLACK WHITE" as literal concept copy; all-caps nav ("ABOUT US", "ALL PRODUCTS"); "COMING SOON" / "CLOSED" status words used as design elements.
- **Motion:** GSAP ScrollTrigger (found `"top bottom"` trigger strings in their bundle). Next.js SPA feel, heavy scroll choreography.
- **Overall:** monochrome, industrial-minimal, label/tag-driven, cinematic, zero decoration that isn't systematic.

**Translation rule:** SKIÁ = Grayscale Studio's system transposed to Greek luxury fashion. Same monochrome discipline, same tag motif, same heavy condensed caps — but the imagery is marble, drapery, Aegean light/shadow, and tailored garments instead of outdoor products.

---

## 4. DESIGN SYSTEM (tokens — implement as CSS custom properties)

- **Palette:** use the exact 14-step ramp from §3. Page bg `#ececec` (marble white) for light sections, `#050505` for dark sections. Text `#000`/`#fff` only. **No color. Ever.** Accent = pure `#000` on light / pure `#fff` on dark.
- **Typography:**
  - Display: **Anton** (Google Fonts) — all-caps, `letter-spacing: -0.01em`, `clamp(3rem, 9vw, 11rem)` for hero-scale, tighter for section heads.
  - Body/UI: **Satoshi** (Fontshare) — Inter is banned by both taste skills. Fallback stack: `Satoshi, "Helvetica Neue", sans-serif` is NOT allowed as visible font — Satoshi must load.
  - Micro-labels: Satoshi 500, `text-transform: uppercase`, `letter-spacing: 0.05em`, 10–11px.
- **Imagery:** all photography forced monochrome: `filter: grayscale(1) contrast(1.15)`. Use `https://picsum.photos/seed/{keyword}/1920/1280` with seeds like `marble`, `drapery`, `athens`, `linen`, `statue`, `shadow`. Fixed aspect-ratio frames (media-frame rule): hero full-bleed, lookbook 3:4 portrait, shop 4:5.
- **Surfaces:** sharp corners dominate (radius 0) to match inspo's industrial feel; the ONLY rounded elements are pill CTAs and tag-labels (`border-radius: 999px`). Double-bezel treatment reserved for shop product frames only (hairline `1px rgba(0,0,0,.12)` outer, padded inner) — no box-in-box anywhere else.
- **Motion:** custom bezier `cubic-bezier(0.32, 0.72, 0, 1)`, durations 700–1200ms. GSAP + ScrollTrigger via CDN (`gsap.min.js`, `ScrollTrigger.min.js`). All animation on `transform`/`opacity` only. `overflow-x: hidden` on `main`. Reduced-motion media query respected.
- **Spacing:** section padding `clamp(8rem, 14vh, 14rem)` vertical. Sections are cinematic chapters — huge gaps, per gpt-taste spacing rule.

---

## 5. SITE STRUCTURE — single page, 8 sections (+ nav)

One long editorial page (matches inspo SPA feel). Generate **one reference image per section** before coding.

0. **NAV** — minimal split nav: "SKIÁ" wordmark top-left, right side: `COLLECTION / ATELIER / STOCKISTS / ACQUIRE` in micro-caps. Transparent over hero, inverts color per section (mix-blend or class swap). NOT a glued edge-to-edge bar — floats with padding, no background until scroll.
1. **HERO (Attention)** — Cinematic Center: full-bleed monochrome campaign image (draped figure in hard sunlight, deep shadow), dark radial wash, massive Anton "SKIÁ" (1 line) with sub-line tagline (1 line), exactly two CTAs: `VIEW COLLECTION` (white pill, black text) + `THE ATELIER` (hairline outline pill, white text). One tag-label bottom corner: `[ ΑΘΗΝΑ — 000 / FFF ]`. Nothing else. H1 container `max-w` full/6xl — never wraps past 2 lines.
2. **MANIFESTO (Interest)** — scrubbing text reveal: centered statement paragraph (~30 words on light/shadow), words scrub from `opacity: 0.1` → `1` on scroll. Light bg `#ececec`. No heading label above it (meta-label ban).
3. **COLLECTION 01 (Desire)** — GSAP pinned split: left column pins with `COLLECTION 01 — MARMARA` in Anton + short intro; right column: 5 garment images (PENTELI, PAROS, NAXOS, THASSOS, TINOS) scroll upward past it, each with name + tone-code caption.
4. **LOOKBOOK** — horizontal accordion: 5 vertical slices, each a monochrome look; hover expands slice to reveal image + look number. Dark section `#050505`.
5. **SHOP — SELECT PIECES (hybrid requirement)** — gapless bento grid (`grid-auto-flow: dense`, verify no empty cells): 4 cards — 2 large (col-span-2) products + 2 standard. Each: image, name, price in EUR (`€1,240`), status word (`AVAILABLE` / `COMING SOON` as design element, per inspo). CTA per card: `ACQUIRE` → mailto/enquiry link. No cart.
6. **ATELIER (story)** — Editorial Split with massive negative space: Anton heading with ONE inline typography image (pill-shaped image of hands/fabric embedded in the heading), short paragraph on the Athens atelier, one image right.
7. **MARQUEE + FOOTER (Action)** — infinite marquee strip: `SKIÁ — ΦΩΣ — 000 — ΣΚΙΑ — FFF —` repeating in Anton outline/fill alternation. Below: massive footer CTA `ENQUIRIES — ATELIER@SKIA.GR`, stockists line (Athens / Mykonos / Paris), micro-caps legal line. High contrast black bg.

**Image scroll behavior (global):** images enter at `scale: 0.8` → `1`, fade to `opacity: 0.2` on exit (gpt-taste Image Scale & Fade).

---

## 6. gpt-taste RNG SELECTIONS — LOCKED (restate in your `<design_plan>`, do not reroll)

```
seed = len(prompt) % variants
hero          -> 1: Cinematic Center (full-bleed image + radial wash)
type_stack    -> Anton (display, inspo-mandated) + Satoshi (body)
components    -> [Horizontal Accordion, Infinite Marquee, Inline Typography Image]
gsap          -> [Scroll Pinning (split), Scrubbing Text Reveal]
vibe          -> custom: "Marble Monochrome" (inspo-derived; overrides archetype list)
layout        -> Editorial Split + gapless bento for shop
```

AIDA check: Nav ✓ Hero(1) ✓ Interest(2,3) ✓ Desire(4,5,6) ✓ Action(7) ✓.

---

## 7. FILE STRUCTURE

```
/home/akos/skia/
  HANDOFF.md          <- this file
  refs/               <- generated section reference images (save all here)
  site/
    index.html
    css/main.css
    js/main.js        <- GSAP init, ScrollTriggers, accordion, marquee, nav invert
```

---

## 8. ACCEPTANCE CHECKLIST (verify before declaring done)

- [ ] 8 section reference images generated FIRST and analyzed (image-to-code order respected)
- [ ] Zero color anywhere — grayscale ramp only; all photos `grayscale(1)`
- [ ] Anton + Satoshi loaded; **no Inter/Roboto/Arial visible anywhere**
- [ ] H1 ≤ 2 lines at 1440px AND 1280px viewports
- [ ] No meta-labels ("SECTION 01", "ABOUT US" as eyebrow) — status words (`COMING SOON`) and tag-labels are the ONLY micro-copy chips, max 1/section
- [ ] Shop bento: mathematically gapless, `grid-auto-flow: dense`
- [ ] GSAP: pinned collection split + scrubbed manifesto both working; all motion `transform`/`opacity`; custom bezier; `prefers-reduced-motion` fallback
- [ ] No horizontal scrollbar at any viewport; mobile collapses to single column, accordion → vertical stack
- [ ] Buttons: perfect contrast (white pill/black text on dark, inverse on light)
- [ ] Reads as $150k agency build — run both skills' pre-flight checklists before delivering

---

## 8b. BUILD LOG — executed 2026-07-29 by Opus 5

**Status: built and verified.** Site is at [site/index.html](site/index.html), served during testing at `http://localhost:8377`.

Verified in headless Chromium at 1440 / 1280 / 390 via `puppeteer-core` (DOM measurement, not eyeballing):

| Check | Result |
|---|---|
| 8 section refs generated first, then analyzed | PASS — in [refs/](refs/) |
| Zero colour; all photos `grayscale(1)` | PASS — computed-style sweep found **0** non-greyscale values at all 3 viewports |
| Anton + Satoshi, no banned fonts | PASS — banned-font sweep returns `[]` (fixed: `<button>` was inheriting Chromium's Arial) |
| H1 ≤ 2 lines at 1440 **and** 1280 | PASS — **1 line** at all 3 (single unwrappable word) |
| No meta-labels; ≤1 chip per section | PASS |
| Bento gapless + `grid-auto-flow: dense` | PASS — 2×2+2×1+1×1+1×1 = 8 cells fills 4×2 exactly; measured child rects tile the container with no voids |
| GSAP pin + scrub working | PASS — 24 ScrollTriggers live; pin and word-scrub both confirmed in captures |
| No horizontal scroll; mobile single-column | PASS — `scrollWidth == clientWidth` at all 3 |
| Button contrast | PASS — solid `#fff`/`#000`, ghost transparent/`#fff` |

**Defects found and fixed during verification**
1. `<button>` didn't inherit `font-family` → Arial leaked in. Added `button,input,select,textarea{font:inherit}`.
2. Accordion expand rules lived only inside `@media (hover:hover)` → click/`.is-open` did nothing on large touch screens. Split into a resting/click state plus a hover-only override.
3. Shop grid rows ballooned to ~1073px from `min-height` on the frames. Replaced with `grid-auto-rows: clamp(240px,22vw,360px)` + `aspect-ratio` on mobile.
4. Nav rendered an opaque light slab over the black footer at page bottom (the footer is shorter than the viewport, so it never crosses the nav line). Replaced the solid stuck background with a theme-matched gradient scrim, and made theme resolution fall back to the last started section.
5. Mobile hero: tagline and ghost-button hairline were illegible over bright imagery. Deepened the radial wash and raised the ghost border to `.6` alpha.

**Deviations from this plan, and why**
- **Only 8 refs, no sharpening regens.** Hugging Face ZeroGPU quota was exhausted after 8 images. The quota is account-wide, so Qwen-Image-Fast / FLUX-schnell / FLUX-Krea all fail identically via `dynamic_space` — it is not a per-Space limit. Four refs (nav, collection, lookbook, shop) reproduced patterns the skills explicitly ban (dead grid cells, floating card-on-marble wrappers with drop shadows, gapped accordion); those were corrected in code rather than reproduced. Re-run the regens after the daily reset or with HF PRO if you want sharper references.
- **Display font.** The image model has no Anton and rendered a wide heavy grotesque. Anton is kept per §4 — it is the typeface verified from the real inspiration site's bundle, which outranks a generator substitution.
- **Imagery.** picsum has no garment or atelier photography at all (its library is stock laptops and landscapes). Rather than fake it, the image world leans into architecture, hard light, stone and figures — which *is* the brand concept. 16 unique IDs were hand-picked from a 240-thumbnail contact sheet. **These are placeholders and are the weakest part of the build**; real photography is the single highest-value upgrade.

---

## 9. OPEN ITEMS (ask user only when relevant, don't block)

- Real photography/assets: placeholders (picsum, grayscaled) are fine for v1; swap later.
- Domain/hosting, and whether the shop later grows into real e-commerce (would motivate a Next.js migration — out of scope now).
- Brand name approval: SKIÁ is the pick; alternates considered: MELAS, LITHOS, PAROS, ACHROMA.
