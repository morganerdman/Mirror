# Mirror — Design Tokens

Canonical values. Copy these into your Figma variables / styles.

## Colors (OKLCH)

All colors authored in OKLCH to preserve perceptual uniformity across the palette. Figma accepts OKLCH as of 2024; if your team is on an older build, the hex fallbacks below are approximate (generated via `oklch()` → sRGB).

### Backgrounds
| Token | OKLCH | Hex ≈ | Use |
|---|---|---|---|
| `salt` | `oklch(0.97 0.008 80)` | `#f6f4ee` | Page background, the "warm off-white salt" from the Uyuni hero |
| `saltDeep` | `oklch(0.94 0.012 80)` | `#ede9df` | Slightly deeper salt — sidebar, card alt |
| `fog` | `oklch(0.90 0.015 230)` | `#dbe1e8` | Pale blue fog — hairline dividers on cool surfaces |

### Ink (text)
| Token | OKLCH | Hex ≈ | Use |
|---|---|---|---|
| `ink` | `oklch(0.22 0.015 240)` | `#262a33` | Primary text |
| `inkSoft` | `oklch(0.38 0.015 240)` | `#474c57` | Secondary text |
| `inkFaint` | `oklch(0.55 0.012 240)` | `#6c7078` | Meta, eyebrow labels |
| `inkHairline` | `oklch(0.82 0.010 240)` | `#c4c8ce` | 1px rules |

### Accents
| Token | OKLCH | Hex ≈ | Use |
|---|---|---|---|
| `sky` | `oklch(0.72 0.09 230)` | `#6ca5c9` | Cerulean pulled from the Uyuni sky reflection — primary accent |
| `skyDeep` | `oklch(0.55 0.10 240)` | `#486f94` | Deeper reflection blue — italic serif emphasis in hero |
| `earth` | `oklch(0.68 0.04 60)` | `#b19d88` | Dusty warm earth — secondary accent |

### Utility / Glass
| Token | Value | Use |
|---|---|---|
| `glassTint` | `rgba(255,255,255,0.28)` | Liquid-glass panel fill |
| `glassEdge` | `rgba(255,255,255,0.55)` | Liquid-glass highlight edge |
| `glassShadow` | `rgba(22,40,66,0.18)` | Liquid-glass drop shadow |

## Radii
| Token | Value |
|---|---|
| `sm` | 6px |
| `md` | 12px |
| `lg` | 20px |
| `pill` | 999px |

## Shadows
| Token | Value |
|---|---|
| `card` | `0 1px 2px rgba(22,40,66,0.04), 0 8px 24px rgba(22,40,66,0.06)` |
| `lift` | `0 2px 4px rgba(22,40,66,0.05), 0 24px 60px rgba(22,40,66,0.12)` |

## Type

Two families, used with intent — do not substitute.

| Role | Family | Weight | Notes |
|---|---|---|---|
| Display / editorial | `Crimson Pro` (serif) | 400, italic | Hero, section headers, the "feels like a thoughtful editor wrote this" voice |
| UI / body | `Inter` (sans) | 400, 500, 600 | All running text, chat, sidebar, tabs, metadata |
| Eyebrow / label | `Inter` | 500, uppercase | Small caps labels (`0.7em`, `letter-spacing: 0.14em`) |

Body size: 16px at 1.6 line-height. Chat bubbles: 17px. Sidebar observations: 14px at 1.55.

## Spacing
No named scale — layouts use the 4px grid. Common values in use:
`4 · 6 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64 · 96`

## Motion

| Context | Duration | Easing |
|---|---|---|
| Hover state | 120ms | `ease-out` |
| Card expand / modal open | 240ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Streaming text reveal | per-char 8–14ms | linear |

## File map (for the Figma MCP side)
- `src/tokens.jsx` — the authoritative source for color/radius/shadow values
- `src/landing.jsx` — landing hero
- `src/conversation.jsx` / `conversation.v2.jsx` — chat screen (v1 is diagnostic, v2 is observation-framed)
- `src/sidebar.jsx` / `sidebar.v2.jsx` — right-side profile (v1 structured, v2 observation/poetic)
- `src/results.jsx` / `results.v2.jsx` — career results (v1 expandable stack, v2 tile grid + modal)
