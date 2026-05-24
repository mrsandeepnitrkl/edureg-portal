# Design Brief

## Direction

CBSE Government Education Portal — Professional, authoritative, modern student course registration platform inspired by Indian education system branding.

## Tone

Official and trustworthy without coldness; clean, structured, and modern with geometric typography and deliberate hierarchy.

## Differentiation

Card-elevated surface hierarchy with crisp navy borders and soft professional shadows creates institutional authority while feeling contemporary and accessible.

## Color Palette

| Token      | OKLCH           | Role                                      |
|------------|-----------------|-------------------------------------------|
| background | 0.99 0 0        | Off-white page background                 |
| foreground | 0.15 0 0        | Deep charcoal text                        |
| card       | 1.0 0 0         | White elevated content surfaces           |
| primary    | 0.25 0.10 260   | CBSE navy blue; admin actions, headers    |
| secondary  | 0.55 0.06 240   | Muted slate for secondary UI              |
| accent     | 0.58 0.15 200   | Bright cyan for interactive highlights    |
| muted      | 0.93 0.01 260   | Soft blue-tinted backgrounds              |

## Typography

- Display: Space Grotesk — geometric, authoritative headers and dashboard titles
- Body: DM Sans — modern, readable UI labels, table text, and body copy
- Scale: hero `text-4xl font-bold tracking-tight`, h2 `text-2xl font-semibold`, label `text-xs uppercase tracking-widest`, body `text-base`

## Elevation & Depth

Card-based design with white surfaces (card token) separated by soft professional shadows (`shadow-sm` baseline, `shadow-md` on hover). Light grey alternating section backgrounds (`bg-muted`) create depth without relying on borders alone.

## Structural Zones

| Zone    | Background              | Border              | Notes                                     |
|---------|-------------------------|---------------------|-------------------------------------------|
| Header  | `bg-card` with `border-primary` | Bottom border | Institution name, logo, nav, theme toggle |
| Sidebar | `bg-card`               | Right border subtle | Admin/student nav; primary text on hover  |
| Content | `bg-background`         | —                   | Alternating card (`bg-card`) and muted (`bg-muted`) sections |
| Cards   | `bg-card`               | Subtle border       | Stat cards, course tables, profile forms  |
| Footer  | `bg-muted/40`           | Top border subtle   | Copyright, links                          |

## Spacing & Rhythm

Content organized in horizontal rhythm: 1rem padding within cards, 1.5rem between card groups, 2rem between major sections. Responsive: 1rem on mobile, scales to 2rem on desktop.

## Component Patterns

- Buttons: Navy primary (`bg-primary text-primary-foreground`), cyan accent on hover, sharp `rounded-sm` (subtle rounding)
- Cards: White background, soft `shadow-sm` baseline, subtle `border-border`, `rounded-lg` (0.625rem)
- Badges: Colored backgrounds (`bg-primary/10 text-primary`) for status, soft `rounded-full`
- Tables: Striped rows with `bg-muted/50`, zebra pattern for readability

## Motion

- Entrance: Staggered fade-in on page load (0.3s per element, offset 0.1s)
- Hover: Subtle elevation (shadow increase), text color shift to accent (0.2s smooth transition)
- Active: Primary color fill, no animation flicker
- Decorative: None (keep focus on content clarity)

## Constraints

- Never use raw hex or RGB colors; all colors via OKLCH tokens
- No decorative gradients, only functional overlays
- Keep font weight hierarchy clear (bold, semibold, regular, normal only)
- Responsive design mobile-first; ensure hamburger nav hides sidebar on screens < 768px
- Dark mode uses lighter primary (0.68 0.15 260 sky blue) with deep charcoal backgrounds for accessibility

## Signature Detail

Navigational sidebars with navy primary left border create the visual anchor and reinforce institutional authority while maintaining clean, readable information architecture.
