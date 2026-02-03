export const runtime = "nodejs";

import { supabaseServer, BUCKET } from "../supabase-server";
import { isBucketPublic } from "../providers/utils";

type JobStatus = "queued" | "processing" | "done" | "failed";

function compute(createdAtIso: string): { status: JobStatus; progress: number } {
  const createdAtMs = new Date(createdAtIso).getTime();
  const t = (Date.now() - createdAtMs) / 1000;
  if (t < 0.3) return { status: "queued", progress: 10 };
  if (t < 4) return { status: "processing", progress: Math.round(20 + t * 20) };
  return { status: "done", progress: 100 };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("job_id");
  if (!jobId) return new Response("Missing job_id", { status: 400 });

  const sb = supabaseServer();

  const { data, error } = await sb
    .from("enhance_jobs")
    .select("id, created_at, scale, status, progress, input_path, output_path")
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    console.error("[enhance/get-job] db error:", error.message);
    return new Response(error.message, { status: 500 });
  }
  if (!data) return new Response("Not found", { status: 404 });

  let status: JobStatus;
  let progress: number;
  if (data.status === "done") {
    status = "done";
    progress = 100;
  } else if (data.status === "failed") {
    status = "failed";
    progress = data.progress ?? 0;
  } else {
    const computed = compute(data.created_at);
    status = computed.status;
    progress = computed.progress;
  }

  const outputPath = data.output_path ?? data.input_path;
  let output_url: string | undefined;
  if (status === "done") {
    if (isBucketPublic()) {
      const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(outputPath);
      output_url = pub.publicUrl;
    } else {
      const { data: signed, error } = await sb.storage
        .from(BUCKET)
        .createSignedUrl(outputPath, 60 * 60);
      if (!error) output_url = signed?.signedUrl;
      else console.error("[enhance/get-job] signed url error:", error.message);
    }
  }

  return Response.json({
    job_id: data.id,
    status,
    progress,
    scale: (data.scale === 4 ? 4 : 2) as 2 | 4,
    output_url,
  });
}
