/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/renderer/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "aw-bg": "#1b1b1f",
        "aw-bg-soft": "#222222",
        "aw-bg-mute": "#282828",
        "aw-text": "rgba(255, 255, 245, 0.86)",
        "aw-text-soft": "rgba(235, 235, 245, 0.6)",
        "aw-border": "rgba(255, 255, 245, 0.12)",
        "aw-accent": "#6988e6"
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "monospace"]
      }
    }
  },
  plugins: []
};

