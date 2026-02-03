export const runtime = 'nodejs';

type JobStatus = 'queued' | 'processing' | 'done' | 'failed';

type Job = {
  id: string;
  created_at_ms: number; // 用毫秒更方便算
  scale: 2 | 4;
};

declare global {
  // eslint-disable-next-line no-var
  var __IMGHANCER_JOB_STORE__: Map<string, Job> | undefined;
}

const store = globalThis.__IMGHANCER_JOB_STORE__ ?? new Map<string, Job>();
globalThis.__IMGHANCER_JOB_STORE__ = store;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const scale = (body?.scale === 4 ? 4 : 2) as 2 | 4;

  const id = (crypto as any).randomUUID
    ? crypto.randomUUID()
    : `job_${Date.now()}_${Math.random()}`;

  const job: Job = {
    id,
    created_at_ms: Date.now(),
    scale,
  };

  store.set(id, job);

  return Response.json({
    job_id: id,
    status: 'queued',
    progress: 10,
  });
}
