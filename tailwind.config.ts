import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: {
        ink: "#13233A",
        muted: "#617187",
        primary: { DEFAULT: "#4F46E5", dark: "#4338CA", soft: "#EEF2FF" },
      },
      boxShadow: {
        soft: "0 8px 26px rgba(29,46,79,.045)",
        panel: "0 22px 70px rgba(30,44,74,.09)",
      },
    },
  },
  plugins: [],
} satisfies Config;
