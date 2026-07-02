export const TERMINAL_THEME_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "claude", label: "Claude" },
  { value: "dracula", label: "Dracula" },
  { value: "nord", label: "Nord" },
  { value: "tokyo-night", label: "Tokyo Night" },
  { value: "solarized-dark", label: "Solarized Dark" }
] as const;

export type TerminalThemeName =
  (typeof TERMINAL_THEME_OPTIONS)[number]["value"];

export type AppSettings = {
  defaultShell: string;
  terminalFontSize: number;
  terminalTheme: TerminalThemeName;
  ignoredFolders: string[];
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultShell: "",
  terminalFontSize: 14,
  terminalTheme: "dark",
  ignoredFolders: [
    "node_modules", ".git", "bin", "obj", "dist", "build",
    ".next", ".turbo", ".idea", ".vscode"
  ]
};

export function isTerminalThemeName(value: unknown): value is TerminalThemeName {
  return (
    typeof value === "string" &&
    TERMINAL_THEME_OPTIONS.some((option) => option.value === value)
  );
}

export function isDarkTerminalTheme(theme: TerminalThemeName): boolean {
  return theme !== "light";
}
