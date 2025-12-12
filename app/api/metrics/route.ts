import os from "os";

export async function GET() {
  const uptime = os.uptime();
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const load = os.loadavg();
  const cpus = os.cpus().length;

  const metrics = `
# HELP platform_studio_uptime_seconds Uptime of Platform Studio instance
# TYPE platform_studio_uptime_seconds gauge
platform_studio_uptime_seconds ${uptime}

# HELP platform_studio_memory_usage_bytes Memory usage breakdown
# TYPE platform_studio_memory_usage_bytes gauge
platform_studio_memory_free_bytes ${freeMem}
platform_studio_memory_total_bytes ${totalMem}

# HELP platform_studio_cpu_count Number of CPU cores
# TYPE platform_studio_cpu_count gauge
platform_studio_cpu_count ${cpus}

# HELP platform_studio_loadavg Load average over 1, 5, 15 minutes
# TYPE platform_studio_loadavg gauge
platform_studio_loadavg_1 ${load[0]}
platform_studio_loadavg_5 ${load[1]}
platform_studio_loadavg_15 ${load[2]}
`;

  return new Response(metrics, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
