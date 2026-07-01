import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { FileTreeNode } from "@shared/types";

/**
 * Reads directory entries on disk and applies ignore rules.
 * Children are returned as a flat list (lazy loaded by the renderer on expand).
 */
export class FileTreeService {
  readDirectory(dirPath: string, ignoredFolders: string[] = []): FileTreeNode[] {
    return this.readChildren(dirPath, ignoredFolders);
  }

  readChildren(folderPath: string, ignoredFolders: string[] = []): FileTreeNode[] {
    try {
      const entries = readdirSync(folderPath, { withFileTypes: true });
      const nodes: FileTreeNode[] = [];

      for (const entry of entries) {
        // Skip ignored directories entirely.
        if (entry.isDirectory() && ignoredFolders.includes(entry.name)) {
          continue;
        }
        // Skip hidden entries that are not useful for a project browser.
        if (entry.name.startsWith(".") && entry.name !== ".") {
          // keep dotfiles visible? We keep them, but ignore listed ones above.
        }

        nodes.push({
          name: entry.name,
          path: join(folderPath, entry.name),
          type: entry.isDirectory() ? "directory" : "file",
          children: entry.isDirectory() ? undefined : undefined
        });
      }

      // Directories first, then files, alphabetical.
      nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return nodes;
    } catch {
      // Folder unreadable (permissions / missing). Return empty list.
      return [];
    }
  }
}
