---
name: Cosmic Observatory
version: 2.0
theme: Premium Glassmorphism
---

# 🌌 BINGO Telescope Design System

> [!NOTE]
> **Vision:** A high-fidelity tribute to the mystery and precision of radio astronomy. The design evokes the feeling of a state-of-the-art observatory control room, blending the vast, silent expanse of the universe with the sharp, glowing telemetry of modern scientific instruments.

The core aesthetic relies heavily on **Premium Glassmorphism** layered over a **Minimalist Cosmic** foundation. High-transparency surfaces with heavy backdrop blurs (`blur(18px)`) create a sense of deep atmospheric data. 

---

## 🎨 1. Colors & Palette

The palette is anchored in a **Dark-Only** mode to reflect the deep-space mission of the telescope.

| Role | Color | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | ![#22d3ee](https://placehold.co/15x15/22d3ee/22d3ee.png) Electric Cyan | `#22d3ee` | Interactive elements, active states, and focal statistical values. The "signal". |
| **Secondary** | ![#3b82f6](https://placehold.co/15x15/3b82f6/3b82f6.png) Cosmic Blue | `#3b82f6` | Depth, transitions, and gradient pairings with Cyan. |
| **Neutral** | ![#050a18](https://placehold.co/15x15/050a18/050a18.png) Cosmic Void | `#050a18` | The foundational dark space background. |
| **Surface** | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) Slate Glow | `#0f172a` | Used as the base for glassmorphic gradients. |
| **Text** | ![#ffffff](https://placehold.co/15x15/ffffff/ffffff.png) Starlight | `#ffffff` | Primary headings and high-contrast text. |
| **Muted Text** | ![#94a3b8](https://placehold.co/15x15/94a3b8/94a3b8.png) Cosmic Dust | `#94a3b8` | Paragraphs, captions, and secondary information. |

> [!TIP]
> **Surfaces** leverage complex, layered linear gradients with translucency rather than solid colors.  
> *Example:* `linear-gradient(180deg, rgba(15, 23, 42, 0.72) 0%, rgba(7, 13, 31, 0.86) 100%)`

---

## 🔤 2. Typography

Typography is a mix of high-impact geometric sans-serifs and highly readable workhorses.

| Font Family | Usage | Weights | Characteristics |
| :--- | :--- | :--- | :--- |
| **[Outfit](https://fonts.google.com/specimen/Outfit)** | Headlines & Stats | `700`, `800`, `900` | Authoritative, geometric, tight tracking. |
| **[Inter](https://fonts.google.com/specimen/Inter)** | Body & Prose | `400`, `500`, `600` | Highly readable, clean, modern workhorse. |

### Advanced Typographic Rules
- **Telemetry/Numbers:** Statistical numbers use **Outfit**, but crucially rely on `font-variant-numeric: tabular-nums` to maintain precise vertical alignment in dashboards.
- **Eyebrow Labels:** Small, uppercase labels use **Outfit** with very wide letter spacing (`letter-spacing: 0.16em` or more) to distinguish metadata from standard content.

---

## 🏔️ 3. Elevation & Depth

Hierarchy is established through **translucent layers** and **glowing borders** rather than traditional opaque drop-shadows.

* **Level 0 (Canvas):** Deep space backgrounds (`#050a18`), often using a subtle noise/film-grain overlay or faint celestial gradients.
* **Level 1 (Surfaces):** Glassmorphic cards with `backdrop-filter: blur(18px)` and a ultra-thin `1px` subtle border `rgba(148, 163, 184, 0.12)`.
* **Level 2 (Interaction):** Upon hover, elements scale up slightly (`transform: translateY(-8px)`), border colors shift to cyan `rgba(34, 211, 238, 0.28)`, and they gain a soft, colored outer glow (`box-shadow: 0 0 42px -12px rgba(34, 211, 238, 0.35)`).

---

## 🧩 4. Core Custom Components

Our `src/styles/global.css` defines several highly polished utility classes that form the backbone of the UI.

### 🎛️ Instrument Panel
`.instrument-panel` | `.stat-cell` | `.stat-value`
A large, unified glassmorphic dashboard container. It groups metrics into distinct cells with overlapping hairline borders. The values use a vibrant Cyan-to-Blue gradient text fill.

### 🛰️ Mission Cards
`.mission-card` | `.mission-media`
Used for project sections (BAO, FRBs) and News items. These cards feature a hidden, slowly rotating conic gradient (`@keyframes spin-slow`) that subtly highlights the border edges on hover. Images gently scale up while the card itself elevates.

### 📡 Hero Metrics Strip
`.metric` | `.hairline-sweep`
A condensed telemetry display used in the Hero section. It features a sweeping animated scanline (`.hairline-sweep::after`) that mimics data acquisition processes, running back and forth beneath the data points.

### 🏷️ Eyebrow Badges
`.eyebrow`
A delicate, glowing pill-shape label for categorizing sections (e.g., "O Projeto em Números"). It uses a heavily blurred backdrop, inner shadows, and uppercase spaced typography.
