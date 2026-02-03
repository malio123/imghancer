export const runtime = 'nodejs';

type JobStatus = 'queued' | 'processing' | 'done' | 'failed';

type Job = {
  id: string;
  created_at_ms: number;
  scale: 2 | 4;
};

declare global {
  // eslint-disable-next-line no-var
  var __IMGHANCER_JOB_STORE__: Map<string, Job> | undefined;
}

const store = globalThis.__IMGHANCER_JOB_STORE__ ?? new Map<string, Job>();
globalThis.__IMGHANCER_JOB_STORE__ = store;

function computeStatus(createdAtMs: number): {
  status: JobStatus;
  progress: number;
} {
  const elapsed = Date.now() - createdAtMs;

  // 0~300ms queued
  if (elapsed < 300) return { status: 'queued', progress: 10 };

  // 300~2400ms processing（线性涨到 90）
  if (elapsed < 2400) {
    const t = (elapsed - 300) / (2400 - 300); // 0~1
    const progress = Math.round(20 + t * 70); // 20~90
    return { status: 'processing', progress };
  }

  // >=2400ms done
  return { status: 'done', progress: 100 };
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ jobId?: string; jobid?: string }> }
) {
  const { jobId, jobid } = await params;
  const id = jobId ?? jobid;

  if (!id) {
    return Response.json({ error: 'jobId is required' }, { status: 400 });
  }

  const job = store.get(id);
  if (!job) {
    return Response.json({ error: 'Job not found' }, { status: 404 });
  }

  const { status, progress } = computeStatus(job.created_at_ms);

  return Response.json(
    {
      job_id: job.id,
      status,
      progress,
      created_at: new Date(job.created_at_ms).toISOString(),
      scale: job.scale,
    },
    {
      headers: {
        'cache-control': 'no-store',
      },
    }
  );
}
