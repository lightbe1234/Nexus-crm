/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary-fixed-dim": "#b2c5ff",
        "on-secondary": "#ffffff",
        "on-tertiary": "#ffffff",
        "on-primary-fixed": "#001848",
        "outline-variant": "#c3c6d6",
        "outline": "#737685",
        "on-surface": "#051a3e",
        "on-secondary-container": "#576377",
        "inverse-on-surface": "#edf0ff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "on-primary-container": "#c4d2ff",
        "inverse-primary": "#b2c5ff",
        "tertiary-container": "#006477",
        "secondary-container": "#d4e0f8",
        "primary": "#003d9b",
        "error": "#ba1a1a",
        "secondary-fixed-dim": "#bbc7de",
        "surface-bright": "#faf9ff",
        "background": "#faf9ff",
        "surface-container": "#e9edff",
        "tertiary-fixed": "#afecff",
        "surface": "#faf9ff",
        "on-background": "#051a3e",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e1e8ff",
        "surface-container-highest": "#d8e2ff",
        "on-tertiary-fixed": "#001f27",
        "on-tertiary-fixed-variant": "#004e5d",
        "on-primary-fixed-variant": "#0040a2",
        "on-secondary-fixed-variant": "#3b475b",
        "primary-container": "#0052cc",
        "on-surface-variant": "#434654",
        "on-tertiary-container": "#76e2ff",
        "on-primary": "#ffffff",
        "surface-dim": "#ccdaff",
        "primary-fixed": "#dae2ff",
        "secondary-fixed": "#d7e3fb",
        "surface-tint": "#0c56d0",
        "surface-variant": "#d8e2ff",
        "surface-container-low": "#f1f3ff",
        "tertiary-fixed-dim": "#48d7f9",
        "on-secondary-fixed": "#101c2d",
        "inverse-surface": "#1d3054",
        "tertiary": "#004b59",
        "secondary": "#535f73",
        "on-error": "#ffffff"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "gutter": "16px",
        "component-padding-y": "8px",
        "container-margin": "24px",
        "component-padding-x": "12px",
        "unit": "4px",
        "table-cell-padding": "10px"
      },
      fontFamily: {
        "label-md": ["Inter", "sans-serif"],
        "tabular-nums": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "h2": ["Inter", "sans-serif"],
        "h1": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "h3": ["Inter", "sans-serif"],
        "inter": ["Inter", "sans-serif"]
      },
      fontSize: {
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "600" }],
        "tabular-nums": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "body-sm": ["13px", { "lineHeight": "18px", "fontWeight": "400" }],
        "h2": ["20px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "h1": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "h3": ["16px", { "lineHeight": "24px", "fontWeight": "600" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
