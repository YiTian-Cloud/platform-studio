import { ScaffoldPlugin } from "../plugins";
import { FileTree, addFile } from "../fileTree";
import { ServiceSpec } from "../types";

export const debugToolkitPlugin: ScaffoldPlugin = {
  id: "debug-toolkit",

  shouldApply: (spec: ServiceSpec) => spec.enableDebugToolkit,

  apply: (_spec: ServiceSpec, tree: FileTree): FileTree => {
    // VSCode launch config
    tree = addFile(
      tree,
      ".vscode/launch.json",
      `{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Service (TS)",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
`
    );

    // error handler
    tree = addFile(
      tree,
      "src/config/errorHandler.ts",
      `import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
}
`
    );

    const indexPath = "src/index.ts";
    let idx = tree[indexPath]?? ""; 

    idx = idx.replace(
      "// PLATFORM_IMPORTS",
      'import { errorHandler } from "./config/errorHandler";\n// PLATFORM_IMPORTS'
    );

    idx = idx.replace(
      "// PLATFORM_MIDDLEWARE",
      "// PLATFORM_MIDDLEWARE\n\napp.use(errorHandler as any);"
    );

    tree[indexPath] = idx;
    return tree;
  },
};
