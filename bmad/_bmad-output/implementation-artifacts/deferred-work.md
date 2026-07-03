# Deferred Work & Technical Debt

This file lists all items that were identified during code reviews or system planning but deferred to a later iteration.

## Deferred from: code review of spec-1-1-core-single-page-layout-premium-styling.md (2026-07-03)

- **Hardcoded Pixel Font Sizes and Spacings**: The body has `font-size: 14px;` and spacing is defined in absolute px values in `index.css`, overriding user browser preferences.
- **Third-Party Blocking Network Requests for Fonts**: Loading the Inter font via external `fonts.googleapis.com` links in `index.html` creates blocking render requests, hurts performance, and compromises user privacy.
- **Metric Card Layout Inflexible on Desktop**: The metrics grid uses a hardcoded `repeat(2, 1fr)` stretching elements across the entire 1280px screen, creating wasted whitespace.
- **Missing Column Width Constraints in Subscriptions Table**: Long subscription names will shrink other columns, causing text wrapping issues.
- **Complete Absence of Print Styles**: There is no `@media print` style block in `index.css` to prevent ink waste or hide interactive elements.
