---
name: Cipher Obsidian
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bdcabe'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#889489'
  outline-variant: '#3e4a40'
  surface-tint: '#73db9a'
  primary: '#dbffe2'
  on-primary: '#00391d'
  primary-container: '#86efac'
  on-primary-container: '#006d3e'
  inverse-primary: '#006d3e'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#d6fff6'
  on-tertiary: '#003731'
  tertiary-container: '#57f1db'
  on-tertiary-container: '#006b60'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#8ff8b4'
  primary-fixed-dim: '#73db9a'
  on-primary-fixed: '#00210f'
  on-primary-fixed-variant: '#00522d'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#62fae3'
  tertiary-fixed-dim: '#3cddc7'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005047'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 800px
  gutter: 24px
  section-gap: 64px
  stack-sm: 8px
  stack-md: 16px
---

## Brand & Style

The visual identity of the design system is anchored in the concept of a "Private Vault"—a secure, high-performance environment for sensitive data. It targets developers and privacy-conscious power users who value speed, clarity, and aesthetic precision.

The style is **Minimalist-Obsidian**:
- **Atmospheric Depth:** Moving away from flat black (#000) toward a layered, "ink" black palette that uses subtle gradients to suggest physical space.
- **Precision Engineering:** Incorporates microscopic details like 1px borders, subtle noise textures, and monospaced accents to evoke a high-end developer tool aesthetic.
- **Sophisticated Utility:** The UI feels "expensive" through generous whitespace and a lack of decorative clutter. Every element serves a functional purpose, rendered with surgical sharpness.

## Colors

The palette is a refined "Midnight" spectrum. It avoids pure black to prevent OLED smearing and to allow for visible depth through tonal layering.

- **Primary (Sage Green):** Used sparingly for status indicators, primary actions, and brand accents. It should feel "organic-digital"—vibrant but desaturated enough to maintain a professional tone.
- **Surface Tiers:**
    - `Base`: #0A0A0A (The foundation)
    - `Surface`: #121212 (Primary containers)
    - `Elevated`: #1C1C1C (Hover states/inputs)
- **Background Detail:** Use a radial gradient (top-center) from #161616 to #0A0A0A, overlaid with a 3% opacity noise grain or a faint geometric dot-grid (8px spacing) to add "material" texture without distraction.

## Typography

The information architecture relies on a "Sans + Mono" pairing. 

- **Hanken Grotesk** provides a Swiss-inspired, modern clarity for headlines and body text. Large headlines should use negative letter-spacing and tight line heights to appear more cohesive and "branded."
- **JetBrains Mono** is utilized for metadata, system labels, and technical identifiers (like email addresses or keys). This reinforces the "developer" aesthetic.
- **Hierarchy Rule:** Use color contrast (White vs. #A1A1AA) instead of just font size to establish hierarchy. Metadata should always be secondary in color and monospaced.

## Layout & Spacing

This design system utilizes a **Focused Center Layout**. By default, content is confined to a slim 800px column to maximize readability and create a "private document" feel.

- **Grid:** On desktop, use a single centered column. On admin dashboards, scale to a 12-column fluid grid with 48px side margins.
- **Rhythm:** Use an 8px base unit. 
    - `Large Spacing (64px)`: Separates major functional blocks (e.g., Header from Note Area).
    - `Medium Spacing (24px)`: Internal padding for cards and containers.
    - `Small Spacing (8px)`: Relationship between labels and their inputs.
- **Responsiveness:** On mobile (<640px), margins collapse to 16px, and the layout becomes purely vertical with no side-by-side elements.

## Elevation & Depth

Depth is achieved through **Tonal Stacking and Micro-Borders** rather than heavy shadows.

- **The Tier System:** Base layer is darkest. Each progressive layer (cards, modals) gets slightly lighter (#121212 -> #1C1C1C).
- **Glassmorphism:** Use only for fixed elements like the top navigation bar. Apply a `backdrop-filter: blur(12px)` with a 70% opaque #0A0A0A background.
- **Borders:** Every container must have a 1px solid border. Use `rgba(255, 255, 255, 0.06)` for standard containers and `rgba(134, 239, 172, 0.2)` for active/focused states.
- **Shadows:** Use a single "Glow" shadow for primary buttons: `0 0 20px rgba(134, 239, 172, 0.15)`. No other elements should have shadows.

## Shapes

The shape language is "Soft-Technical." 

- **Radius:** Standard components use a **4px (0.25rem)** radius. This creates a sharp, professional look that feels more precise than rounder "consumer" apps.
- **Inputs & Buttons:** Maintain the 4px radius. 
- **Icons:** Use **2px (Thin)** stroke weights with "Round" caps/joins to slightly soften the technical edge of the monospaced type. Avoid filled icons unless indicating an active toggle state.

## Components

- **Primary Button:** Ghost style with a subtle solid fill. Border: 1px Sage Green; Background: Sage Green at 10% opacity; Text: Sage Green. On hover, increase background opacity to 20%.
- **Note Cards:** No background color on the card itself—only a 1px border. The header of the card should be separated by a 1px horizontal line.
- **Input Fields:** Darker than the background (#050505). No border by default; 1px Sage Green border on focus. Use JetBrains Mono for input text.
- **Status Chips:** Small, pill-shaped, using the `label-caps` typography. Success: #86EFAC text with a subtle green dot prefix. 
- **Lists:** Items should be separated by 1px dividers with 50% transparency. Each row should have a subtle hover state (#FFFFFF at 0.03% opacity).
- **The "Vault" Toggle:** A custom switch that is rectangular rather than pill-shaped, echoing the 4px radius of the rest of the system.