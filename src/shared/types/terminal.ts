export type TerminalPane = {
  id: string;
  projectId: string;
  title: string;
  cwd: string;
  shell: string;
  grid: { x: number; y: number; w: number; h: number };
};
