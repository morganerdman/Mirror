# Mirror — Figma Handoff Package

Everything you need to reconstruct the Mirror UI in Figma.

## What's here

```
handoff/
  README.md              ← you are here
  tokens.md              ← colors, type, radii, shadows — copy into Figma variables
  states-index.html      ← live render of every screen/variant in one page
  frames/                ← PNG snapshot of each state (reference only, viewport-resolution)
    01-landing.png
    02-conv-v1-empty.png
    03-conv-v2-empty.png
    04-conv-v2-poetic.png
    05-results-v1.png
    06-results-v2-standard.png
    07-results-v2-minimal.png
    08-modal-v2.png
```

The full React source lives in the project's `src/` folder — the MCP agent should read those files directly for highest fidelity. `states-index.html` renders all of them on one page at their intended 1440×N artboard sizes.

## Recommended workflow for the Figma MCP side

1. **Open this folder in a Claude client that has the Figma MCP connected.** Claude Desktop or an IDE plugin — anywhere `figma-mcp` tools are available.
2. **Seed the context:**
   - Read `tokens.md` and create matching Figma variables (colors, radii, shadows, type styles).
   - Read `src/tokens.jsx` for the authoritative OKLCH values.
3. **Per screen, translate the React component to a Figma frame:**
   - Open the corresponding `src/*.jsx` file.
   - Create a 1440-wide frame.
   - Walk the component tree, creating matching Figma layers with the tokens you set up.
   - Reference `frames/NN-*.png` for visual verification (viewport-resolution, so use as guide not source of truth).
4. **Key decisions to preserve:**
   - **V1 vs V2 are different designs, not iterations** — keep both as separate pages/frames in Figma.
   - **Sidebar variants** (`structured` / `observation` / `poetic`) are runtime-toggled in v2 — create Figma component variants, not separate frames.
   - **Density** in results v2 (`minimal` / `standard` / `detailed`) is also a runtime toggle — variants.

## Screens included

| ID | Version | Notes |
|---|---|---|
| landing | shared | Hero + Salar de Uyuni full-bleed intro |
| conv-v1-empty | v1 | Chat, empty state, structured sidebar |
| conv-v2-empty | v2 | Chat, empty state, observation sidebar, "a guide, not a diagnosis" footer |
| conv-v2-poetic | v2 | Chat, mid-conversation, poetic-card sidebar |
| results-v1 | v1 | Expandable stack of career cards |
| results-v2-standard | v2 | Grid of career tiles, standard density |
| results-v2-minimal | v2 | Same grid, minimal density |
| modal-v2 | v2 | Career detail modal with tabs + evidence sources |

## Caveats

- `frames/*.png` are rendered from the preview iframe, so they're capped around 900px wide. The HTML source renders at full 1440 — if you need pixel-perfect reference, open `states-index.html` in a desktop browser at full width.
- Liquid-glass effects use `backdrop-filter` — Figma can't preview this natively; approximate with a layer blur + low-opacity fill.
- Italic serif (`Crimson Pro`) is the only non-Inter family; treat as a design-system font not swappable.
