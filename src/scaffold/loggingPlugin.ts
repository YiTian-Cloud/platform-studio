import { ScaffoldPlugin } from "../plugins";
import { FileTree, addFile } from "../fileTree";
import { ServiceSpec } from "../types";
import { safeJsonParse } from "../utils/safeJson";

export const loggingPlugin: ScaffoldPlugin = {
  id: "logging",

  shouldApply: (spec: ServiceSpec) => spec.enableLogging,

  apply: (_spec: ServiceSpec, tree: FileTree): FileTree => {
    // enhance package.json dependencies
    const pkgJsonPath = "package.json";
    const pkg = safeJsonParse(tree[pkgJsonPath], {
      name: _spec.serviceName || "my-service",
      version: "0.1.0",
      dependencies: {},
    });
    //const pkg = JSON.parse(tree[pkgJsonPath]);

    pkg.dependencies = {
      ...pkg.dependencies,
      winston: "^3.13.0"
    };

    tree = { ...tree, [pkgJsonPath]: JSON.stringify(pkg, null, 2) };

    // add logger config
    tree = addFile(tree, "src/config/logger.ts", `import winston from "winston";

export function initLogger(serviceName: string) {
  return winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: serviceName },
    transports: [new winston.transports.Console()],
  });
}
`);

    // replace src/index.ts to use logger (simple string replace)
    const indexPath = "src/index.ts";
    if (tree[indexPath]) {
      const original = tree[indexPath]?? ""; 

      const enhanced = original.replace(
        "import express from \"express\";\n\nconst app = express();\n",
        `import express from "express";
import { initLogger } from "./config/logger";

const logger = initLogger(process.env.SERVICE_NAME || "service");
const app = express();
`
      ).replace(
        'console.log("',
        'logger.info("'
      );

      tree = { ...tree, [indexPath]: enhanced };
    }

    return tree;
  },
};
