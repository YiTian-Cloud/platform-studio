// src/scaffold/plugins/serviceClientsPlugin.ts
import { ScaffoldPlugin } from "../plugins";
import { FileTree } from "../fileTree";
import { ServiceSpec } from "../types";

export const serviceClientsPlugin: ScaffoldPlugin = {
  id: "service-clients",

  shouldApply: (spec: ServiceSpec) =>
    spec.enableServiceClients && spec.downstreamServices?.length > 0,

  apply: (spec: ServiceSpec, tree: FileTree): FileTree => {
    // ✅ Start from existing tree
    const next: FileTree = { ...tree };

    // 1) downstream config
    next["src/config/downstream.ts"] = `// Generated downstream config
export const downstreamServices = ${JSON.stringify(
      spec.downstreamServices,
      null,
      2
    )};
`;

    // 2) shared HTTP client
    next["src/infra/httpClient.ts"] = `// Simple wrapper around fetch/axios for downstream calls
import axios from "axios";
import { downstreamServices } from "../config/downstream";

export async function callDownstream(
  key: string,
  path: string,
  options: any = {}
) {
  const svc = (downstreamServices as any[]).find(s => s.key === key);
  if (!svc) {
    throw new Error(\`Unknown downstream service: \${key}\`);
  }

  const url = \`\${svc.baseUrl}\${path}\`;
  return axios({
    url,
    method: options.method || "GET",
    timeout: svc.timeoutMs || 3000,
    ...options,
  });
}
`;

    // 3) example client
    next["src/clients/userServiceClient.ts"] = `// Example typed client for User Service
import { callDownstream } from "../infra/httpClient";

export async function fetchUserProfile(userId: string) {
  const res = await callDownstream("userService", \`/v1/users/\${userId}\`);
  return res.data;
}
`;

    return next; // ✅ return the merged tree
  },
};
