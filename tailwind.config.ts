import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-hover": "rgb(var(--color-primary-hover) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        "secondary-hover": "rgb(var(--color-secondary-hover) / <alpha-value>)",
        orange: "rgb(var(--color-orange) / <alpha-value>)",
      },
      screens: {
        xs: "480px",        // breakpoint muy pequeño/intermedio
        sm: "640px",
        md: "768px",
        "md-lg": "900px",    // breakpoint intermedio entre md y lg
        lg: "1024px",
        "lg-xl": "1152px",   // breakpoint intermedio entre lg y xl
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",     // extra grande
      },
    },
  },
  plugins: [],
} satisfies Config;
