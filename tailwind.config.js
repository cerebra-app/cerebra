/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F0EFFE",
          100: "#DDD9FD",
          200: "#C0B8FB",
          300: "#A090F9",
          400: "#7C6FF7",
          500: "#5D4EE8",
          600: "#4737CC",
          700: "#3328A0",
          800: "#221B74",
          900: "#130F48",
        },
        teal: {
          300: "#7EEAE4",
          400: "#4ECDC4",
          500: "#2EB8B0",
        },
        amber: {
          300: "#FFD08A",
          400: "#FFB347",
          500: "#F09520",
        },
        slate: {
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        surface: "#FAFAFA",
        "surface-dark": "#0F1117",
      },
      fontFamily: {
        display: ['"Sora"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 20px rgba(124,111,247,0.08)",
        card: "0 4px 24px rgba(0,0,0,0.06)",
        glow: "0 0 24px rgba(124,111,247,0.18)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        breathe: "breathe 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
        breathe: {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [],
};
