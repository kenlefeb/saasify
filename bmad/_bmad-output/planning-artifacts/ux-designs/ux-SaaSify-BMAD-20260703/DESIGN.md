---
name: SaaSify
description: Elegant, single-page dark-mode dashboard for subscription tracking.
status: final
updated: 2026-07-03
colors:
  bg-base: '#0F172A'
  bg-card: '#1E293B'
  bg-input: '#0F172A'
  text-primary: '#F8FAFC'
  text-secondary: '#94A3B8'
  accent: '#6366F1'
  accent-hover: '#4F46E5'
  border: '#334155'
  status-active: '#10B981'
  status-paused: '#F59E0B'
  status-alert: '#EF4444'
typography:
  fontFamily: "'Inter', sans-serif"
  display:
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  title:
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
  body:
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  meta:
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 4px
  md: 8px
  lg: 12px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
components:
  button-primary:
    background: '{colors.accent}'
    foreground: '{colors.text-primary}'
    radius: '{rounded.md}'
  metric-card:
    background: '{colors.bg-card}'
    border: '1px solid {colors.border}'
    radius: '{rounded.lg}'
  status-badge-active:
    background: 'rgba(16, 185, 129, 0.1)'
    foreground: '{colors.status-active}'
    radius: '{rounded.sm}'
  status-badge-paused:
    background: 'rgba(245, 158, 11, 0.1)'
    foreground: '{colors.status-paused}'
    radius: '{rounded.sm}'
  status-badge-alert:
    background: 'rgba(239, 68, 68, 0.15)'
    foreground: '{colors.status-alert}'
    radius: '{rounded.sm}'
---

## Brand & Style

SaaSify is a minimal subscription tracker designed to prevent financial leakage from forgotten, unmanaged, or trial-running software subscriptions. It acts as a clear mirror of operational costs. The aesthetic is clean, low-friction, and dark-mode-by-default to feel like a modern utility rather than a noisy consumer portal. 

Visual priority is placed on spend metrics and imminent renewal alerts, stripping away all decorative chrome. Interactive states are buttery and responsive, utilizing subtle scale transitions and background shifts.

## Colors

The SaaSify palette uses deep slate tones as a base, indigo as the primary interactive accent, and highly saturated semantic colors for status tracking.

- **Background Base (`#0F172A`)**: The primary application canvas.
- **Card Background (`#1E293B`)**: Surfaces that hold metric aggregates, tables, and modal components.
- **Primary Accent (`#6366F1`)**: Interactive elements (buttons, links, active toggle state).
- **Active Status (`#10B981`)**: Indicates active, paid subscriptions.
- **Paused Status (`#F59E0B`)**: Indicates paused trials or tracking.
- **Alert Status (`#EF4444`)**: Indicates a renewal due in <= 7 days.

## Typography

SaaSify uses **Inter** via Google Fonts. 

- **Display (32px, Bold)**: Application branding and core aggregate totals.
- **Title (20px, Semi-Bold)**: Card headings and modal titles.
- **Body (14px, Regular)**: Table row items, labels, descriptions.
- **Meta (12px, Medium)**: Badges, table headers, validation errors, and toggle options.

## Layout & Spacing

SaaSify is built on a responsive grid:
- **Max Width**: `1280px` (`max-w-7xl`), centered.
- **Header**: Flex container holding Title/Branding and the Role Selector.
- **Metrics Grid**: Two-column layout on medium viewports (`md:grid-cols-2`), single-column on mobile.
- **Main Table Card**: Generous breathing space with `{spacing.5}` (24px) padding.

## Elevation & Depth

To maintain a flat, fast tool posture, SaaSify uses a single layer of depth:
- Cards and modals have a solid 1px border (`{colors.border}`) with no heavy drop shadows.
- Dialog overlay uses a backdropped blur (`backdrop-filter: blur(4px)`) to focus user attention on forms.

## Shapes

- **Small Radius (`{rounded.sm}` / 4px)**: Status badges.
- **Medium Radius (`{rounded.md}` / 8px)**: Buttons, inputs, and table rows.
- **Large Radius (`{rounded.lg}` / 12px)**: Metric cards, the main list card, and modals.

## Components

- **Header / Role Selector**: Indigo background toggle indicating active state (Viewer vs. Admin).
- **Metric Cards**: Display large figures (`{typography.display}`) with secondary label context (`{typography.meta}`).
- **Subscription Table**: Slate background rows with hover highlight (`background-color: rgba(255, 255, 255, 0.02)`).
- **Status Badges**: Styled with low-opacity fills matching their semantic text color.
- **Modals**: Centered overlays with `{rounded.lg}` and `{colors.border}` outlines.

## Do's and Don'ts

- **Do** use `rgba` backgrounds for status badges to keep text highly readable.
- **Do** align the "Add Subscription" button to the top-right of the table card layout.
- **Don't** add decorative graphics or charts to the MVP dashboard.
- **Don't** introduce multiple light-mode surface options; SaaSify is dark-mode-only to optimize contrast.
