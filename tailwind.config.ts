/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "!./src/packages/transactional/**/*",
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
      backgroundImage: {
        "praca-jf": "url(/bg-praca-jf-1.jpg)",
        "temporario-bg": "url(/bg7.jpg)",
      },
      colors: {
        main: "#648547",
        "ugly-white": "#A7ACB4",
        redwood: "#A34C4C",
        cordovan: "#893838",
        purpureus: "#9B59B2",
        eminence: "#7C4091",
        "true-blue": "#4C6DA3",
        "indigo-dye": "#2B4673",
        "cambridge-blue": "#8FBC94",
        "sea-green": "#608E66",
        emerald: "#65A26D",
        asparagus: "#6DA34D",
        "praca-green-dark": "#2c753e",
        "praca-green-lime": "#85cd28",
        "seasick-green": "#DDFBE133",
        "off-white": "#D9D9D9",
        "imperial-red": "#FA4646",
        "vista-blue": "#799CE1",
        "purple-geometry-stroke": "#7C4091",
        "purple-geometry-fill": "#9B59B24D",
        mauve: "#E7A1FF",
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
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    borderRadius: {
      none: "0",
      sm: "0.125rem",
      DEFAULT: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      full: "9999px",
      "2.5xl": "20px",
    },
  },
  plugins: [
    require("tailwindcss-react-aria-components"),
    require("tailwindcss-animate"),
  ],
};
