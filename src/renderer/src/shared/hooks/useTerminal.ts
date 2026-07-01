import { useEffect, useRef } from "react";
import { Terminal, type ITheme } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";

interface UseTerminalOptions {
  terminalId: string;
  fontSize: number;
  theme: "dark" | "light";
  onExit: (exitCode: number) => void;
}

const darkTheme: ITheme = {
  background: "#171714",
  foreground: "rgba(250,250,247,0.88)",
  cursor: "rgba(250,250,247,0.88)",
  cursorAccent: "#171714",
  selectionBackground: "rgba(229,57,53,0.32)"
};

const lightTheme: ITheme = {
  background: "#fafaf7",
  foreground: "#26251e",
  cursor: "#26251e",
  cursorAccent: "#fafaf7",
  selectionBackground: "rgba(229,57,53,0.2)"
};

function themeFor(theme: "dark" | "light"): ITheme {
  return theme === "dark" ? darkTheme : lightTheme;
}

/**
 * Owns a single xterm.js instance bound to a PTY terminal id.
 * - Creates the terminal once per `terminalId`.
 * - Bridges input (xterm -> PTY) and output (PTY -> xterm) over IPC.
 * - Keeps PTY cols/rows in sync with the rendered size via ResizeObserver.
 */
export function useTerminal(
  opts: UseTerminalOptions
): {
  containerRef: React.RefObject<HTMLDivElement | null>;
} {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  // Keep latest option values for callbacks without recreating the terminal.
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const terminal = new Terminal({
      fontSize: optsRef.current.fontSize,
      fontFamily:
        "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace",
      theme: themeFor(optsRef.current.theme),
      cursorBlink: true,
      allowProposedApi: true
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());
    terminal.open(container);
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
    ro.observe(container);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      dataDisp.dispose();
      offData();
      offExit();
      ro.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.terminalId]);

  // Live-update font size / theme without recreating the terminal.
  useEffect(() => {
    const t = terminalRef.current;
    if (!t) return;
    t.options.fontSize = opts.fontSize;
    t.options.theme = themeFor(opts.theme);
  }, [opts.fontSize, opts.theme]);

  return { containerRef };
}
