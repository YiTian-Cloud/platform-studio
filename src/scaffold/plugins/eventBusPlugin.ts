// src/scaffold/plugins/eventBusPlugin.ts
import { ScaffoldPlugin } from "../plugins";
import { FileTree } from "../fileTree";
import { ServiceSpec } from "../types";
import { safeJsonParse } from "../utils/safeJson";

export const eventBusPlugin: ScaffoldPlugin = {
  id: "event-bus",

  shouldApply: (spec: ServiceSpec) => !!spec.connectToEventBus,

  apply: (_spec: ServiceSpec, tree: FileTree): FileTree => {
    const pkgPath = "package.json";

    // 1) Add a lightweight event bus dependency (e.g. node-rdkafka / kafkajs)
    if (tree[pkgPath]) {
      const pkg = safeJsonParse(tree[pkgPath], {
        name: _spec.serviceName || "my-service",
        version: "0.1.0",
        dependencies: {},
      });

      pkg.dependencies = {
        ...pkg.dependencies,
        kafkajs: "^2.2.4", // example – can be replaced by NATS, RabbitMQ, etc.
      };

      tree[pkgPath] = JSON.stringify(pkg, null, 2);
    }

    // 2) Add a simple event bus wrapper
    tree["src/config/eventBus.ts"] = `// Simple event bus integration (KafkaJS example)
// NOTE: This is a scaffold. Replace broker URL, topics, and error handling for your environment.

import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "${_spec.serviceName || "my-service"}",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

export const eventBus = {
  kafka,
  producer: kafka.producer(),
  consumer: kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || "${_spec.serviceName || "my-service"}-group" }),

  /**
   * Example publish helper.
   * At runtime, customize topic names, headers, and payload shapes.
   */
  async publish(topic: string, message: any) {
    const payload = typeof message === "string" ? message : JSON.stringify(message);
    await this.producer.send({
      topic,
      messages: [{ value: payload }],
    });
  },
};
`;

    // 3) Optionally wire a placeholder into index.ts for developers
    const indexPath = "src/index.ts";
    if (tree[indexPath]) {
      let idx = tree[indexPath];

      if (!idx.includes('from "./config/eventBus"')) {
        idx = idx.replace(
          "// PLATFORM_IMPORTS",
          'import { eventBus } from "./config/eventBus";\n// PLATFORM_IMPORTS'
        );
      }

      if (!idx.includes("// TODO: connect event bus")) {
        idx = idx.replace(
          "// PLATFORM_BOOTSTRAP",
          `  // TODO: connect event bus producer/consumer here if needed
  // await eventBus.producer.connect();
  // await eventBus.consumer.connect();

  // PLATFORM_BOOTSTRAP`
        );
      }

      tree[indexPath] = idx;
    }

    return tree;
  },
};
