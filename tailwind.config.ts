import type { Config } from "tailwindcss";

/**
 * Design tokens sourced directly from the Stitch export
 * (havenly_solutions/DESIGN.md). Colors are exposed as CSS variables in
 * globals.css so `.dark` can swap the whole palette at once; opacity
 * modifiers (bg-secondary/10, text-on-surface-variant/60, etc.) work
 * because each variable holds space-separated RGB channels.
 */
const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: withOpacity("--color-surface"),
        "surface-dim": withOpacity("--color-surface-dim"),
        "surface-bright": withOpacity("--color-surface-bright"),
        "surface-container-lowest": withOpacity("--color-surface-container-lowest"),
        "surface-container-low": withOpacity("--color-surface-container-low"),
        "surface-container": withOpacity("--color-surface-container"),
        "surface-container-high": withOpacity("--color-surface-container-high"),
        "surface-container-highest": withOpacity("--color-surface-container-highest"),
        "on-surface": withOpacity("--color-on-surface"),
        "on-surface-variant": withOpacity("--color-on-surface-variant"),
        outline: withOpacity("--color-outline"),
        "outline-variant": withOpacity("--color-outline-variant"),
        primary: withOpacity("--color-primary"),
        "on-primary": withOpacity("--color-on-primary"),
        "primary-container": withOpacity("--color-primary-container"),
        "on-primary-container": withOpacity("--color-on-primary-container"),
        secondary: withOpacity("--color-secondary"),
        "on-secondary": withOpacity("--color-on-secondary"),
        "secondary-container": withOpacity("--color-secondary-container"),
        "on-secondary-container": withOpacity("--color-on-secondary-container"),
        "secondary-fixed": withOpacity("--color-secondary-fixed"),
        error: withOpacity("--color-error"),
        "on-error": withOpacity("--color-on-error"),
        "error-container": withOpacity("--color-error-container"),
        "on-error-container": withOpacity("--color-on-error-container"),
        background: withOpacity("--color-background"),
        "on-background": withOpacity("--color-on-background"),
        // Status semantics \u2014 constant across light/dark (civic_haven token set)
        critical: withOpacity("--color-critical"),
        warning: withOpacity("--color-warning"),
        success: withOpacity("--color-success"),
        info: withOpacity("--color-info"),
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      spacing: {
        "page-margin": "32px",
        "widget-gap": "24px",
        "container-padding": "24px",
        "stack-sm": "8px",
        "stack-md": "16px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["30px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "stat-lg": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "stat-xl": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "body-base": ["15px", { lineHeight: "22px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-caps": ["11px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
      boxShadow: {
        tile: "0px 4px 20px rgba(0, 0, 0, 0.03)",
        "tile-dark": "0 8px 24px rgba(0,0,0,0.45)",
        "tile-hover": "0px 10px 30px rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
