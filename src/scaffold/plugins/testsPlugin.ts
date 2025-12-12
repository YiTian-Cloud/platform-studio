import { ScaffoldPlugin } from "../plugins";
import { FileTree, addFile } from "../fileTree";
import { ServiceSpec } from "../types";
import { safeJsonParse } from "../utils/safeJson";

type PackageJson = {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

export const testsPlugin: ScaffoldPlugin = {
  id: "tests",

  shouldApply: (spec: ServiceSpec) => spec.enableAutomatedTests,

  apply: (_spec: ServiceSpec, tree: FileTree): FileTree => {
    const pkgPath = "package.json";
    //const pkg = JSON.parse(tree[pkgPath]);
    const pkg: PackageJson = safeJsonParse<PackageJson>(tree[pkgPath], {
      name: _spec.serviceName || "my-service",
      version: "0.1.0",
      dependencies: {},
      devDependencies: {},
      scripts: {},
    });
    
    pkg.devDependencies = {
      ...pkg.devDependencies,
      jest: "^29.7.0",
      "ts-jest": "^29.1.1",
      "@types/jest": "^29.5.11",
      supertest: "^7.0.0",
      "@types/supertest": "^2.0.16",
      "@types/morgan": "^1.9.5", 
    };
    pkg.scripts = {
      ...pkg.scripts,
      test: "jest --passWithNoTests",
    };
    tree[pkgPath] = JSON.stringify(pkg, null, 2);

    tree = addFile(
      tree,
      "jest.config.cjs",
      `module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.ts"],
};
`
    );

    tree = addFile(
      tree,
      "test/unit/health.test.ts",
      `import request from "supertest";
import express from "express";

import "../../src/index"; // ensure app is wired

describe("Health endpoint", () => {
  it("returns ok", async () => {
    const app = express();
    app.get("/health", (_req, res) => res.json({ status: "ok" }));

    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
`
    );

    return tree;
  },
};
