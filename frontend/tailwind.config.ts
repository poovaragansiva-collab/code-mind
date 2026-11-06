import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#080b10",
        panel: "#0e131b",
        "panel-raised": "#131a24",
        line: "#202a38",
        ink: "#edf3fb",
        muted: "#8c9aae",
        accent: "#5aa9ff",
        violet: "#a78bfa",
      },
      boxShadow: {
        panel: "0 12px 40px rgba(0, 0, 0, 0.24)",
        focus: "0 0 0 3px rgba(90, 169, 255, 0.18)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.15rem",
      },
    },
  },
  plugins: [],
};

export default config;
