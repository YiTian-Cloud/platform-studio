// src/scaffold/generate.ts
import { FileTree } from "./fileTree";
import { ServiceSpec } from "./types";
import { baseServiceTemplate } from "./baseTemplate";
import { ALL_PLUGINS } from "./allPlugins";

export function generateServiceRepo(spec: ServiceSpec): FileTree {
  // 1️⃣ Start with the core skeleton
  let tree: FileTree = baseServiceTemplate(spec);

  console.log("🔧 Spec received:", spec);
  console.log("🔧 Before plugins, tree keys:", Object.keys(tree));

  for (const plugin of ALL_PLUGINS) {
    const name = (plugin as any).id ?? "(unnamed)";
    console.log("➡️ Running plugin:", name);

    if (plugin.shouldApply && !plugin.shouldApply(spec)) {
      console.log("   ⏭️ Skipped (shouldApply=false)");
      continue;
    }

    // ⬅️ THIS is the key line
    tree = plugin.apply(spec, tree);

    console.log("   ✅ After plugin, tree keys:", Object.keys(tree));
  }

  console.log("✅ Final tree keys:", Object.keys(tree));
  return tree;
}
