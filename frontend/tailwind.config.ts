import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        bg: "#F6F7FA",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#12141A",
          muted: "#667085",
          faint: "#98A2B3",
        },
        border: {
          DEFAULT: "#E5E8EC",
          strong: "#D0D5DD",
        },
        accent: {
          DEFAULT: "#2E5CFF",
          hover: "#2549D6",
          soft: "#EAF0FF",
          softer: "#F5F8FF",
        },
        success: {
          DEFAULT: "#12B76A",
          soft: "#E7F9F0",
        },
        warning: {
          DEFAULT: "#F79009",
          soft: "#FFF6E8",
        },
        danger: {
          DEFAULT: "#F04438",
          soft: "#FEECEB",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 24, 40, 0.04), 0 2px 8px rgba(16, 24, 40, 0.04)",
        card: "0 2px 4px rgba(16, 24, 40, 0.03), 0 8px 24px rgba(16, 24, 40, 0.06)",
        lift: "0 12px 32px rgba(46, 92, 255, 0.16)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(46, 92, 255, 0.35)" },
          "100%": { boxShadow: "0 0 0 12px rgba(46, 92, 255, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
        "check-draw": {
          "0%": { strokeDashoffset: "48" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "scale-in": "scale-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 1.6s linear infinite",
        "check-draw": "check-draw 0.6s ease-out 0.1s both",
      },
      backgroundImage: {
        shimmer:
          "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
