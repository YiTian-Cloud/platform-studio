"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function DocsPage() {
  return (
    <main
      style={{
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 16 }}>Platform Studio API Docs</h1>
      <p style={{ marginTop: 0, marginBottom: 16, color: "#555" }}>
        These APIs power the Platform Studio UI: previewing scaffolds and
        generating downloadable ZIPs for new services.
      </p>

      <SwaggerUI url="/openapi.yaml" />
    </main>
  );
}
