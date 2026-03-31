---
name: Stitch UI Design
description: Google Stitch AI design integration for generating UI designs. Creates beautiful interfaces from natural language prompts and exports HTML/CSS code.
triggers:
  - "stitch"
  - "diseño UI"
  - "generar diseño"
  - "create design"
  - "UI design"
---

# Stitch UI Design Integration

## Overview
Google Stitch is an AI-native design canvas that generates high-fidelity UI designs from natural language prompts. This integration allows you to create designs and export them directly to your codebase.

## Available Tools

### `stitch_design`
Generate a new UI design from a text description.

**Parameters:**
- `prompt`: Detailed description of the UI you want to create
- `project_id`: Optional project ID to add the screen to

**Example:** `"A trading dashboard with dark theme, price charts, order book, and trade buttons"`

### `get_project_screens`
Retrieve all screens from a Stitch project.

**Parameters:**
- `project_id`: The project ID to fetch screens from

### `extract_design_context`
Scan a screen to extract "Design DNA" (fonts, colors, layouts).

**Parameters:**
- `screen_id`: The screen to analyze

### `build_site`
Build an Astro site from a project by mapping screens to routes.

**Parameters:**
- `project_id`: Project ID
- `route_mapping`: Object mapping screens to routes

## Quick Start

1. Ensure `GOOGLE_CLOUD_PROJECT` environment variable is set
2. Use the Stitch MCP tools to generate designs
3. Export the generated HTML/CSS code

## Design Best Practices

### Prompt Structure
```
[Component type] + [Key features] + [Style/Theme] + [Layout details]

Example:
"Trading signal card with entry price, stop loss, take profit levels,
dark mode with gradient accents, compact layout with icons for each metric"
```

### Common Design Patterns for TradePortal

1. **Signal Cards**: Entry, SL, TP, direction indicators, compact metrics
2. **Post Cards**: Avatar, content, media, engagement buttons, timestamps
3. **Navigation**: Bottom dock, floating actions, responsive menus
4. **Charts**: TradingView embeds, price displays, trend indicators

## Workflow

1. **Generate Design** → Use `stitch_design` with detailed prompt
2. **Preview** → Review the generated design in Stitch or locally
3. **Extract Code** → Get HTML/CSS from the design
4. **Integrate** → Adapt the code to our React/TypeScript components
5. **Refine** → Apply our design tokens (colors, spacing, typography)

## Design System Reference

### Colors (Tailwind Classes)
- Primary: `primary` (purple-500/indigo-600 gradient)
- Success/Long: `signal-green` (emerald-500)
- Error/Short: `red-500`
- Background: `bg-black/40 dark:bg-[#0f1115]`
- Text: `text-white dark:text-gray-100`
- Accents: `amber-500` (gold/points)

### Typography
- Headlines: `font-black uppercase tracking-widest`
- Body: `text-[13px] leading-relaxed`
- Labels: `text-[9px] font-bold uppercase tracking-wider`
- Icons: Material Symbols (rounded, 24px)

### Spacing & Radius
- Cards: `rounded-2xl p-4`
- Buttons: `rounded-xl px-4 py-2`
- Modals: `rounded-2xl overflow-hidden`
- Glass effect: `glass bg-black/40 backdrop-blur-xl border border-white/10`

## Example Prompts for TradePortal

### Post Card
```
"Social media post card with user avatar, username with verification badge,
timestamp, content text, optional image/video thumbnail, engagement bar
with like/comment/share counts, dark glassmorphism style, hover effects"
```

### Signal Card
```
"Trading signal display card showing buy/sell direction with colored indicator,
entry price in large font, stop loss in red, take profit targets in green,
asset pair name, timeframe badge, dark theme with gradient accents"
```

### Navigation FAB
```
"Floating action button with expandable menu, glassmorphism style,
purple gradient icon, smooth rotation animation on open, dark background
with blur, submenu items with icons and labels"
```

## Troubleshooting

### "Project not found"
Ensure `GOOGLE_CLOUD_PROJECT` is set correctly in `.env`:
```
GOOGLE_CLOUD_PROJECT=your-project-id
```

### "Authentication error"
Run: `gcloud auth application-default login`

### "No screens found"
Create a project first in https://stitch.withgoogle.com, then use the project ID.
