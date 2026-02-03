import { store, type Job } from '../job-store';

export const runtime = 'nodejs';

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
