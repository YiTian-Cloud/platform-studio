// src/scaffold/allPlugins.ts
import { ScaffoldPlugin } from "./plugins";

import { openApiPlugin } from "./plugins/openApiPlugin";
import { authJwtPlugin } from "./plugins/authJwtPlugin";
import { testsPlugin } from "./plugins/testsPlugin";

// 🚫 TEMPORARILY COMMENT OUT the rest until we harden them
 import { loggingPlugin } from "./plugins/loggingPlugin";
 import { metricsPlugin } from "./plugins/metricsPlugin";
 import { debugToolkitPlugin } from "./plugins/debugToolkitPlugin";
import { obsDashboardPlugin } from "./plugins/obsDashboardPlugin";
 import { containerizationPlugin } from "./plugins/containerizationPlugin";
import { eventBusPlugin } from "./plugins/eventBusPlugin";
 import { serviceClientsPlugin } from "./plugins/serviceClientsPlugin";
 import { ciCdPlugin } from "./plugins/ciCdPlugin";

export const ALL_PLUGINS: ScaffoldPlugin[] = [
  openApiPlugin,
  authJwtPlugin,
  testsPlugin,

  // Re-enable one by one later:
   loggingPlugin,
   metricsPlugin,
   debugToolkitPlugin,
   obsDashboardPlugin,
 containerizationPlugin,
  eventBusPlugin,
   serviceClientsPlugin,
 ciCdPlugin,
];

console.log("ALL_PLUGINS:", ALL_PLUGINS.map(p => p?.id));
