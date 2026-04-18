import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        cream: "#FAFAF8",
        parchment: "#F5F2EE",
        warm: {
          50: "#FAF8F5",
          100: "#F2EDE6",
          200: "#E5DDD2",
          300: "#D4C8B8",
          400: "#C4A882",
          500: "#A8885E",
          600: "#8B6E47",
          700: "#6B5235",
          800: "#4A3824",
          900: "#2E2216",
        },
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        lg: "6px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
