import type { Config } from "tailwindcss";
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./storyblok/**/*.{js,ts,jsx,tsx,mdx}", // ✅ ajoute ce dossier
  ],  theme: {
    extend: {
      fontFamily: {
        // Police du texte courant (Tailwind l'applique à <html>). Elle pointait vers
        // « var(--font-sans) », variable jamais définie : la déclaration était invalide et
        // le navigateur affichait sa police serif par défaut (Times). Rendu conservé, sans variable fantôme.
        sans: ["serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      colors: {
        bg: "#FAFAF8",
        fg: "#111111",
        muted: "#555555",
        border: "rgba(0,0,0,0.08)",
        accent: "#D6B37F",
      },
      container: { center: true, padding: "1rem" },
    },
  },
  plugins: [],
} satisfies Config;
