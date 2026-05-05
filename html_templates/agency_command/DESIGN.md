---
name: Agency Command
colors:
  surface: '#faf9ff'
  surface-dim: '#ccdaff'
  surface-bright: '#faf9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8ff'
  surface-container-highest: '#d8e2ff'
  on-surface: '#051a3e'
  on-surface-variant: '#434654'
  inverse-surface: '#1d3054'
  inverse-on-surface: '#edf0ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#535f73'
  on-secondary: '#ffffff'
  secondary-container: '#d4e0f8'
  on-secondary-container: '#576377'
  tertiary: '#004b59'
  on-tertiary: '#ffffff'
  tertiary-container: '#006477'
  on-tertiary-container: '#76e2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#d7e3fb'
  secondary-fixed-dim: '#bbc7de'
  on-secondary-fixed: '#101c2d'
  on-secondary-fixed-variant: '#3b475b'
  tertiary-fixed: '#afecff'
  tertiary-fixed-dim: '#48d7f9'
  on-tertiary-fixed: '#001f27'
  on-tertiary-fixed-variant: '#004e5d'
  background: '#faf9ff'
  on-background: '#051a3e'
  surface-variant: '#d8e2ff'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  tabular-nums:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  component-padding-x: 12px
  component-padding-y: 8px
  table-cell-padding: 10px
---

## Brand & Style

This design system is built for the high-velocity environment of a modern marketing agency. It balances the extreme information density of enterprise resource planning (ERP) with a crisp, contemporary aesthetic that reflects creative precision. 

The style is **Corporate / Modern**, characterized by structural integrity, a rigorous grid, and a focus on utility over decoration. It avoids unnecessary flourishes to ensure that data—campaign performance, client budgets, and resource allocation—remains the primary focus. The emotional response is one of "calm control," providing users with a reliable workspace that feels both authoritative and efficient.

## Colors

The palette is anchored in a "Trustworthy Corporate Blue" to evoke stability and professionalism. 

- **Primary Blue:** Used for critical actions, active states, and primary navigation indicators.
- **Secondary Slates:** A range of cool greys used for secondary text, icons, and subtle borders to reduce visual noise.
- **Surface & Background:** A clear distinction is made between the "Application Background" (light grey) and "Work Surfaces" (pure white) to create a natural layering effect.
- **Semantic Accents:** Crisp green, amber, and red are reserved strictly for status indicators (e.g., campaign status, budget overruns, or task deadlines).

## Typography

This design system utilizes **Inter** exclusively for its exceptional legibility at small sizes and its neutral, systematic character. 

The type scale is intentionally compact to facilitate high information density. **Body-sm (13px)** is the workhorse for data tables and form labels, while **Tabular Nums** are mandated for all financial data and campaign metrics to ensure vertical alignment in reports. Headlines are kept modest in size to maximize vertical screen real estate.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a standard 12-column structure for dashboard layouts. 

- **Density:** We employ a 4px baseline grid. Padding within components (inputs, table cells) is tight to allow more data to be visible above the fold.
- **Sidebar:** A fixed-width navigation sidebar (240px expanded, 64px collapsed) persists on the left.
- **Canvas:** The main content area uses a fluid width with a maximum cap of 1600px for ultra-wide monitors to prevent line lengths from becoming unreadable.
- **Data Tables:** These utilize a "compact" vertical rhythm with 10px of vertical padding per cell.

## Elevation & Depth

To maintain a clean ERP aesthetic, the system uses **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Background):** The base application surface (`#F4F5F7`).
- **Level 1 (Card/Surface):** White surfaces with a 1px border (`#DFE1E6`). No shadow is used here to keep the UI flat and fast.
- **Level 2 (Popovers/Modals):** A soft, functional shadow (0px 4px 12px rgba(9, 30, 66, 0.15)) is used only for temporary elements that float above the main interface.
- **Dividers:** 1px solid lines (`#EBECF0`) are used to separate table rows and form sections.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding provides a modern touch to the professional interface without sacrificing the "serious" feel of an ERP.

- **Standard Buttons & Inputs:** 4px radius.
- **Dashboard Widgets:** 8px (Large) radius to subtly group complex data sets.
- **Status Chips:** Fully pill-shaped to differentiate them from interactive buttons.
- **Selection Indicators:** Sharp, 2px vertical bars are used in the sidebar to indicate active navigation states.

## Components

### Data Tables
The core of the agency's operations. Tables must support:
- **Sticky Headers:** Always visible during scroll.
- **Row Hover:** A subtle background shift (`#F4F5F7`) for tracking data across columns.
- **Inline Editing:** Inputs that appear on-click within a cell.

### Complex Forms
Designed for data entry (client onboarding, campaign setup):
- **Label Placement:** Top-aligned for rapid scanning.
- **Field Groups:** Separated by thin dividers with H3 sub-headers.
- **Required Fields:** Indicated by a primary blue asterisk rather than red to reduce user anxiety.

### Dashboards
- **KPI Cards:** Feature a large "tabular-nums" value, a small trend Sparkline, and a sub-label.
- **Widget Headers:** Contain a title on the left and contextual actions (filter, export) on the right.

### Navigation
- **Primary Sidebar:** Dark theme (`#091E42`) to provide high contrast against the content area.
- **Breadcrumbs:** Required on all nested views to ensure the user never feels lost in the ERP hierarchy.

### Inputs & Buttons
- **Primary Button:** Solid primary blue, white text, bold weight.
- **Ghost Button:** Primary blue text, no border, used for secondary actions within tables.
- **Search:** A persistent global search in the top header with a `Cmd+K` shortcut indicator.