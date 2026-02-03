export const runtime = "nodejs";

import { store } from "../../../job-store";

export async function GET(
  _req: Request,
  { params }: { params: { jobid: string } }
) {
  const job = store.get(params.jobid);

  // ✅ 不管成功失败，都带一个唯一 header，方便确认是否命中本 handler
  const headers = new Headers({
    "X-IMGHANCER-RESULT": "HIT",
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
  });

  if (!job) {
    return new Response(`NO_JOB id=${params.jobid} store_size=${store.size}`, {
      status: 404,
      headers,
    });
  }

  if (!job.output_data_url && !job.input_data_url) {
    return new Response(`NO_DATA_URL id=${params.jobid}`, {
      status: 404,
      headers,
    });
  }

  return new Response(
    `OK id=${params.jobid} has_input=${!!job.input_data_url} has_output=${!!job.output_data_url}`,
    { status: 200, headers }
  );
}
