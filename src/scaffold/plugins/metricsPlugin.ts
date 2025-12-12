import { ScaffoldPlugin } from "../plugins";
import { FileTree, addFile } from "../fileTree";
import { ServiceSpec } from "../types";
import { safeJsonParse } from "../utils/safeJson";

export const metricsPlugin: ScaffoldPlugin = {
  id: "metrics",

  shouldApply: (spec: ServiceSpec) => spec.enableMetrics,

  apply: (_spec: ServiceSpec, tree: FileTree): FileTree => {
    const pkgPath = "package.json";
   // const pkg = JSON.parse(tree[pkgPath]);
   const pkg = safeJsonParse(tree[pkgPath], {
    name: _spec.serviceName || "my-service",
    version: "0.1.0",
    dependencies: {},
  });
    pkg.dependencies = {
      ...pkg.dependencies,
      "prom-client": "^15.0.0",
    };
    tree[pkgPath] = JSON.stringify(pkg, null, 2);

    tree = addFile(
      tree,
      "src/config/metrics.ts",
      `import client from "prom-client";
import { Request, Response, NextFunction } from "express";

export const register = new client.Registry();
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path", "status"],
});

register.registerMetric(httpRequestDuration);
client.collectDefaultMetrics({ register });

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const seconds = Number(end - start) / 1e9;
    httpRequestDuration
      .labels(req.method, req.path, String(res.statusCode))
      .observe(seconds);
  });
  next();
}
`
    );

    const indexPath = "src/index.ts";
    let idx = tree[indexPath]?? ""; 

    idx = idx.replace(
      "// PLATFORM_IMPORTS",
      'import { metricsMiddleware } from "./config/metrics";\n// PLATFORM_IMPORTS'
    );

    idx = idx.replace(
      "// PLATFORM_MIDDLEWARE",
      "app.use(metricsMiddleware);\n\n// PLATFORM_MIDDLEWARE"
    );

    idx = idx.replace(
      "// PLATFORM_ROUTES",
      `app.get("/metrics", async (_req, res) => {
  const { register } = await import("./config/metrics");
  res.setHeader("Content-Type", register.contentType);
  const metrics = await register.metrics();
  res.send(metrics);
});

// PLATFORM_ROUTES`
    );

    tree[indexPath] = idx;
    return tree;
  },
};
