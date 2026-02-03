export const runtime = "nodejs";

import crypto from "crypto";

import { supabaseServer } from "../supabase-server";
import { createEnhanceJob } from "../providers";

function hashFromDataUrl(dataUrl: string) {
  const m = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!m) return null;
  const bytes = Buffer.from(m[2], "base64");
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function getProviderKey() {
  const provider = (process.env.ENHANCE_PROVIDER || "local").toLowerCase();
  if (provider === "replicate") {
    const model = process.env.REPLICATE_MODEL || "";
    const version = process.env.REPLICATE_MODEL_VERSION || "";
    const extra = process.env.REPLICATE_EXTRA_INPUTS || "";
    return `replicate:${model}:${version}:${extra}`;
  }
  return provider;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const scale = (body?.scale === 4 ? 4 : 2) as 2 | 4;

  const dataUrl = body?.dataUrl as string;
  if (!dataUrl || typeof dataUrl !== "string") {
    return new Response("Missing dataUrl", { status: 400 });
  }

  // ✅ 用 crypto.randomUUID 做 job id（跟你之前一致）
  const id = (crypto as any).randomUUID?.() ?? `job_${Date.now()}_${Math.random()}`;

  const sb = supabaseServer();

  // 🔁 cache lookup
  const hash = hashFromDataUrl(dataUrl);
  const providerKey = getProviderKey();
  const cacheKey = hash ? `${hash}:${scale}:${providerKey}` : null;
  if (cacheKey) {
    const { data, error } = await sb
      .from("enhance_cache")
      .select("output_path, hits")
      .eq("cache_key", cacheKey)
      .maybeSingle();
    if (error) {
      // ignore missing table or other cache errors
      console.error("[enhance/create-job] cache lookup error:", error.message);
    } else if (data?.output_path) {
      const nextHits = (data.hits ?? 0) + 1;
      try {
        await sb
          .from("enhance_cache")
          .update({
            hits: nextHits,
            last_hit_at: new Date().toISOString(),
          })
          .eq("cache_key", cacheKey);
      } catch {}
      const ins = await sb.from("enhance_jobs").insert({
        id,
        scale,
        status: "done",
        progress: 100,
        input_path: data.output_path,
        output_path: data.output_path,
      });
      if (ins.error) {
        console.error("[enhance/create-job] db insert error:", ins.error.message);
        return new Response(ins.error.message, { status: 500 });
      }
      return Response.json({ job_id: id, status: "done", progress: 100 });
    }
  }

  let inputPath = "";
  let outputPath = "";
  try {
    const res = await createEnhanceJob({ id, dataUrl, scale });
    inputPath = res.inputPath;
    outputPath = res.outputPath;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create job failed";
    console.error("[enhance/create-job] provider error:", msg);
    const status = msg === "Bad dataUrl" ? 400 : 500;
    return new Response(msg, { status });
  }

  // 3) 插入 DB
  const ins = await sb.from("enhance_jobs").insert({
    id,
    scale,
    status: "queued",
    progress: 10,
    input_path: inputPath,
    output_path: outputPath,
  });

  if (ins.error) {
    console.error("[enhance/create-job] db insert error:", ins.error.message);
    return new Response(ins.error.message, { status: 500 });
  }

  if (cacheKey) {
    const up = await sb
      .from("enhance_cache")
      .upsert({ cache_key: cacheKey, output_path: outputPath });
    if (up.error) {
      console.error("[enhance/create-job] cache upsert error:", up.error.message);
    }
  }

  return Response.json({ job_id: id, status: "queued", progress: 10 });
}
