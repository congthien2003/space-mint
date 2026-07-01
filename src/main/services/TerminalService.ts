import { spawn } from "node-pty";
import type { IPty } from "node-pty";
import { nanoid } from "nanoid";
import type { WebContents } from "electron";
import { IPC } from "@shared/types";

const DEFAULT_COLS = 80;
const DEFAULT_ROWS = 24;

/** Resolve the shell binary. Prefer the provided value, then platform default. */
function resolveShell(shell?: string): string {
  if (shell && shell.trim().length > 0) return shell;
  if (process.platform === "win32") {
    return process.env.COMSPEC || "powershell.exe";
  }
  return process.env.SHELL || "/bin/bash";
}

export interface CreateTerminalOptions {
  id?: string;
  projectId: string;
  cwd: string;
  shell?: string;
}

/**
 * Manages real shell processes via node-pty.
 * Each terminal is identified by an id (stable across layout restores) and
 * bound to the webContents that created it so PTY output is sent back via IPC.
 */
export class TerminalService {
  private ptys = new Map<string, IPty>();
  private projectMap = new Map<string, string>();

  create(opts: CreateTerminalOptions, webContents: WebContents): { terminalId: string } {
    const id = opts.id ?? nanoid();

    // If a process with this id still exists (e.g. restart), kill it first.
    if (this.ptys.has(id)) {
      this.kill(id);
    }

    const shell = resolveShell(opts.shell);
    const ptyProcess = spawn(shell, [], {
      name: "xterm-256color",
      cwd: opts.cwd,
      cols: DEFAULT_COLS,
      rows: DEFAULT_ROWS,
      env: process.env as unknown as Record<string, string>
    });

    ptyProcess.onData((data) => {
      webContents.send(`${IPC.TERMINAL_DATA}:${id}`, data);
    });

    ptyProcess.onExit(({ exitCode }) => {
      webContents.send(`${IPC.TERMINAL_EXIT}:${id}`, { exitCode });
      this.ptys.delete(id);
      this.projectMap.delete(id);
    });

    this.ptys.set(id, ptyProcess);
    this.projectMap.set(id, opts.projectId);

    return { terminalId: id };
  }

  write(id: string, data: string): void {
    this.ptys.get(id)?.write(data);
  }

  resize(id: string, cols: number, rows: number): void {
    const p = this.ptys.get(id);
    if (!p) return;
    try {
      p.resize(Math.max(cols, 1), Math.max(rows, 1));
    } catch {
      // Resize can fail right after spawn; ignore.
    }
  }

  kill(id: string): void {
    const p = this.ptys.get(id);
    if (!p) return;
    try {
      p.kill();
    } catch {
      // Process may already be dead; ignore.
    }
    this.ptys.delete(id);
    this.projectMap.delete(id);
  }

  killByProject(projectId: string): void {
    for (const [id, pid] of this.projectMap) {
      if (pid === projectId) {
        this.kill(id);
      }
    }
  }

  killAll(): void {
    for (const id of [...this.ptys.keys()]) {
      this.kill(id);
    }
  }
}
