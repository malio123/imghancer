'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, PencilLine, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type JobStatus = 'idle' | 'queued' | 'processing' | 'done' | 'failed';

type CreateJobResponse = {
  job_id: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  progress?: number;
};

type GetJobResponse = {
  job_id: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  progress?: number;
  scale?: 2 | 4;
  output_url?: string; // ✅ Supabase Storage public url (or signed url later)
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function EnhanceClient() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState<2 | 4>(2);
  const [showResult, setShowResult] = useState(false);

  const [status, setStatus] = useState<JobStatus>('idle');
  const [progress, setProgress] = useState(0);

  const [jobId, setJobId] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);

  const pollRef = useRef<number | null>(null);

  const [meta, setMeta] = useState<{
    width: number;
    height: number;
    size: number;
  } | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  // ✅ 清理 preview blob url
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    let canceled = false;

    async function readImageMeta(f: File) {
      setMeta(null);
      setMetaError(null);

      const url = URL.createObjectURL(f);
      try {
        const img = new Image();
        img.decoding = 'async';

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to decode image'));
          img.src = url;
        });

        if (canceled) return;

        setMeta({
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          size: f.size,
        });
      } catch {
        if (!canceled) setMetaError('Could not read image metadata.');
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    if (file) readImageMeta(file);
    else {
      setMeta(null);
      setMetaError(null);
      setShowResult(false);
    }

    return () => {
      canceled = true;
    };
  }, [file]);

  const canStart =
    !!file && (status === 'idle' || status === 'done' || status === 'failed');

  const modelLabel =
    process.env.NEXT_PUBLIC_ENHANCE_MODEL_LABEL || 'Image Upscale';
  const providerLabel = process.env.NEXT_PUBLIC_ENHANCE_PROVIDER_LABEL || '';

  function estimateCredits(w: number, h: number, s: 2 | 4) {
    const outPixels = w * h * s * s;
    const divisor = s === 2 ? 1_000_000 : 1_500_000;
    const credits = Math.ceil(outPixels / divisor);
    return Math.min(Math.max(1, credits), 80);
  }

  const estimatedCredits = useMemo(() => {
    if (!meta) return null;
    return estimateCredits(meta.width, meta.height, scale);
  }, [meta, scale]);

  function stopPolling() {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function startJob() {
    if (!file) return;

    stopPolling();
    setAfterUrl(null);
    setJobId(null);
    setShowResult(false);

    setStatus('queued');
    setProgress(10);

    try {
      // ✅ 后端约定：必须传 dataUrl（后面你改 FormData 也行）
      const dataUrl = await fileToDataUrl(file);

      const res = await fetch('/api/enhance/create-job', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ scale, dataUrl }),
        cache: 'no-store',
      });

      if (!res.ok) {
        const msg = (await res.text().catch(() => '')).trim();
        if (res.status === 402) {
          toast.error('Billing is required for the current provider.');
        } else if (res.status === 401 || res.status === 403) {
          toast.error('Invalid API credentials or insufficient permissions.');
        } else if (res.status === 422) {
          toast.error('Provider parameters are invalid. Please check config.');
        } else {
          toast.error(msg || 'Enhance request failed. Please try again.');
        }
        setStatus('failed');
        return;
      }

      const data = (await res.json()) as CreateJobResponse;

      if (!data?.job_id) {
        setStatus('failed');
        return;
      }

      setJobId(data.job_id);
      setStatus(data.status);
      setProgress(data.progress ?? 15);

      pollRef.current = window.setInterval(async () => {
        try {
          const r = await fetch(`/api/enhance/get-job?job_id=${data.job_id}`, {
            cache: 'no-store',
          });
          if (!r.ok) return;

          const j = (await r.json()) as GetJobResponse;

          setProgress(j.progress ?? 0);
          setStatus(j.status);

          if (j.status === 'done') {
            stopPolling();
            if (j.output_url) {
              setAfterUrl(j.output_url); // ✅ 直接用 https url
              setShowResult(true);
            }
          }

          if (j.status === 'failed') {
            stopPolling();
            toast.error('Enhance failed. Please try again.');
          }
        } catch {
          stopPolling();
          setStatus('failed');
          toast.error('Enhance failed. Please try again.');
        }
      }, 800);
    } catch {
      setStatus('failed');
      toast.error('Enhance failed. Please try again.');
    }
  }

  function reset() {
    stopPolling();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setJobId(null);
    setAfterUrl(null);
    setFile(null);
    setShowResult(false);
    setStatus('idle');
    setProgress(0);
    setMeta(null);
    setMetaError(null);
  }

  const showProgress =
    status === 'queued' || status === 'processing' || (status === 'done' && !afterUrl);

  return (
    <div className="space-y-6">
      <div className="border-border/50 bg-card/30 relative overflow-hidden rounded-2xl border p-5">
        <div className="flex min-h-10 items-center justify-between">
          <div className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
            Upload
          </div>
          <button
            onClick={reset}
            disabled={!file}
            aria-hidden={!file}
            className={[
              'inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:outline-none',
              file ? 'hover:bg-red-500/20 opacity-100' : 'pointer-events-none opacity-0',
            ].join(' ')}
          >
            <Trash2 className="h-4 w-4" />
            Remove image
          </button>
        </div>

        <label className="bg-muted/20 hover:bg-muted/30 mt-3 block cursor-pointer rounded-2xl border border-dashed p-6 transition">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-background flex h-12 w-12 items-center justify-center rounded-xl border">
              <span className="text-xl">⬆️</span>
            </div>
            <div className="mt-3 text-sm font-medium">
              Drag &amp; drop an image, or click to upload
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              PNG / JPG / WEBP
            </div>
          </div>
        </label>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="bg-muted/10 overflow-hidden rounded-2xl border">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="preview"
                className="h-[360px] w-full object-contain"
              />
            ) : (
              <div className="text-muted-foreground flex h-[360px] items-center justify-center text-sm">
                No image selected
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-muted-foreground text-xs font-medium">
                Upscale
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setScale(2)}
                  className={[
                    'rounded-xl border px-3 py-3 text-left transition',
                    scale === 2
                      ? 'bg-foreground text-background'
                      : 'hover:bg-muted/30',
                  ].join(' ')}
                >
                  <div className="text-sm font-semibold">2×</div>
                  <div className="text-xs opacity-80">Fast &amp; cheap</div>
                </button>

                <button
                  onClick={() => setScale(4)}
                  className={[
                    'rounded-xl border px-3 py-3 text-left transition',
                    scale === 4
                      ? 'bg-foreground text-background'
                      : 'hover:bg-muted/30',
                  ].join(' ')}
                >
                  <div className="text-sm font-semibold">4×</div>
                  <div className="text-xs opacity-80">Sharper details</div>
                </button>
              </div>
            </div>

            <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                {meta ? (
                  <>
                    {meta.width}×{meta.height} ·{' '}
                    {(meta.size / 1024 / 1024).toFixed(2)} MB
                  </>
                ) : metaError ? (
                  metaError
                ) : (
                  'Final cost depends on resolution.'
                )}
              </div>
              <div className="text-foreground font-semibold">
                {!file && '—'}
                {file && !meta && !metaError && 'Calculating…'}
                {metaError && '—'}
                {meta &&
                  estimatedCredits !== null &&
                  `${estimatedCredits} credits`}
              </div>
            </div>

            <div className="text-muted-foreground text-xs">
              Model: {modelLabel}
              {providerLabel ? ` · ${providerLabel}` : ''}
            </div>

            <div className="text-muted-foreground text-xs">
              Recommended: PNG/JPG/WEBP. Large files may take longer.
            </div>

            <button
              onClick={startJob}
              disabled={!canStart}
              className="bg-foreground text-background w-full rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === 'idle' || status === 'done' || status === 'failed'
                ? 'Enhance Image'
                : 'Working…'}
            </button>

            {status === 'failed' ? (
              <button
                onClick={startJob}
                className="hover:bg-muted/30 w-full rounded-xl border px-4 py-2 text-sm font-semibold transition"
              >
                Retry
              </button>
            ) : null}

            <div className="text-muted-foreground text-[11px]">
              Your image is processed by a third-party model to generate the
              result. We don’t store it long-term.
            </div>

            <div className="text-muted-foreground text-[11px]">
              By uploading, you confirm you have rights to use this image.
            </div>
          </div>
        </div>

        {showProgress ? (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-background/90 w-full max-w-sm rounded-2xl border p-5">
              <div className="text-sm font-semibold">Enhancing…</div>
              <div className="text-muted-foreground mt-1 text-xs">
                {status === 'queued'
                  ? 'Queued…'
                  : status === 'done' && !afterUrl
                    ? 'Finalizing result…'
                    : 'Processing…'}
              </div>
              <div className="bg-muted/30 mt-4 h-2 w-full overflow-hidden rounded">
                <div
                  className="bg-foreground h-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : null}

        {showResult && afterUrl ? (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-background/95 w-full max-w-5xl rounded-2xl border p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold">Before / After</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowResult(false)}
                    className="border-border/70 bg-background/70 hover:bg-muted/40 focus-visible:ring-foreground/30 inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <PencilLine className="h-4 w-4" />
                    Back to edit
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const resp = await fetch(afterUrl, {
                          cache: 'no-store',
                        });
                        if (!resp.ok) throw new Error('Download failed');

                        const blob = await resp.blob();
                        const ext = blob.type.includes('png')
                          ? 'png'
                          : blob.type.includes('jpeg')
                            ? 'jpg'
                            : blob.type.includes('webp')
                              ? 'webp'
                              : 'png';

                        const objUrl = URL.createObjectURL(blob);

                        const a = document.createElement('a');
                        a.href = objUrl;
                        a.download = `imghancer_${scale}x.${ext}`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();

                        URL.revokeObjectURL(objUrl);
                      } catch (e) {
                        window.open(afterUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="bg-foreground text-background focus-visible:ring-foreground/40 inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted/10 rounded-xl border p-3">
                  <div className="text-muted-foreground text-xs">Before</div>
                  <div className="bg-background mt-2 overflow-hidden rounded-lg border">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="before"
                        className="h-[260px] w-full object-contain"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-[260px] items-center justify-center text-sm">
                        No image
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-muted/10 rounded-xl border p-3">
                  <div className="text-muted-foreground text-xs">After</div>
                  <div className="bg-background mt-2 overflow-hidden rounded-lg border">
                    {afterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={afterUrl}
                        alt="after"
                        className="h-[260px] w-full object-contain"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-[260px] items-center justify-center text-sm">
                        Run enhance to see result
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {jobId ? (
                <div className="text-muted-foreground mt-3 text-xs">
                  Job: {jobId}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
