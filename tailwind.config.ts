import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gain: "#00C805",
        loss: "#FF5000",
        "surface-primary": "#FFFFFF",
        "surface-secondary": "#F5F5F5",
        "surface-tertiary": "#FAFAFA",
        "text-primary": "#1B1B1B",
        "text-secondary": "#6B7280",
        "text-tertiary": "#9CA3AF",
        "border-light": "#E5E7EB",
        "border-medium": "#D1D5DB",
        accent: "#000000",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.1)",
        panel: "0 2px 8px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        card: "8px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
