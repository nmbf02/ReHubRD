import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: "var(--destructive)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // Brand scale — ReHub recovery teal. The full ramp lets us build depth
        // (deep ink sections, soft mint surfaces) instead of one flat hue.
        rehub: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
          950: "#042F2E",
          primary: "#0D9488",
          secondary: "#0F766E",
          accent: "#14B8A6",
          dark: "#134E4A",
          ink: "#042F2E",
          light: "#CCFBF1",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        "8xl": "88rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(4,47,46,0.04), 0 4px 16px rgba(4,47,46,0.06)",
        card: "0 1px 3px rgba(4,47,46,0.05), 0 10px 30px -12px rgba(4,47,46,0.12)",
        elevated:
          "0 2px 4px rgba(4,47,46,0.04), 0 24px 48px -16px rgba(4,47,46,0.18)",
        glow: "0 0 0 1px rgba(13,148,136,0.10), 0 12px 32px -8px rgba(13,148,136,0.35)",
        "glow-lg":
          "0 0 0 1px rgba(13,148,136,0.12), 0 24px 60px -12px rgba(13,148,136,0.45)",
        "inner-light": "inset 0 1px 0 0 rgba(255,255,255,0.7)",
      },
      backgroundImage: {
        "grid-rehub":
          "linear-gradient(to right, rgba(13,148,136,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(13,148,136,0.07) 1px, transparent 1px)",
        "grid-light":
          "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.18), transparent 70%)",
        "brand-gradient":
          "linear-gradient(135deg, #0D9488 0%, #14B8A6 50%, #2DD4BF 100%)",
        "ink-gradient":
          "linear-gradient(160deg, #042F2E 0%, #0F766E 60%, #115E59 100%)",
      },
      backgroundSize: {
        grid: "44px 44px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        aurora: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)", opacity: "0.55" },
          "33%": { transform: "translate3d(4%,-6%,0) scale(1.12)", opacity: "0.8" },
          "66%": { transform: "translate3d(-4%,4%,0) scale(0.95)", opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-24px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        "border-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        aurora: "aurora 16s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        marquee: "marquee 38s linear infinite",
        "glow-pulse": "glow-pulse 6s ease-in-out infinite",
        "border-spin": "border-spin 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
