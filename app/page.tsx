"use client";

import { useState, useEffect } from "react";
import { ServiceSpec, DownstreamService } from "@/scaffold/types";

// URLs for live platform demo (Swagger + metrics)
const PLATFORM_DOCS_URL =
  process.env.NEXT_PUBLIC_PLATFORM_DOCS_URL ?? "";
const PLATFORM_METRICS_URL =
  process.env.NEXT_PUBLIC_PLATFORM_METRICS_URL ?? "";

type FilePreviewState = {
  loading: boolean;
  files: string[];
  error?: string;
};

const defaultDownstreamJson = `[
  {
    "key": "userService",
    "name": "User Service",
    "baseUrl": "https://api.myco.com/user-service",
    "authType": "platform-jwt",
    "timeoutMs": 3000,
    "retryPolicy": "exponential"
  }
]`;

const exampleSwagger = `openapi: 3.0.0
info:
  title: Example Service API
  version: 1.0.0
  description: Example generated service API
paths:
  /health:
    get:
      summary: Health check
      responses:
        "200":
          description: OK
`;

export default function HomePage() {
  // Step 1 – basics
  const [serviceName, setServiceName] = useState("billing-service");
  const [purpose, setPurpose] = useState(
    "Handles invoices and payment webhooks"
  );

  // Step 2 – ingress & storage (simple defaults for now)
  const [ingressHttp, setIngressHttp] = useState(true);
  const [ingressKafka, setIngressKafka] = useState(false);
  const [ingressS3, setIngressS3] = useState(false);

  const [storagePostgres, setStoragePostgres] = useState(false);
  const [storageMongo, setStorageMongo] = useState(false);
  const [storageS3, setStorageS3] = useState(false);

  // Step 3 – platform capabilities
  const [enableAuthJwt, setEnableAuthJwt] = useState(true);
  const [enableRateLimit, setEnableRateLimit] = useState(false); // future plugin
  const [enableLogging, setEnableLogging] = useState(true); // assumes loggingPlugin
  const [enableMetrics, setEnableMetrics] = useState(true);
  const [enableTracing, setEnableTracing] = useState(false); // future plugin
  const [enableTests, setEnableTests] = useState(true);
  const [enableDebugToolkit, setEnableDebugToolkit] = useState(true);
  const [enableObsDashboard, setEnableObsDashboard] = useState(true);
  const [enableOpenAPI, setEnableOpenAPI] = useState(false); // future swagger plugin
  const [enableCICD, setEnableCICD] = useState(false); // future plugin

  // Step 4 – deployment & integration
  const [exposeAsRest, setExposeAsRest] = useState(true);
  const [deployAsContainer, setDeployAsContainer] = useState(true);
  const [connectToEventBus, setConnectToEventBus] = useState(false);

  // Step 5 – downstream services
  const [enableServiceClients, setEnableServiceClients] = useState(true);
  const [downstreamJson, setDownstreamJson] = useState(defaultDownstreamJson);

  // UX state
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<FilePreviewState>({
    loading: false,
    files: [],
  });
  const [swaggerVisible, setSwaggerVisible] = useState(false);

  // NEW: metrics snapshot state for the right-hand panel
  const [metricsPreview, setMetricsPreview] = useState<string>("Loading...");
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Fetch a small snapshot of /metrics from the demo service
  useEffect(() => {
    if (!PLATFORM_METRICS_URL) {
      setMetricsPreview("No metrics URL configured. Set NEXT_PUBLIC_PLATFORM_METRICS_URL.");
      return;
    }

    fetch(PLATFORM_METRICS_URL)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();
        const previewText = text.split("\n").slice(0, 20).join("\n");
        setMetricsPreview(previewText);
      })
      .catch((err) => {
        console.error("Error fetching metrics", err);
        setMetricsError(String(err));
        setMetricsPreview("Unable to load metrics snapshot.");
      });
  }, []);

  // Build ServiceSpec from UI state
  function buildSpec(): ServiceSpec {
    let downstream: DownstreamService[] = [];
    if (enableServiceClients && downstreamJson.trim().length > 0) {
      try {
        downstream = JSON.parse(downstreamJson);
      } catch {
        // leave empty, preview/generate will surface error if needed
      }
    }

    const ingress: ServiceSpec["ingress"] = [];
    if (ingressHttp) ingress.push("http");
    if (ingressKafka) ingress.push("kafka");
    if (ingressS3) ingress.push("s3");

    const storage: ServiceSpec["storage"] = [];
    if (storagePostgres) storage.push("postgres");
    if (storageMongo) storage.push("mongodb");
    if (storageS3) storage.push("s3");

    return {
      serviceName,
      purpose,
      ingress,
      storage,
      enableAuthJwt,
      enableRateLimiting: enableRateLimit,
      enableLogging,
      enableMetrics,
      enableTracing,
      enableAutomatedTests: enableTests,
      enableDebugToolkit,
      enableObsDashboard,
      enableOpenAPI,
      enableCICD,
      exposeAsRest,
      deployAsContainer,
      connectToEventBus,
      enableServiceClients,
      downstreamServices: downstream,
    };
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const spec = buildSpec();
      const res = await fetch("/api/scaffold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spec),
      });

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${serviceName}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate scaffold. Check console for details.");
    } finally {
      setGenerating(false);
    }
  }

  async function handlePreview() {
    setPreview({ loading: true, files: [] });
    try {
      const spec = buildSpec();
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spec),
      });
      if (!res.ok) {
        throw new Error(`Preview failed with status ${res.status}`);
      }
      const data = (await res.json()) as { files: string[] };
      setPreview({ loading: false, files: data.files });
    } catch (err: any) {
      console.error(err);
      setPreview({
        loading: false,
        files: [],
        error: err?.message || "Failed to load preview",
      });
    }
  }

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Landing header */}
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>Platform Studio – Service Factory</h1>
        <p style={{ margin: 0, color: "#555" }}>
          Low-code platform to generate production-ready service scaffolds with
          auth, metrics, tests, observability, containers, and more—so you only
          focus on core business logic.
        </p>

        {/* Top actions */}
        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Toggle example Swagger YAML */}
          <button
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#f5f5f5",
              cursor: "pointer",
            }}
            onClick={() => setSwaggerVisible((v) => !v)}
          >
            {swaggerVisible ? "Hide Swagger Doc Example" : "Show Swagger Doc Example"}
          </button>

          {/* NEW: open live docs from demo service */}
          <button
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #2563eb",
              background: PLATFORM_DOCS_URL ? "#2563eb" : "#e5e7eb",
              color: PLATFORM_DOCS_URL ? "#fff" : "#555",
              cursor: PLATFORM_DOCS_URL ? "pointer" : "not-allowed",
            }}
            disabled={!PLATFORM_DOCS_URL}
            onClick={() => {
              if (PLATFORM_DOCS_URL) {
                window.open(PLATFORM_DOCS_URL, "_blank", "noopener,noreferrer");
              }
            }}
          >
            Open Live API Docs
          </button>
        </div>

        {swaggerVisible && (
          <pre
            style={{
              marginTop: 12,
              padding: 12,
              background: "#111",
              color: "#eee",
              borderRadius: 8,
              overflowX: "auto",
              fontSize: 12,
            }}
          >
            {exampleSwagger}
          </pre>
        )}
      </header>

      {/* Wizard sections */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.3fr)",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* Left: form */}
        <section>
          {/* Step 1 */}
          <section
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Step 1 – Basic Info</h2>
            <label style={{ display: "block", marginBottom: 12 }}>
              Service Name
              <input
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 4,
                  padding: 6,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </label>
            <label style={{ display: "block" }}>
              Purpose
              <textarea
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 4,
                  padding: 6,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </label>
          </section>

          {/* Step 2 – Ingress & Storage */}
          <section
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Step 2 – Ingress & Storage</h2>
            <div style={{ display: "flex", gap: 32 }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>Ingress</h3>
                <label style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={ingressHttp}
                    onChange={(e) => setIngressHttp(e.target.checked)}
                  />{" "}
                  HTTP
                </label>
                <label style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={ingressKafka}
                    onChange={(e) => setIngressKafka(e.target.checked)}
                  />{" "}
                  Kafka
                </label>
                <label style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={ingressS3}
                    onChange={(e) => setIngressS3(e.target.checked)}
                  />{" "}
                  S3 / batch
                </label>
              </div>
              <div>
                <h3 style={{ marginBottom: 4 }}>Storage</h3>
                <label style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={storagePostgres}
                    onChange={(e) => setStoragePostgres(e.target.checked)}
                  />{" "}
                  Postgres
                </label>
                <label style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={storageMongo}
                    onChange={(e) => setStorageMongo(e.target.checked)}
                  />{" "}
                  MongoDB
                </label>
                <label style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={storageS3}
                    onChange={(e) => setStorageS3(e.target.checked)}
                  />{" "}
                  S3
                </label>
              </div>
            </div>
          </section>

          {/* Step 3 – Platform capabilities */}
          <section
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Step 3 – Platform Capabilities</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 4,
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={enableAuthJwt}
                  onChange={(e) => setEnableAuthJwt(e.target.checked)}
                />{" "}
                Auth & JWT middleware
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enableRateLimit}
                  onChange={(e) => setEnableRateLimit(e.target.checked)}
                />{" "}
                Rate limiting & throttling
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enableLogging}
                  onChange={(e) => setEnableLogging(e.target.checked)}
                />{" "}
                Central logging
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enableMetrics}
                  onChange={(e) => setEnableMetrics(e.target.checked)}
                />{" "}
                Metrics & /metrics endpoint
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enableTracing}
                  onChange={(e) => setEnableTracing(e.target.checked)}
                />{" "}
                Tracing hooks (future)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enableTests}
                  onChange={(e) => setEnableTests(e.target.checked)}
                />{" "}
                Automated tests (Jest)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enableDebugToolkit}
                  onChange={(e) => setEnableDebugToolkit(e.target.checked)}
                />{" "}
                Debug toolkit (error handler & VSCode)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enableObsDashboard}
                  onChange={(e) => setEnableObsDashboard(e.target.checked)}
                />{" "}
                Observability dashboard (/dashboard)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enableOpenAPI}
                  onChange={(e) => setEnableOpenAPI(e.target.checked)}
                />{" "}
                OpenAPI / Swagger (future plugin)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enableCICD}
                  onChange={(e) => setEnableCICD(e.target.checked)}
                />{" "}
                CI/CD workflow (future)
              </label>
            </div>
          </section>

          {/* Step 4 – Deployment & Integration */}
          <section
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Step 4 – Deployment & Integration Surfaces
            </h2>
            <label style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={exposeAsRest}
                onChange={(e) => setExposeAsRest(e.target.checked)}
              />{" "}
              Expose as REST service (HTTP endpoints)
            </label>
            <label style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={deployAsContainer}
                onChange={(e) => setDeployAsContainer(e.target.checked)}
              />{" "}
              Containerized service (Dockerfile + k8s template)
            </label>
            <label style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={connectToEventBus}
                onChange={(e) => setConnectToEventBus(e.target.checked)}
              />{" "}
              Connect to event bus (Kafka wrapper)
            </label>
          </section>

          {/* Step 5 – Downstream services / clients */}
          <section
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Step 5 – Service Clients</h2>
            <label style={{ display: "block", marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={enableServiceClients}
                onChange={(e) => setEnableServiceClients(e.target.checked)}
              />{" "}
              Generate service-to-service HTTP clients
            </label>
            {enableServiceClients && (
              <>
                <p style={{ marginTop: 4, fontSize: 13, color: "#555" }}>
                  Configure downstream services as JSON array of objects with
                  fields:
                  <code> key, name, baseUrl, authType, timeoutMs, retryPolicy</code>.
                </p>
                <textarea
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: 4,
                    padding: 6,
                    borderRadius: 4,
                    border: "1px solid " +
                      "#ccc",
                    fontFamily: "monospace",
                    fontSize: 12,
                  }}
                  rows={8}
                  value={downstreamJson}
                  onChange={(e) => setDownstreamJson(e.target.value)}
                />
              </>
            )}
          </section>

          {/* Actions */}
          <section style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #888",
                background: "#f0f0f0",
                cursor: "pointer",
              }}
              onClick={handlePreview}
              disabled={preview.loading}
            >
              {preview.loading ? "Previewing..." : "Preview Scaffold Files"}
            </button>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate & Download ZIP"}
            </button>
          </section>

          <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            After download: <code>npm install</code>,{" "}
            <code>npm run dev</code>, then open{" "}
            <code>http://localhost:3000/health</code> or{" "}
            <code>/dashboard</code> (if enabled).
          </p>
        </section>

        {/* Right: file tree preview + metrics */}
        <aside
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Scaffold File Preview</h2>
          <p style={{ fontSize: 13, color: "#555" }}>
            Click <strong>Preview Scaffold Files</strong> to see what will be
            generated based on the selected options.
          </p>
          {preview.error && (
            <p style={{ color: "red", fontSize: 13 }}>{preview.error}</p>
          )}
          {preview.files.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                paddingLeft: 0,
                marginTop: 12,
                fontFamily: "monospace",
                fontSize: 12,
              }}
            >
              {preview.files.map((f) => (
                <li key={f} style={{ marginBottom: 2 }}>
                  {f}
                </li>
              ))}
            </ul>
          )}

          {/* NEW: platform metrics snapshot */}
          <hr style={{ margin: "16px 0", borderColor: "#eee" }} />
          <h3 style={{ marginTop: 0 }}>Platform Metrics Snapshot</h3>
          <p style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
            Live Prometheus-style metrics from the demo service. Use this to
            showcase platform observability (e.g. <code>http_request_duration_ms</code>).
          </p>

          <button
            style={{
              padding: "6px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: PLATFORM_METRICS_URL ? "#f5f5f5" : "#eee",
              cursor: PLATFORM_METRICS_URL ? "pointer" : "not-allowed",
              fontSize: 11,
              marginBottom: 8,
            }}
            disabled={!PLATFORM_METRICS_URL}
            onClick={() => {
              if (PLATFORM_METRICS_URL) {
                window.open(
                  PLATFORM_METRICS_URL,
                  "_blank",
                  "noopener,noreferrer"
                );
              }
            }}
          >
            Open /metrics in new tab
          </button>

          {PLATFORM_METRICS_URL === "" && (
            <p style={{ fontSize: 11, color: "#b45309" }}>
              Set <code>NEXT_PUBLIC_PLATFORM_METRICS_URL</code> in{" "}
              <code>.env.local</code> to enable live metrics.
            </p>
          )}

          <pre
            style={{
              marginTop: 4,
              padding: 8,
              background: "#111827",
              color: "#e5e7eb",
              borderRadius: 6,
              fontFamily: "monospace",
              fontSize: 11,
              maxHeight: 220,
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {metricsError
              ? `${metricsPreview}\n\nError: ${metricsError}`
              : metricsPreview}
          </pre>
        </aside>
      </div>
    </main>
  );
}
