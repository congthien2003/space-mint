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
        "aw-accent-soft": "rgba(229, 57, 53, 0.10)",
        "aw-success": "#1f8a65",
        "aw-error": "#cf2d56",
        "aw-warn": "#c08532",

        "aw-terminal": "#0e0e0c",
        "aw-terminal-soft": "#161614",
        "aw-terminal-mute": "#1d1c18",
        "aw-terminal-light": "#fafaf5",
        "aw-terminal-light-soft": "#f4f3ec",

        "aw-terminal-text": "rgba(232, 220, 196, 0.92)",
        "aw-terminal-ink-soft": "rgba(232, 220, 196, 0.62)",
        "aw-terminal-ink-mute": "rgba(232, 220, 196, 0.38)",

        "aw-terminal-text-light": "#26251e",
        "aw-terminal-ink-soft-light": "rgba(38, 37, 30, 0.62)",
        "aw-terminal-ink-mute-light": "rgba(38, 37, 30, 0.38)",

        "aw-terminal-soft-text": "rgba(232, 220, 196, 0.62)",

        "aw-terminal-prompt": "#e53935"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "monospace"]
      },
      fontSize: {
        "term-xs": ["11px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        "term-sm": ["12px", { lineHeight: "18px", letterSpacing: "0.005em" }],
        "term-base": ["13px", { lineHeight: "20px" }],
        "term-lg": ["14px", { lineHeight: "22px" }]
      },
      keyframes: {
        "term-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.92)" }
        },
        "term-cursor-blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" }
        },
        "term-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(229, 57, 53, 0.0)" },
          "50%": { boxShadow: "0 0 8px 0 rgba(229, 57, 53, 0.35)" }
        }
      },
      animation: {
        "term-pulse": "term-pulse 2.4s ease-in-out infinite",
        "term-cursor-blink": "term-cursor-blink 1.05s steps(1) infinite",
        "term-glow": "term-glow 3.2s ease-in-out infinite"
      },
      boxShadow: {
        "term-inset": "inset 0 1px 0 0 rgba(255, 255, 255, 0.04), inset 0 -1px 0 0 rgba(0, 0, 0, 0.30)",
        "term-focus": "0 0 0 1px rgba(229, 57, 53, 0.55), 0 0 0 4px rgba(229, 57, 53, 0.10)"
      }
    }
  },
  plugins: []
};