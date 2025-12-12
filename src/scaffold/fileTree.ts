// src/scaffold/fileTree.ts
export interface FileTree {
    [path: string]: string; // e.g. "src/index.ts": "content..."
  }
  
  export function createEmptyTree(): FileTree {
    return {};
  }
  
  export function addFile(tree: FileTree, path: string, content: string): FileTree {
    return { ...tree, [path]: content };
  }
  