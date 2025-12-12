// src/scaffold/plugins/index.ts
import type { FileTree } from "../fileTree";
import type { ServiceSpec } from "../types";

export interface ScaffoldPlugin {
  name: string;
  shouldApply?: (spec: ServiceSpec) => boolean;
  apply: (spec: ServiceSpec, tree: FileTree) => void; // ⬅ void, mutate tree
}
