import { ScaffoldPlugin } from "../plugins";
import { FileTree, addFile } from "../fileTree";
import { ServiceSpec } from "../types";

export const ciCdPlugin: ScaffoldPlugin = {
  id: "ci-cd",

  shouldApply: (spec: ServiceSpec) => spec.enableCICD,

  apply: (_spec: ServiceSpec, tree: FileTree): FileTree => {
    const ciYaml = `name: CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
`;

    // Add GitHub Actions workflow
    tree = addFile(tree, ".github/workflows/ci.yml", ciYaml);

    return tree;
  },
};
