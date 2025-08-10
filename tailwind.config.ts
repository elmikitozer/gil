import type { Config } from "tailwindcss";
export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./storyblok/**/*.{js,ts,jsx,tsx,mdx}", // ✅ ajoute ce dossier
  ],  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      colors: {
        bg: "#FAFAF8",
        fg: "#111111",
        muted: "#555555",
        border: "rgba(0,0,0,0.08)",
        accent: "#D6B37F",
        darkbg: "#0A0A0A",
        darkfg: "#F5F5F2",
        darkmuted: "#B5B5B5",
      },
      container: { center: true, padding: "1rem" },
    },
  },
  plugins: [],
} satisfies Config;
