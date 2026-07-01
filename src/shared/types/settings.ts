export type AppSettings = {
  defaultShell: string;
  terminalFontSize: number;
  terminalTheme: "dark" | "light";
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
