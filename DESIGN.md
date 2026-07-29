---
name: Cosmic Observatory
colors:
  surface: '#0c1325'
  surface-dim: '#0c1325'
  surface-bright: '#0f172a'
  surface-container-lowest: '#070d1f'
  surface-container-low: '#151b2d'
  surface-container: '#191f32'
  surface-container-high: '#23293d'
  surface-container-highest: '#2e3448'
  primary: '#22d3ee' # Cyan-400
  on-primary: '#ffffff'
  secondary: '#3b82f6' # Blue-500
  background: '#050a18' # Void black
  on-background: '#dce1fb'
  aurora-cyan: '#67e8f9'
  aurora-blue: '#22d3ee'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 56px
    fontWeight: '900'
  headline-md:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '800'
  stat-number:
    fontFamily: Outfit
    fontSize: clamp(1.5rem, 3.2vw, 2.125rem)
    fontWeight: '800'
    fontVariantNumeric: 'tabular-nums'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
  label-caps:
    fontFamily: Outfit
    fontSize: 0.6875rem
    fontWeight: '600'
    letterSpacing: 0.16em
rounded:
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  2xl: 1.75rem # Used for Instrument Panel
  full: 9999px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1280px
---

## Brand & Style

The BINGO Telescope design system is a high-fidelity tribute to the mystery and precision of radio astronomy. It evokes the feeling of a state-of-the-art observatory control room, blending the vast, silent expanse of the universe with the sharp, glowing telemetry of modern scientific instruments.

The core aesthetic relies heavily on **Premium Glassmorphism** layered over a **Minimalist Cosmic** foundation. High-transparency surfaces with heavy backdrop blurs (`backdrop-filter: blur(18px)`) create a sense of depth, suggesting layers of atmospheric data. Visual interest is driven by luminous text gradients (Cyan to Electric Blue), "laser-etched" hairline borders, and smooth micro-animations. The overall mood is authoritative, immersive, and awe-inspiring.

## Colors

The palette is anchored in a **Dark-Only** mode to reflect the deep-space mission of the telescope.

- **Primary (Electric Cyan - `#22d3ee`):** Used for interactive elements, active states, and focal points (like statistical values). It represents the "signal" within the noise.
- **Secondary (Cosmic Blue - `#3b82f6`):** Used for depth, transitions, and gradient pairings with Cyan.
- **Neutral (Cosmic Void - `#050a18`):** The foundational dark space background.

Surfaces leverage complex, layered linear gradients with translucency: e.g., `linear-gradient(180deg, rgba(15, 23, 42, 0.72) 0%, rgba(7, 13, 31, 0.86) 100%)`.

## Typography

Typography is a mix of high-impact geometric sans-serifs and highly readable workhorses.

- **Headlines & Stats:** Use **Outfit** with heavy weights (700-900) and tight tracking. This creates an authoritative, scientific "block" feel. 
- **Telemetry/Numbers:** Statistical numbers also use **Outfit** but crucially rely on `font-variant-numeric: tabular-nums` to maintain precise alignment in dashboards.
- **Body:** **Inter** provides the necessary clarity for long-form scientific text and prose.
- **Eyebrow Labels:** Small, uppercase labels use **Outfit** with very wide letter spacing (`0.16em` or more) to distinguish metadata from content.

## Elevation & Depth

Hierarchy is established through **translucent layers** rather than traditional opaque shadows. 

1.  **Level 0 (Canvas):** Deep space backgrounds, often using a subtle noise/film-grain overlay or very faint celestial gradients.
2.  **Level 1 (Surfaces):** Glassmorphic cards with `backdrop-filter: blur(18px)` and a `1px` subtle border `rgba(148, 163, 184, 0.12)`. 
3.  **Level 2 (Interaction):** Upon hover, elements scale up slightly, border colors shift to cyan `rgba(34, 211, 238, 0.28)`, and they gain a soft, colored glow (`0 0 42px -12px rgba(34, 211, 238, 0.35)`).

## Core Custom Components

Our `src/styles/global.css` defines several highly polished utility classes that form the backbone of the UI:

- **Instrument Panel (`.instrument-panel`, `.stat-cell`, `.stat-value`):**
  A large, unified glassmorphic dashboard container. It groups metrics into distinct cells with overlapping hairline borders. The values (`.stat-value`) use a vibrant Cyan-to-Blue gradient text fill.

- **Mission Cards (`.mission-card`, `.mission-media`):**
  Used for project sections (BAO, FRBs) and News items. These cards feature a hidden, slowly rotating conic gradient (`@keyframes spin-slow`) that subtly highlights the border edges on hover. Images inside `.mission-media` gently scale up while the card itself elevates via a `transform: translateY(-8px)` micro-interaction.

- **Hero Metrics Strip (`.metric`, `.hairline-sweep`):**
  A condensed telemetry display used in the Hero section. It features a sweeping animated scanline (`.hairline-sweep::after`) that mimics data acquisition processes, running back and forth beneath the data points.

- **Eyebrow Badges (`.eyebrow`):**
  A delicate, glowing pill-shape label for categorizing sections (e.g., "O Projeto em Números"). It uses a heavily blurred backdrop, inner shadows, and uppercase spaced typography.
