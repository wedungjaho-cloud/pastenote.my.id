---
name: PasteNote Professional
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
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#bdc2ff'
  on-secondary: '#131e8c'
  secondary-container: '#2f3aa3'
  on-secondary-container: '#a8afff'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e0e0ff'
  secondary-fixed-dim: '#bdc2ff'
  on-secondary-fixed: '#000767'
  on-secondary-fixed-variant: '#2f3aa3'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  off-white: '#f8fafc'
  indigo-soft: '#e0e7ff'
  slate-border: rgba(255, 255, 255, 0.08)
  glass-bg: rgba(15, 15, 15, 0.7)
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-mobile: 20px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style

The design system is defined by a **Premium Developer-Centric** aesthetic. It moves away from generic SaaS templates toward a sophisticated, high-contrast environment that balances technical precision with high-end editorial clarity. The personality is professional, sleek, and focused—designed for power users who value both aesthetics and efficiency.

The design style is a hybrid of **Minimalism** and **Glassmorphism**. It utilizes generous whitespace and a restricted color palette to reduce cognitive load, while employing translucent layers and subtle backdrop blurs to create a sense of depth and modern sophistication. This approach ensures the interface feels "fresh" and bespoke rather than a standard UI framework.

## Colors

The system uses a high-contrast dual-mode approach:

- **Dark Mode (Default):** Utilizes a deep `#050505` near-black neutral background. Surfaces are rendered using slightly lighter tones or glassmorphic overlays to maintain a "sleek" technical feel.
- **Light Mode:** Shifts to a clean `#f8fafc` off-white background. The palette remains airy, using soft indigo accents (`#e0e7ff`) for secondary containers to avoid harshness.
- **Brand Indigo:** `#6366f1` serves as the primary action color. It is used sparingly but impactfully for primary buttons, active states, and critical highlights.
- **Accents:** Secondary indigo tones provide hierarchy in typography and subtle UI indicators without competing with the primary call to action.

## Typography

This design system leverages **Inter** for all UI elements to ensure maximum legibility and a neutral, professional tone. A high-contrast scale is employed to create a clear information hierarchy, using tight letter-spacing on larger headings for a contemporary "editorial" look.

**JetBrains Mono** is utilized for code-specific content and technical labels. This provides a distinct visual break between the interface and the user's data, reinforcing the developer-centric focus. 

- **Hierarchy:** Use `headline-xl` for landing hero sections and `headline-lg` for primary dashboard views. 
- **Readability:** Body text is set with generous line-height to ensure comfort during long reading or auditing sessions.

## Layout & Spacing

The layout philosophy emphasizes **generous whitespace** to create a premium, uncrowded feel. The system follows a **Fluid Grid** model with strict maximum widths to maintain optimal line lengths for code and text.

- **Rhythm:** An 8px linear scale governs all spacing. Use larger gaps (64px+) between major sections to define the structure without relying on heavy lines.
- **Breakpoints:**
    - **Desktop (1440px+):** Centered content with 64px margins and 32px gutters.
    - **Tablet (768px - 1439px):** Content adapts to fill width with 40px margins.
    - **Mobile (<768px):** Single column layout with 20px margins.
- **Density:** While the branding is spacious, the internal "Editor" components may switch to a 4px grid for technical density where required.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and **Tonal Layering** rather than traditional heavy shadows.

- **Surface Tiers:** In dark mode, the base is `#050505`. Primary containers use a subtle 1px border (`rgba(255, 255, 255, 0.08)`) and a background of `#0c0c0c` to appear elevated.
- **Glass Effects:** Modals, navigation bars, and floating cards use `backdrop-filter: blur(12px)` with a semi-transparent background (`rgba(15, 15, 15, 0.7)`). This creates a sense of light passing through the interface, adding to the "fresh" aesthetic.
- **Borders:** "Ghost" borders are preferred over shadows. Use ultra-thin, low-opacity strokes to define component boundaries. 
- **Shadows:** Reserved only for high-priority floating elements (like popovers). Use a large, extremely soft ambient shadow: `0 20px 40px rgba(0, 0, 0, 0.4)`.

## Shapes

The shape language is **Rounded (0.5rem)**. This provides a professional balance—soft enough to feel modern and accessible, but structured enough to feel precise.

- **Components:** Buttons, inputs, and small cards use the base `rounded` (8px).
- **Large Containers:** Dashboard cards or main editor wrappers use `rounded-lg` (16px) to emphasize their role as structural units.
- **Interactive Elements:** Active indicators or status badges use `rounded-xl` (24px) or full pill shapes to distinguish them from clickable buttons.

## Components

- **Buttons:** 
    - *Primary:* Solid Indigo (`#6366f1`) with white text. High-contrast and bold.
    - *Secondary:* Glassmorphic style with a 1px white border at 10% opacity and a blur effect.
- **Cards:** Use the glassmorphic treatment—subtle border, dark translucent fill, and a 12px blur. Padding should be generous (24px or 32px) to prevent a cramped look.
- **Inputs:** A deep, near-black fill with a 1px border. On focus, the border transitions to Primary Indigo with a soft, 4px Indigo outer glow (glow opacity 0.2).
- **Code Editor:** The canvas should be the darkest part of the UI (`#050505`). Syntax highlighting should use a refined palette of indigos, teals, and soft greys.
- **Chips:** Small, monospace labels with `rounded-xl` corners. Use a 10% opacity primary indigo background for "active" tags.
- **Lists:** Clean rows with no horizontal separators; use vertical whitespace and subtle hover states (a 3% brightness increase) to define items.