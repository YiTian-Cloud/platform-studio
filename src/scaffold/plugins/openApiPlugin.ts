import { ScaffoldPlugin } from "../plugins";
import { FileTree, addFile } from "../fileTree";
import { ServiceSpec } from "../types";
import { safeJsonParse } from "../utils/safeJson";

export const openApiPlugin: ScaffoldPlugin = {
  id: "openapi-swagger",

  shouldApply: (spec: ServiceSpec) => spec.enableOpenAPI,

  apply: (spec: ServiceSpec, tree: FileTree): FileTree => {
    const pkgPath = "package.json";
    //const pkg = JSON.parse(tree[pkgPath]);
    const pkg = safeJsonParse(tree[pkgPath], {
      name: spec.serviceName || "my-service",
      version: "0.1.0",
      dependencies: {},
    });
    pkg.dependencies = {
      ...pkg.dependencies,
      "swagger-ui-express": "^5.0.1",
      yaml: "^2.5.0",
    };

    tree[pkgPath] = JSON.stringify(pkg, null, 2);

    // Basic OpenAPI spec seeded from service name + purpose
    tree = addFile(
      tree,
      "openapi/openapi.yaml",
      `openapi: 3.0.0
info:
  title: ${spec.serviceName} API
  version: 1.0.0
  description: ${spec.purpose || spec.serviceName + " service"}
paths:
  /health:
    get:
      summary: Health check
      responses:
        "200":
          description: OK
`
    );

    // Loader for OpenAPI
    tree = addFile(
      tree,
      "src/config/openapi.ts",
      `import fs from "fs";
import path from "path";
import yaml from "yaml";

export function loadOpenApiSpec() {
  const filePath = path.join(__dirname, "..", "..", "openapi", "openapi.yaml");
  const file = fs.readFileSync(filePath, "utf-8");
  return yaml.parse(file);
}
`
    );

    const indexPath = "src/index.ts";
    let idx = tree[indexPath]?? ""; 

    // Imports
    idx = idx.replace(
      "// PLATFORM_IMPORTS",
      'import swaggerUi from "swagger-ui-express";\nimport { loadOpenApiSpec } from "./config/openapi";\n// PLATFORM_IMPORTS'
    );

    // Startup: load spec once
    idx = idx.replace(
      "// PLATFORM_STARTUP",
      `const openApiSpec = loadOpenApiSpec();

// PLATFORM_STARTUP`
    );

    // Landing page + docs route
    idx = idx.replace(
      "// PLATFORM_ROUTES",
      `app.get("/", (_req, res) => {
  // Landing page – redirect to Swagger docs
  res.redirect("/docs");
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

// PLATFORM_ROUTES`
    );

    tree[indexPath] = idx;
    return tree;
  },
};
