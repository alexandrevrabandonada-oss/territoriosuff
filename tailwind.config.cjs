/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        shimmer: "shimmer 1.9s infinite"
      },
      colors: {
        "brand-primary": "#005DAA",
        "brand-primary-dark": "#12304A",
        "brand-primary-soft": "#E5F0FA",
        "bg-page": "#F4F7FA",
        "surface-1": "#FFFFFF",
        "surface-2": "#F8FBFD",
        "surface-3": "#EEF4F8",
        "bg-surface": "#FFFFFF",
        "text-primary": "#11263B",
        "text-secondary": "#4C5C6B",
        "border-subtle": "#D3DDE6",
        "divider-subtle": "#E6EDF3",
        "card-hover": "#EEF6FC",
        "accent-seed": "#A3D832",
        "accent-lab": "#00B7B1",
        "accent-green": "#15803D",
        "accent-yellow": "#D4A514",
        "accent-brown": "#6B3E2E",
        success: "#137333",
        warning: "#B7791F",
        danger: "#B3261E"
      }
    }
  },
  plugins: []
};
