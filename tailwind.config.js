/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/renderer/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "aw-bg": "#f7f7f4",
        "aw-bg-soft": "#ffffff",
        "aw-bg-mute": "#efeee8",
        "aw-surface-strong": "#e6e5e0",
        "aw-text": "#26251e",
        "aw-text-soft": "#807d72",
        "aw-text-muted": "#a09c92",
        "aw-border": "#e6e5e0",
        "aw-border-strong": "#cfcdc4",
        "aw-accent": "#e53935",
        "aw-accent-active": "#c62828",
        "aw-success": "#1f8a65",
        "aw-error": "#cf2d56",
        "aw-terminal": "#171714",
        "aw-terminal-light": "#fafaf7",
        "aw-terminal-soft": "#20201c",
        "aw-terminal-mute": "#2a2924",
        "aw-terminal-text": "rgba(250, 250, 247, 0.88)",
        "aw-terminal-soft-text": "rgba(250, 250, 247, 0.58)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "monospace"]
      }
    }
  },
  plugins: []
};

