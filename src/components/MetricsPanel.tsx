import React, { useEffect, useState } from "react";

interface MetricsPanelProps {
  /**
   * Optional: override the metrics URL.
   * Defaults to "/metrics".
   */
  metricsUrl?: string;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metricsUrl = "/metrics" }) => {
  const [metricsPreview, setMetricsPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(metricsUrl, {
          // tweak if you need credentials / auth
          // credentials: "include",
        });

        // Read the body only once
        const bodyText = (await res.text()) ?? "";

        if (!res.ok) {
          // Surface some context in the UI + console
          const snippet = bodyText.slice(0, 120).replace(/\s+/g, " ");
          const message = `HTTP ${res.status} ${res.statusText || ""}${
            snippet ? ` – ${snippet}` : ""
          }`;
          throw new Error(message.trim());
        }

        const lines = bodyText.split(/\r?\n/).slice(0, 20);
        const preview = lines.join("\n").trim();

        setMetricsPreview(preview || "No metrics returned from the server.");
      } catch (err: any) {
        console.error("Error fetching metrics", err);
        setError(err?.message || "Failed to load metrics.");
        setMetricsPreview("");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [metricsUrl]);

  return (
    <div className="border rounded-md p-4 bg-slate-50">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-sm">Service Metrics (preview)</h2>
        {isLoading && (
          <span className="text-xs text-slate-500">Loading…</span>
        )}
      </div>

      {error && (
        <div className="mb-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {!error && !isLoading && (
        <pre className="text-xs bg-black text-green-200 rounded-md p-2 overflow-auto max-h-64 whitespace-pre-wrap">
          {metricsPreview || "No metrics to display."}
        </pre>
      )}
    </div>
  );
};

export default MetricsPanel;
