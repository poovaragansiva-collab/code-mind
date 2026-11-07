import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--background)",
        panel: "var(--surface)",
        "panel-raised": "var(--surface-raised)",
        line: "var(--border)",
        "line-subtle": "var(--border-subtle)",
        ink: "var(--foreground)",
        muted: "var(--muted)",
        accent: {
          DEFAULT: "var(--accent)",
          cyan: "var(--accent-cyan)",
        },
        violet: {
          DEFAULT: "var(--violet)",
        },
      },
      boxShadow: {
        panel: "0 14px 40px -10px rgba(0, 0, 0, 0.45)",
        glow: "var(--glow-shadow)",
        focus: "0 0 0 3px rgba(22, 139, 255, 0.25)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
        "float-slow": "floatSlow 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
