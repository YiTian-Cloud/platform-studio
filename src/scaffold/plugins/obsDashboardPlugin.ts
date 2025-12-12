import { ScaffoldPlugin } from "../plugins";
import { FileTree, addFile } from "../fileTree";
import { ServiceSpec } from "../types";

export const obsDashboardPlugin: ScaffoldPlugin = {
  id: "obs-dashboard",

  shouldApply: (spec: ServiceSpec) => spec.enableObsDashboard,

  apply: (_spec: ServiceSpec, tree: FileTree): FileTree => {
    tree = addFile(
      tree,
      "src/public/dashboard.html",
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Service Dashboard</title>
</head>
<body>
  <h1>Service Dashboard</h1>
  <button onclick="refresh()">Refresh</button>
  <pre id="output"></pre>
  <script>
    async function refresh() {
      const healthRes = await fetch("/health");
      const health = await healthRes.json();
      let metrics = "Metrics endpoint not enabled";
      try {
        const metricsRes = await fetch("/metrics");
        metrics = await metricsRes.text();
      } catch (e) {}
      document.getElementById("output").textContent =
        "Health:\\n" + JSON.stringify(health, null, 2) +
        "\\n\\nMetrics:\\n" + metrics;
    }
    refresh();
  </script>
</body>
</html>
`
    );

    const indexPath = "src/index.ts";
    let idx = tree[indexPath]?? ""; 

    idx = idx.replace(
      "// PLATFORM_IMPORTS",
      'import path from "path";\n// PLATFORM_IMPORTS'
    );

    idx = idx.replace(
      "// PLATFORM_ROUTES",
      `app.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// PLATFORM_ROUTES`
    );

    tree[indexPath] = idx;
    return tree;
  },
};
