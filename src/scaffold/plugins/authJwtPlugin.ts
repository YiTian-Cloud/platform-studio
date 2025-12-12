import { ScaffoldPlugin } from "../plugins";
import { FileTree, addFile } from "../fileTree";
import { ServiceSpec } from "../types";
import { safeJsonParse } from "../utils/safeJson";

export const authJwtPlugin: ScaffoldPlugin = {
  id: "auth-jwt",

  shouldApply: (spec: ServiceSpec) => spec.enableAuthJwt,

  apply: (_spec: ServiceSpec, tree: FileTree): FileTree => {
    const pkgPath = "package.json";
    //const pkg = JSON.parse(tree[pkgPath]);
    const pkg = safeJsonParse(tree[pkgPath], {
      name: _spec.serviceName || "my-service",
      version: "0.1.0",
      dependencies: {},
    });
    pkg.dependencies = {
      ...pkg.dependencies,
      jsonwebtoken: "^9.0.2",
      "express-jwt": "^8.4.1",
    };
    tree[pkgPath] = JSON.stringify(pkg, null, 2);

    tree = addFile(
      tree,
      "src/config/jwt.ts",
      `import { expressjwt } from "express-jwt";

const secret = process.env.JWT_SECRET || "changeme-secret";

export const jwtMiddleware = expressjwt({
  secret,
  algorithms: ["HS256"],
}).unless({
  path: ["/health", "/metrics", "/dashboard"],
});
`
    );

    const indexPath = "src/index.ts";
    let idx = tree[indexPath]?? ""; 

    // import
    idx = idx.replace(
      "// PLATFORM_IMPORTS",
      'import { jwtMiddleware } from "./config/jwt";\n// PLATFORM_IMPORTS'
    );

    // middleware
    idx = idx.replace(
      "// PLATFORM_MIDDLEWARE",
      "app.use(jwtMiddleware);\n\n// PLATFORM_MIDDLEWARE"
    );

    tree[indexPath] = idx;

    return tree;
  },
};
