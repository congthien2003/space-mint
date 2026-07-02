import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { FileTreeNode } from "@shared/types";

const MAX_PREVIEW_BYTES = 512 * 1024;

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

  readTextFile(filePath: string): { content: string; size: number } {
    const stat = statSync(filePath);
    if (!stat.isFile()) {
      throw new Error("Selected path is not a file.");
    }
    if (stat.size > MAX_PREVIEW_BYTES) {
      throw new Error("File is too large to preview.");
    }

    const buffer = readFileSync(filePath);
    if (buffer.includes(0)) {
      throw new Error("Binary file preview is not supported.");
    }

    const content = buffer.toString("utf8");
    if (content.includes("\uFFFD")) {
      throw new Error("File encoding is not supported.");
    }

    return { content, size: stat.size };
  }
}
