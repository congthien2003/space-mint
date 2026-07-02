import { useCallback, useEffect, useRef } from "react";
import { Terminal, type ITheme } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import type { TerminalThemeName } from "@shared/types";

interface UseTerminalOptions {
  terminalId: string;
  fontSize: number;
  theme: TerminalThemeName;
  onExit: (exitCode: number) => void;
}

export const TERMINAL_THEMES: Record<TerminalThemeName, ITheme> = {
  dark: {
    background: "#171714",
    foreground: "rgba(250,250,247,0.88)",
    cursor: "rgba(250,250,247,0.88)",
    cursorAccent: "#171714",
    selectionBackground: "rgba(229,57,53,0.32)",
    black: "#24231f",
    red: "#e53935",
    green: "#5f9f6e",
    yellow: "#d6a84f",
    blue: "#6f8fbf",
    magenta: "#b476a9",
    cyan: "#6da9a3",
    white: "#d8d4c7",
    brightBlack: "#5e5a50",
    brightRed: "#ff665f",
    brightGreen: "#84c693",
    brightYellow: "#f0c36b",
    brightBlue: "#94b5e5",
    brightMagenta: "#d59ac8",
    brightCyan: "#8fd2cc",
    brightWhite: "#fafaf7"
  },
  light: {
    background: "#fafaf7",
    foreground: "#26251e",
    cursor: "#26251e",
    cursorAccent: "#fafaf7",
    selectionBackground: "rgba(229,57,53,0.2)",
    black: "#26251e",
    red: "#bf2f2b",
    green: "#357a4f",
    yellow: "#9f6b18",
    blue: "#3c669f",
    magenta: "#8a4d80",
    cyan: "#2d7f78",
    white: "#eee9dc",
    brightBlack: "#777164",
    brightRed: "#dc4a45",
    brightGreen: "#4e9a66",
    brightYellow: "#bf852b",
    brightBlue: "#527fbf",
    brightMagenta: "#a6659b",
    brightCyan: "#409991",
    brightWhite: "#ffffff"
  },
  claude: {
    background: "#201b16",
    foreground: "#f3eadf",
    cursor: "#d97745",
    cursorAccent: "#201b16",
    selectionBackground: "rgba(217,119,69,0.32)",
    black: "#2b241d",
    red: "#dc5f55",
    green: "#7a9f6b",
    yellow: "#d99b4a",
    blue: "#7594b7",
    magenta: "#b77a9c",
    cyan: "#79a89d",
    white: "#ded2c3",
    brightBlack: "#756656",
    brightRed: "#f07a6c",
    brightGreen: "#9fbd8f",
    brightYellow: "#edb86a",
    brightBlue: "#98b3d2",
    brightMagenta: "#d09bb7",
    brightCyan: "#9fc8bf",
    brightWhite: "#fff8ef"
  },
  dracula: {
    background: "#282a36",
    foreground: "#f8f8f2",
    cursor: "#f8f8f2",
    cursorAccent: "#282a36",
    selectionBackground: "rgba(68,71,90,0.95)",
    black: "#21222c",
    red: "#ff5555",
    green: "#50fa7b",
    yellow: "#f1fa8c",
    blue: "#bd93f9",
    magenta: "#ff79c6",
    cyan: "#8be9fd",
    white: "#f8f8f2",
    brightBlack: "#6272a4",
    brightRed: "#ff6e6e",
    brightGreen: "#69ff94",
    brightYellow: "#ffffa5",
    brightBlue: "#d6acff",
    brightMagenta: "#ff92df",
    brightCyan: "#a4ffff",
    brightWhite: "#ffffff"
  },
  nord: {
    background: "#2e3440",
    foreground: "#d8dee9",
    cursor: "#88c0d0",
    cursorAccent: "#2e3440",
    selectionBackground: "rgba(67,76,94,0.95)",
    black: "#3b4252",
    red: "#bf616a",
    green: "#a3be8c",
    yellow: "#ebcb8b",
    blue: "#81a1c1",
    magenta: "#b48ead",
    cyan: "#88c0d0",
    white: "#e5e9f0",
    brightBlack: "#4c566a",
    brightRed: "#d08770",
    brightGreen: "#b1d196",
    brightYellow: "#f0d399",
    brightBlue: "#8fbcbb",
    brightMagenta: "#c895bf",
    brightCyan: "#8fbcbb",
    brightWhite: "#eceff4"
  },
  "tokyo-night": {
    background: "#1a1b26",
    foreground: "#c0caf5",
    cursor: "#c0caf5",
    cursorAccent: "#1a1b26",
    selectionBackground: "rgba(51,59,88,0.95)",
    black: "#15161e",
    red: "#f7768e",
    green: "#9ece6a",
    yellow: "#e0af68",
    blue: "#7aa2f7",
    magenta: "#bb9af7",
    cyan: "#7dcfff",
    white: "#a9b1d6",
    brightBlack: "#414868",
    brightRed: "#ff899d",
    brightGreen: "#b9f27c",
    brightYellow: "#ff9e64",
    brightBlue: "#8db0ff",
    brightMagenta: "#c7a9ff",
    brightCyan: "#a4daff",
    brightWhite: "#c0caf5"
  },
  "solarized-dark": {
    background: "#002b36",
    foreground: "#839496",
    cursor: "#93a1a1",
    cursorAccent: "#002b36",
    selectionBackground: "rgba(7,54,66,0.95)",
    black: "#073642",
    red: "#dc322f",
    green: "#859900",
    yellow: "#b58900",
    blue: "#268bd2",
    magenta: "#d33682",
    cyan: "#2aa198",
    white: "#eee8d5",
    brightBlack: "#586e75",
    brightRed: "#cb4b16",
    brightGreen: "#93a1a1",
    brightYellow: "#657b83",
    brightBlue: "#839496",
    brightMagenta: "#6c71c4",
    brightCyan: "#93a1a1",
    brightWhite: "#fdf6e3"
  }
};

function themeFor(theme: TerminalThemeName): ITheme {
  return TERMINAL_THEMES[theme] ?? TERMINAL_THEMES.dark;
}

/**
 * Owns a single xterm.js instance bound to a PTY terminal id.
 * - Creates the terminal once per `terminalId`.
 * - Bridges input (xterm -> PTY) and output (PTY -> xterm) over IPC.
 * - Keeps PTY cols/rows in sync with the rendered size via ResizeObserver.
 */
export function useTerminal(opts: UseTerminalOptions): {
  mountRef: React.RefObject<HTMLDivElement | null>;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  fit: () => void;
} {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  // Keep latest option values for callbacks without recreating the terminal.
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const fit = useCallback((): void => {
    if (!fitRef.current || !terminalRef.current) return;
    try {
      fitRef.current.fit();
      const dims = fitRef.current.proposeDimensions();
      if (dims) {
        window.app.terminals.resize({
          terminalId: optsRef.current.terminalId,
          cols: dims.cols,
          rows: dims.rows
        });
      }
    } catch {
      // ignore transient resize errors
    }
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Create the viewport node manually so the xterm DOM stays stable for
    // the lifetime of this terminal pane.
    const viewport = document.createElement("div");
    viewport.className = "h-full w-full overflow-hidden";
    viewport.dataset.terminalContainer = opts.terminalId;
    mount.appendChild(viewport);
    viewportRef.current = viewport;

    const terminal = new Terminal({
      fontSize: optsRef.current.fontSize,
      fontFamily:
        '"JetBrainsMonoNL Nerd Font Mono", "Cascadia Code", "HasklugNerdFont", ui-monospace, Consolas, monospace',
      theme: themeFor(optsRef.current.theme),
      cursorBlink: true,
      allowProposedApi: true
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());
    terminal.open(viewport);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitRef.current = fitAddon;

    const initial = fitAddon.proposeDimensions();
    if (initial) {
      window.app.terminals.resize({
        terminalId: opts.terminalId,
        cols: initial.cols,
        rows: initial.rows
      });
    }

    // xterm user input -> PTY.
    const dataDisp = terminal.onData((data) => {
      window.app.terminals.write({ terminalId: opts.terminalId, data });
    });

    // PTY output -> xterm.
    const offData = window.app.terminals.onData(opts.terminalId, (data) => {
      terminal.write(data);
    });

    // PTY exit -> notify caller.
    const offExit = window.app.terminals.onExit(opts.terminalId, (e) => {
      optsRef.current.onExit(e.exitCode);
    });

    // Keep PTY size synced on container resize (debounced via rAF).
    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!fitRef.current || !terminalRef.current) return;
        try {
          fitRef.current.fit();
          const dims = fitRef.current.proposeDimensions();
          if (dims) {
            window.app.terminals.resize({
              terminalId: optsRef.current.terminalId,
              cols: dims.cols,
              rows: dims.rows
            });
          }
        } catch {
          // ignore transient resize errors
        }
      });
    });
    ro.observe(viewport);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      dataDisp.dispose();
      offData();
      offExit();
      ro.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitRef.current = null;
      viewport.remove();
      viewportRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.terminalId]);

  // Live-update font size / theme without recreating the terminal.
  useEffect(() => {
    const t = terminalRef.current;
    if (!t) return;
    t.options.fontSize = opts.fontSize;
    t.options.theme = themeFor(opts.theme);
    // Re-fit because font size changes can alter cell metrics.
    fit();
  }, [fit, opts.fontSize, opts.theme]);

  return { mountRef, viewportRef, fit };
}
