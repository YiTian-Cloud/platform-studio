// src/scaffold/utils/safeJson.ts

/**
 * Safely parse JSON coming from the UI/spec.
 * If value is undefined, empty, or invalid JSON, return the fallback instead.
 */
export function safeJsonParse<T>(value: string | undefined | null, fallback: T): T {
  if (!value || value.trim() === "") {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch (err) {
    // You can log if you want, but never crash the scaffold:
    console.error("safeJsonParse: failed to parse JSON:", err);
    return fallback;
  }
}
