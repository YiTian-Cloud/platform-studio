// src/scaffold/types.ts
export type IngressType = "http" | "kafka" | "s3";
export type StorageType = "postgres" | "mongodb" | "s3";

export type AuthOption = "jwt" | "none";
export type ApiVersioning = "v1-path" | "header";

export type DownstreamAuthType = "none" | "platform-jwt" | "api-key";
export type RetryPolicy = "none" | "simple" | "exponential";

export interface DownstreamService {
  key: string;
  name: string;
  baseUrl: string;
  authType: DownstreamAuthType;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
}

export interface ServiceSpec {
  serviceName: string;
  purpose: string;

  ingress: IngressType[];
  storage: StorageType[];

  // platform capabilities (Step 3)
  enableAuthJwt: boolean;
  enableRateLimiting: boolean;
  enableLogging: boolean;
  enableMetrics: boolean;
  enableTracing: boolean;
  enableAutomatedTests: boolean;
  enableDebugToolkit: boolean;
  enableObsDashboard: boolean;
  enableOpenAPI: boolean;
  enableCICD: boolean;

  // deployment & integration
  exposeAsRest: boolean;
  deployAsContainer: boolean;
  connectToEventBus: boolean;

  // outbound service clients
  enableServiceClients: boolean;
  downstreamServices: DownstreamService[];
}
