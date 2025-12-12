// src/scaffold/plugins.ts
import { FileTree } from "./fileTree";
import { ServiceSpec } from "./types";

export interface ScaffoldPlugin {
  id: string;
  shouldApply: (spec: ServiceSpec) => boolean;
  apply: (spec: ServiceSpec, tree: FileTree) => FileTree;
}
