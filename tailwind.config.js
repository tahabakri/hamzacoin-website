/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        // Extra-small phones — adds a step below Tailwind's default sm (640px)
        // so we can show / hide elements at ~iPhone-12 width (390px) without
        // losing them entirely on tinier phones like SE / 5s (320px).
        xs: "420px",
      },
      colors: {
        coffee: {
          50: "#FAF8F5",
          100: "#F3EFE9",
          200: "#E6DDD0",
          300: "#D4C4B0",
          400: "#BAA38B",
          500: "#9E8169",
          600: "#84644D",
          700: "#6C4F3B",
          800: "#563E2F",
          900: "#433024",
          950: "#271B14",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
