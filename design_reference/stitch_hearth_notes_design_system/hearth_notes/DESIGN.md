---
name: Hearth Notes
colors:
  surface: '#f4fcef'
  surface-dim: '#d5dcd1'
  surface-bright: '#f4fcef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff6ea'
  surface-container: '#e9f0e4'
  surface-container-high: '#e3eadf'
  surface-container-highest: '#dde5d9'
  on-surface: '#171d16'
  on-surface-variant: '#424843'
  inverse-surface: '#2b322a'
  inverse-on-surface: '#ecf3e7'
  outline: '#727973'
  outline-variant: '#c2c8c1'
  surface-tint: '#466552'
  primary: '#304e3c'
  on-primary: '#ffffff'
  primary-container: '#476653'
  on-primary-container: '#c0e2ca'
  inverse-primary: '#accfb7'
  secondary: '#8b4e39'
  on-secondary: '#ffffff'
  secondary-container: '#fdae94'
  on-secondary-container: '#783f2b'
  tertiary: '#6e5d2c'
  on-tertiary: '#ffffff'
  tertiary-container: '#bfa971'
  on-tertiary-container: '#4d3e0f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8ebd3'
  primary-fixed-dim: '#accfb7'
  on-primary-fixed: '#022112'
  on-primary-fixed-variant: '#2f4d3b'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ffb59c'
  on-secondary-fixed: '#370e01'
  on-secondary-fixed-variant: '#6e3724'
  tertiary-fixed: '#f9e0a3'
  tertiary-fixed-dim: '#dcc58a'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#554516'
  background: '#f4fcef'
  on-background: '#171d16'
  surface-variant: '#dde5d9'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Newsreader
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  title-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system channels the quiet, contemplative ambiance of a sunlit personal library. Built for writers, researchers, and mindful thinkers, it reconciles the utility of a modern knowledge engine with the tactile warmth of archival paper, bespoke bookbinding, and natural materials. 

The aesthetic blends **Warm Editorial Minimalism** with soft tactile elements:
- Generous breathing room that encourages slow, focused thought over sensory overload.
- Layered warm paper stocks rather than synthetic digital flat planes.
- Organic herbal tones (sage, terracotta, mustard) that signal intellectual calm and mindful curation.
- A balanced pairing of a functional geometric grotesque with literary editorial serifs.

## Colors

The palette is rooted in tactile organic pigments, avoiding sterile cool grays or harsh digital blacks:

- **Canvas & Backgrounds**: The global backdrop is warm ivory (`#F7F5EF`), establishing a non-glare, paper-like baseline. Primary elevated containers rely on warm off-white (`#FFFEFA`), while embedded wells, sidebars, and inactive panels adopt muted warm stone (`#F0EDE5`).
- **Primary Accent (Forest Sage - `#476653`)**: Used for key interactive triggers, selected states, and progressive focus indicators. Supported by soft sage tint (`#E0E9DE`) for active pills, hover highlights, and callout backgrounds.
- **Secondary Accent (Muted Terracotta - `#C9826A`)**: Reserved for tagging, critical annotations, bookmarks, and creative highlights. Supported by soft terracotta surface (`#F3E0D6`).
- **Tertiary Accent (Soft Mustard - `#DCC58A`)**: Denotes pinned notes, highlights, fleeting thoughts, and contextual warnings.
- **Typography & Structure**: Primary text sits in deep warm charcoal (`#30372F`), maintaining accessible contrast without the visual severity of pure black. Secondary metadata uses muted olive-grey (`#777B70`). Structural boundaries and hairpins rely on soft stone borders (`#E5E0D5`).

## Typography

The typographic hierarchy pairs the literary authority of **Newsreader** (used for major document headings, long-form editorial titles, and reflective quotes) with the functional precision of **DM Sans** (for UI controls, metadata, and body reading).

- **Headlines & Editorial Titles**: Rendered in Newsreader. It brings a physical, literary quality to notebooks, book spines, and article titles.
- **Interface & Content Body**: Handled by DM Sans. Its low-contrast, geometric yet warm letterforms optimize scannability in dense sidebars, outline trees, and multi-line body paragraphs.
- **Rhythm**: Body copy strictly preserves a relaxed `1.5` to `1.6` line-height ratio to prevent visual fatigue during prolonged writing sessions.

## Layout & Spacing

The layout is built upon an 8-point harmonic spacing grid that scales dynamically across viewports.

- **Desktop (1200px+)**: Multi-pane layout consisting of a collapsible navigation rail (240px–280px), a flexible note/index list (320px–360px), and an expansive editorial reading canvas centered with a max-width of 760px. Gutters maintain `1.5rem` (24px) spacing, with outer screen margins set to `2rem` (32px).
- **Tablet (768px - 1199px)**: Sidebars transition into off-canvas sliding sheets or collapsible drawers. The central editor expands to fill the viewport while retaining `1.5rem` horizontal padding.
- **Mobile (<768px)**: A single focused pane with bottom-sheet interactions for metadata, tags, and document outlines. Margins drop to `1rem` (16px) to maximize usable content width.

## Elevation & Depth

Visual hierarchy favors physical paper layering and delicate hairline boundaries over aggressive blur drop-shadows.

- **Flat/Tonal Hierarchy**: Depth is communicated primarily by contrasting `#F7F5EF` (app canvas), `#F0EDE5` (recessed sidebars/wells), and `#FFFEFA` (raised cards and sheets).
- **Hairline Outlines**: Elements rely on crisp 1px borders using `#E5E0D5` to define boundaries without visual noise.
- **Ambient Shadow System**: Where physical elevation is mandatory (floating action bars, dropdown menus, modals):
  - *Level 1 (Hover cards, popovers)*: `0 2px 8px -2px rgba(48, 55, 47, 0.05), 0 1px 3px -1px rgba(48, 55, 47, 0.03)`
  - *Level 2 (Modals, command palettes)*: `0 12px 32px -4px rgba(48, 55, 47, 0.08), 0 4px 12px -2px rgba(48, 55, 47, 0.04)`
- Shadows are tinted with the deep warm charcoal base (`rgba(48, 55, 47, *)`) rather than pitch black, preserving the natural ambient warmth of paper.

## Shapes

The design system incorporates tailored border radii that correspond to component scale and tactile hierarchy:

- **Small Components (10px–12px)**: Buttons, inputs, search fields, and contextual menus balance structured discipline with softness.
- **Medium Containers (16px)**: Content cards, notebook preview panels, and drawer panels provide a comfortable, pocket-notebook feel.
- **Large Overlays (20px)**: Dialogs, floating sheets, and focus-mode modals emphasize friendly enclosure.
- **Pills (`9999px`)**: Badges, status tags, and avatar rings.

## Components

### Buttons
- **Primary**: Solid forest sage background (`#476653`), white text, 10px radius, 0 1px 2px rgba(48,55,47,0.12) shadow. On hover, darken to `#3B5545`. Focus states present a 2px offset ring in `#476653`.
- **Secondary**: Soft stone surface (`#F0EDE5`), charcoal text (`#30372F`), border in `#E5E0D5`. On hover, surface shifts to `#E5E0D5`.
- **Ghost/Tertiary**: Transparent surface, olive-grey text (`#777B70`). On hover, soft sage tint (`#E0E9DE`) with deep charcoal text.

### Inputs & Text Areas
- Built with a 10px–12px radius, `#FFFEFA` fill, and `#E5E0D5` border.
- Placeholder copy rendered in `#777B70` at 60% opacity.
- Focused inputs receive a crisp 1.5px border in forest sage (`#476653`) with no loud outer glow.

### Cards & Notes
- Rendered on warm off-white (`#FFFEFA`) with a 1px border (`#E5E0D5`) and 16px border-radius.
- Internal padding matches `space-lg` (24px) for desktop view and `space-md` (16px) for compact feeds.
- Pinned or highlight notes feature a subtle left accent strip (3px) in soft mustard (`#DCC58A`) or terracotta (`#C9826A`).

### Chips & Tags
- Height: 24px–28px, pill-shaped radius (`9999px`).
- Inactive tags utilize `#F0EDE5` background with `#777B70` typography.
- Active or thematic chips map directly to accent tints: Sage Chip (`#E0E9DE` bg, `#476653` text), Terracotta Chip (`#F3E0D6` bg, `#C9826A` text).

### Checkboxes & Radios
- 18px dimensions with a 4px corner radius for checkboxes, full circle for radios.
- Unchecked: `#FFFEFA` surface with 1.5px `#E5E0D5` border.
- Checked: Solid `#476653` fill with an off-white geometric checkmark.

### Dialogs & Modals
- 20px corner radius, centered canvas overlay with a 30% opacity warm charcoal backdrop blur (`rgba(48, 55, 47, 0.25)`).
- Modal container built with `#FFFEFA`, framed by a 1px `#E5E0D5` stroke and Level 2 ambient shadow.