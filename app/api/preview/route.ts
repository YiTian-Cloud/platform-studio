// app/api/preview/route.ts
import { NextRequest } from "next/server";
import { generateServiceRepo } from "@/scaffold/generate";
import { ServiceSpec } from "@/scaffold/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const spec = (await req.json()) as ServiceSpec;
  const tree = generateServiceRepo(spec);

  const files = Object.keys(tree).sort();

  return Response.json({ files });
}
