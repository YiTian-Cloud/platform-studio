// app/api/scaffold/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PassThrough } from "stream";
import archiver from "archiver";
import { generateServiceRepo } from "@/scaffold/generate";
import { ServiceSpec } from "@/scaffold/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const spec = (await req.json()) as ServiceSpec;

    // 1) Build the in-memory file tree
    const tree = generateServiceRepo(spec);

    // 2) Create a zip archive and pipe it through a Node stream
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = new PassThrough();

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      stream.destroy(err);
    });

    // Add all files from the tree into the archive
    for (const [filePath, contents] of Object.entries(tree)) {
      archive.append(contents, { name: filePath });
    }

    // Finalize the archive (no more files)
    archive.finalize();

    // Pipe archive output into the stream
    archive.pipe(stream);

    const fileName = `${spec.serviceName || "service"}-scaffold.zip`;

    // 3) Return the stream as a ZIP response
    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("Error in /api/scaffold:", err);
    return NextResponse.json(
      { error: "Failed to generate scaffold" },
      { status: 500 }
    );
  }
}
