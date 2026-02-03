export const runtime = "nodejs";

export type Job = {
  id: string;
  created_at_ms: number;
  scale: 2 | 4;
  input_data_url?: string;
  output_data_url?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __IMGHANCER_JOB_STORE__: Map<string, Job> | undefined;
}

export const store: Map<string, Job> =
  globalThis.__IMGHANCER_JOB_STORE__ ?? new Map<string, Job>();

globalThis.__IMGHANCER_JOB_STORE__ = store;
