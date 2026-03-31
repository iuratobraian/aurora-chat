# Design System Strategy: The Obsidian Ether

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Observatory"**

This design system moves beyond the "SaaS template" by treating the interface as a high-precision optical instrument. We are not building "pages"; we are layering light and glass over a deep-space vacuum. The system rejects the rigid, boxy constraints of traditional web design in favor of **Aero-Glass depth**. 

By utilizing intentional asymmetry—such as oversized display type paired with condensed, high-density data modules—we create an editorial rhythm that feels like a premium aerospace HUD. The goal is a "Zero-Gravity" UI where elements appear to float in a structured, multi-dimensional obsidian void.

---

## 2. Colors & Surface Philosophy

The palette is anchored in **#050505 (Deep Space Obsidian)**, providing a high-contrast stage for our "Electric Violet" and "Cyan Glow" light-emitting elements.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for structural sectioning. Boundaries must be defined through:
*   **Tonal Shifts:** Moving from `surface` (#131313) to `surface_container_low` (#1c1b1b).
*   **Luminous Depth:** Using `outline_variant` (#494454) at **15% opacity** only to define the "lip" of a glass container.
*   **Negative Space:** Using the `12` (4rem) or `16` (5.5rem) spacing tokens to let content breathe.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent materials. 
*   **Base:** `surface_dim` (#131313).
*   **Level 1 (Sections):** `surface_container_low` (#1c1b1b).
*   **Level 2 (Cards):** `surface_container` (#201f1f) with a `backdrop-blur` of 20px.
*   **Level 3 (Popovers/Modals):** `surface_bright` (#3a3939) at 80% opacity to simulate high-density frosted glass.

### The "Glass & Gradient" Rule
To evoke a premium feel, main CTAs must utilize a linear gradient: `primary` (#d0bcff) to `primary_container` (#a078ff) at a 135-degree angle. This "inner glow" provides the visual soul that flat buttons lack.

---

## 3. Typography: Technical Elegance

We use a dual-font approach to balance human-centric legibility with high-tech precision.

*   **Display & Headlines (Space Grotesk):** Chosen for its "engineered" feel and wide apertures. Use `display-lg` for hero moments to create an authoritative, editorial impact. Use tight letter-spacing (-0.02em) for headlines.
*   **Body & UI (Inter):** The workhorse. Inter provides maximum legibility at small sizes. Use `body-md` for standard text and `label-sm` for technical metadata.
*   **Hierarchy Note:** Always contrast a `display-sm` headline with a `label-md` uppercase sub-header using `secondary` (#4cd7f6) color to establish a clear "Technical/Editorial" relationship.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved via **Tonal Stacking**. An inner module should always be one step higher on the surface scale than its parent (e.g., a `surface_container_highest` card sitting on a `surface_container_low` background).

### Ambient Shadows
Avoid black shadows. Use a "Violet-Tinted Ambient" shadow:
*   **Color:** `#3c0091` (on_primary) at 8% opacity.
*   **Blur:** 40px to 80px.
*   **Spread:** -10px to ensure the glow feels tucked under the element, mimicking a light source from above.

### The "Ghost Border"
When a container requires a edge (e.g., an input field), use `outline_variant` (#494454) at **20% opacity**. This creates a "hairline" effect that appears and disappears based on the user's viewing angle, reinforcing the glass metaphor.

---

## 5. Components

### Buttons (The "Power Cells")
*   **Primary:** Gradient fill (`primary` to `primary_container`). Border-radius: `full`. Subtle outer glow on hover using `primary_fixed_dim`.
*   **Secondary:** `surface_container_highest` fill with a `0.5px` ghost border of `secondary`.
*   **Tertiary:** Text-only in `secondary_fixed_dim`, with a 4px `primary` underline that expands on hover.

### Cards & Modules
Forbid the use of divider lines. Separate content using the `spacing scale`:
*   Use `4` (1.4rem) for internal padding.
*   Use `surface_container_low` for the header area and `surface_container` for the body to create a natural visual break.

### Input Fields
*   **State:** Default state is `surface_container_lowest`.
*   **Interaction:** On focus, the ghost border transitions to `secondary` (#4cd7f6) and a 2px "Cyan Glow" shadow is applied. Use `JetBrains Mono` for input text to enhance the "AI/Data" feel.

### Sleek Loading Indicators
*   **The Pulse Orbit:** Instead of a spinner, use two concentric circles of `primary` and `secondary`. The outer circle pulses (scale 1.0 to 1.2) while the inner circle rotates slowly.
*   **Shimmer:** Use a linear gradient shimmer from `surface` to `surface_bright` at a 45-degree angle.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place a `display-lg` headline on the left and a small `label-md` technical description on the far right of the grid to create high-end visual tension.
*   **Embrace Translucency:** Always use `backdrop-filter: blur(12px)` on floating panels to allow background colors to bleed through softly.
*   **Tint Your Greys:** Ensure all neutral surfaces have a slight blue/violet undertone to avoid a "flat" grey appearance.

### Don’t:
*   **Don't use 100% White:** Never use #FFFFFF. Use `on_surface` (#e5e2e1) to reduce eye strain and maintain the "Obsidian" atmosphere.
*   **Don't use Hard Corners:** Avoid `none` or `sm` rounding for main containers. Stick to `xl` (0.75rem) for cards and `full` for interactive pills.
*   **Don't Over-Glow:** Glows should be "discovered," not "felt." Limit high-intensity `cyan_glow` to active states and primary success notifications only.