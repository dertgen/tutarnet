import type React from "react";

export const T = {
  bg:           "#f8fafc",
  surface:      "#f1f5f9",
  card:         "#ffffff",
  cardHover:    "#fafafa",
  border:       "#e2e8f0",
  borderHover:  "#cbd5e1",
  borderAccent: "#c7d2fe",

  accent:       "#6366f1",
  accentLight:  "#818cf8",
  accentDim:    "#eef2ff",
  accentGlow:   "rgba(99,102,241,0.15)",
  accentBorder: "#c7d2fe",

  success:      "#16a34a",
  successDim:   "#dcfce7",
  warning:      "#d97706",
  warningDim:   "#fef3c7",
  danger:       "#dc2626",
  dangerDim:    "#fee2e2",
  purple:       "#7c3aed",
  purpleDim:    "#ede9fe",

  textPrimary:  "#0f172a",
  textSecondary:"#64748b",
  textMuted:    "#94a3b8",
  divider:      "#f1f5f9",
  rowHover:     "rgba(99,102,241,0.04)",

  shadow:       "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
  shadowLg:     "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)",
  radius:       "12px",
  radiusSm:     "8px",
  radiusLg:     "14px",

  cardStyle: {
    background:   "#ffffff",
    border:       "1px solid #e2e8f0",
    borderRadius: "14px",
    padding:      "24px",
  } as React.CSSProperties,
} as const;

export type DesignTokens = typeof T;
