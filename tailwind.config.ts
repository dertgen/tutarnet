import type { Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        admin: {
          bg: "#f8fafc",
          surface: "#f1f5f9",
          card: "#ffffff",
          cardHover: "#fafafa",
          border: "#e2e8f0",
          borderHover: "#cbd5e1",
          borderAccent: "#c7d2fe",
          accent: "#6366f1",
          accentLight: "#818cf8",
          accentDim: "#eef2ff",
          accentGlow: "rgba(99,102,241,0.15)",
          accentBorder: "#c7d2fe",
          success: "#16a34a",
          successDim: "#dcfce7",
          warning: "#d97706",
          warningDim: "#fef3c7",
          danger: "#dc2626",
          dangerDim: "#fee2e2",
          purple: "#7c3aed",
          purpleDim: "#ede9fe",
          textPrimary: "#0f172a",
          textSecondary: "#64748b",
          textMuted: "#94a3b8",
          divider: "#f1f5f9",
          rowHover: "rgba(99,102,241,0.04)"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        admin: "12px",
        "admin-sm": "8px",
        "admin-lg": "14px"
      },
      boxShadow: {
        "admin": "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
        "admin-lg": "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)"
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
