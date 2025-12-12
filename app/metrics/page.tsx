"use client";

import { useEffect, useState } from "react";

type ParsedMetrics = Record<string, number>;

function parsePrometheusMetrics(body: string): ParsedMetrics {
  const result: ParsedMetrics = {};

  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Example: platform_studio_uptime_seconds 1234
    const [name, valueStr] = trimmed.split(/\s+/, 2);
    if (!name || !valueStr) continue;

    const value = Number(valueStr);
    if (!Number.isNaN(value)) {
      result[name] = value;
    }
  }

  return result;
}

export default function MetricsPage() {
  const [rawMetrics, setRawMetrics] = useState("Loading...");
  const [metrics, setMetrics] = useState<ParsedMetrics>({});
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  async function loadMetrics() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/metrics", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text();
      setRawMetrics(text);
      setMetrics(parsePrometheusMetrics(text));
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Error loading metrics", err);
      setError(String(err));
      setRawMetrics("Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadMetrics();
    }, 30000); // 30s

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const uptimeSeconds = metrics["platform_studio_uptime_seconds"] ?? 0;
  const uptimeHours = uptimeSeconds / 3600;

  const freeBytes = metrics["platform_studio_memory_free_bytes"] ?? 0;
  const totalBytes = metrics["platform_studio_memory_total_bytes"] ?? 0;
  const usedBytes = totalBytes - freeBytes;
  const usedPercent =
    totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0;

  const cpuCount = metrics["platform_studio_cpu_count"] ?? 0;
  const load1 = metrics["platform_studio_loadavg_1"] ?? 0;
  const load5 = metrics["platform_studio_loadavg_5"] ?? 0;
  const load15 = metrics["platform_studio_loadavg_15"] ?? 0;

  const memGB = (bytes: number) =>
    bytes > 0 ? (bytes / 1024 ** 3).toFixed(2) : "0.00";

  const loadBarWidth = (value: number) => {
    if (!cpuCount || cpuCount <= 0) return 0;
    const ratio = value / cpuCount;
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  };

  const statusLabel = uptimeSeconds > 60 ? "Healthy" : "Starting";
  const statusColor =
    uptimeSeconds > 60 ? "#16a34a" : uptimeSeconds > 0 ? "#eab308" : "#9ca3af";

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ marginBottom: 4 }}>Platform Studio – Metrics Dashboard</h1>
          <p style={{ marginTop: 0, marginBottom: 0, color: "#555" }}>
            Live Prometheus-style metrics for the Platform Studio backend,
            surfaced as a lightweight observability view.
          </p>

          <div style={{ marginTop: 8, display: "flex", gap: 12, fontSize: 12 }}>
            {/* Status pill */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 999,
                backgroundColor: "#f3f4f6",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: statusColor,
                }}
              />
              <span style={{ color: "#374151" }}>Status: {statusLabel}</span>
            </span>

            {/* Last updated */}
            <span style={{ color: "#6b7280" }}>
              {lastUpdated
                ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                : "Loading..."}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          <button
            onClick={loadMetrics}
            disabled={loading}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid #2563eb",
              background: loading ? "#eff6ff" : "#2563eb",
              color: loading ? "#1d4ed8" : "#fff",
              fontSize: 13,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Refreshing..." : "Refresh now"}
          </button>
          <label style={{ fontSize: 12, color: "#374151" }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Auto-refresh every 30s
          </label>
        </div>
      </header>

      {error && (
        <p style={{ color: "red", fontSize: 12, marginBottom: 16 }}>
          Error loading metrics: {error}
        </p>
      )}

      {/* Summary cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Uptime */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
            background: "#f9fafb",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            Uptime
          </h2>
          <p style={{ fontSize: 24, margin: "8px 0 4px" }}>
            {uptimeSeconds.toFixed(0)}s
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
            ≈ {uptimeHours.toFixed(2)} hours
          </p>
        </div>

        {/* Memory */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
            background: "#f9fafb",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            Memory Usage
          </h2>
          <p style={{ fontSize: 18, margin: "8px 0 4px" }}>
            {usedPercent}% used
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
            Used: {memGB(usedBytes)} GB / Total: {memGB(totalBytes)} GB
          </p>
          <div
            style={{
              marginTop: 8,
              height: 8,
              borderRadius: 999,
              background: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${usedPercent}%`,
                height: "100%",
                background: "#2563eb",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* CPU */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
            background: "#f9fafb",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            CPU Cores
          </h2>
          <p style={{ fontSize: 24, margin: "8px 0 4px" }}>{cpuCount}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
            Based on host runtime (Vercel / Node)
          </p>
        </div>
      </section>

      {/* Load averages */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 14, color: "#374151" }}>
          Load Average (per CPU)
        </h2>
        <p style={{ marginTop: 0, fontSize: 12, color: "#6b7280" }}>
          Each bar shows load / CPU count (values &gt; 100% indicate saturation).
        </p>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "6px 4px" }}>Window</th>
              <th style={{ padding: "6px 4px" }}>Load</th>
              <th style={{ padding: "6px 4px" }}>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "1 min", value: load1 },
              { label: "5 min", value: load5 },
              { label: "15 min", value: load15 },
            ].map((row) => (
              <tr key={row.label} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "6px 4px" }}>{row.label}</td>
                <td style={{ padding: "6px 4px" }}>{row.value.toFixed(2)}</td>
                <td style={{ padding: "6px 4px" }}>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: "#e5e7eb",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${loadBarWidth(row.value)}%`,
                        background:
                          row.value > cpuCount ? "#dc2626" : "#22c55e",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Raw metrics */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 14, color: "#374151" }}>
          Raw Prometheus Metrics
        </h2>
        <p style={{ marginTop: 0, fontSize: 12, color: "#6b7280" }}>
          Raw output from <code>/api/metrics</code>, suitable for scraping or debugging.
        </p>
        <pre
          style={{
            marginTop: 8,
            padding: 12,
            background: "#111827",
            color: "#e5e7eb",
            borderRadius: 8,
            fontFamily: "monospace",
            fontSize: 11,
            maxHeight: 320,
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {rawMetrics}
        </pre>
      </section>
    </main>
  );
}
