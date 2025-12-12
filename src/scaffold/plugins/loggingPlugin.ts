// src/scaffold/plugins/loggingPlugin.ts
import { ScaffoldPlugin } from "../plugins";
import { FileTree } from "../fileTree";
import { ServiceSpec } from "../types";
import { safeJsonParse } from "../utils/safeJson";

export const loggingPlugin: ScaffoldPlugin = {
  id: "logging",

  // Only apply if logging is enabled in the spec
  shouldApply: (spec: ServiceSpec) => !!spec.enableLogging,

  apply: (_spec: ServiceSpec, tree: FileTree): FileTree => {
    // 1) Add logging dependency (morgan) into package.json if it exists
    const pkgPath = "package.json";
    if (tree[pkgPath]) {
      const pkg = safeJsonParse(tree[pkgPath], {
        name: _spec.serviceName || "my-service",
        version: "0.1.0",
        dependencies: {},
      });

      pkg.dependencies = {
        ...pkg.dependencies,
        morgan: "^1.10.0",
      };

      tree[pkgPath] = JSON.stringify(pkg, null, 2);
    }

    // 2) Wire logging into src/index.ts using comment placeholders
    const indexPath = "src/index.ts";
    if (tree[indexPath]) {
      let idx = tree[indexPath];

      // Add import once
      if (!idx.includes('from "morgan"')) {
        idx = idx.replace(
          "// PLATFORM_IMPORTS",
          'import morgan from "morgan";\n// PLATFORM_IMPORTS'
        );
      }

      // Add middleware hook once
      if (!idx.includes('app.use(morgan("combined"))')) {
        idx = idx.replace(
          "// PLATFORM_MIDDLEWARE",
          '  app.use(morgan("combined")); // HTTP access logging\n\n  // PLATFORM_MIDDLEWARE'
        );
      }

      tree[indexPath] = idx;
    }

    // IMPORTANT: do NOT clear or recreate the tree — only mutate existing entries
    return tree;
  },
};
