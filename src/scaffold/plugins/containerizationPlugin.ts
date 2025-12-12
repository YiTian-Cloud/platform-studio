import { ScaffoldPlugin } from "../plugins";
import { FileTree, addFile } from "../fileTree";
import { ServiceSpec } from "../types";

export const containerizationPlugin: ScaffoldPlugin = {
  id: "containerization",

  shouldApply: (spec: ServiceSpec) => spec.deployAsContainer,

  apply: (spec: ServiceSpec, tree: FileTree): FileTree => {
    const dockerfile = `FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
`;

    tree = addFile(tree, "Dockerfile", dockerfile);

    const k8s = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${spec.serviceName}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${spec.serviceName}
  template:
    metadata:
      labels:
        app: ${spec.serviceName}
    spec:
      containers:
        - name: ${spec.serviceName}
          image: YOUR_REGISTRY/${spec.serviceName}:latest
          ports:
            - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: ${spec.serviceName}
spec:
  type: ClusterIP
  selector:
    app: ${spec.serviceName}
  ports:
    - port: 80
      targetPort: 3000
`;

    tree = addFile(tree, "deploy/kubernetes.yaml", k8s);

    return tree;
  },
};
