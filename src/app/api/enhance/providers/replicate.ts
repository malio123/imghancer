import { supabaseServer, BUCKET } from '../supabase-server';
import type { CreateJobInput, CreateJobResult } from './types';
import { isBucketPublic } from './utils';

type ReplicatePrediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string | null;
};

function getReplicateConfig() {
  const token = process.env.REPLICATE_API_TOKEN;
  const model = process.env.REPLICATE_MODEL || 'zedge/real-esrgan';
  const version = process.env.REPLICATE_MODEL_VERSION || '';
  const imageKey = process.env.REPLICATE_IMAGE_INPUT_KEY || 'image';
  const scaleKey = process.env.REPLICATE_SCALE_INPUT_KEY || 'scale';
  const scaleFormat = (process.env.REPLICATE_SCALE_FORMAT || 'number')
    .toLowerCase()
    .trim();
  let extraInputs: Record<string, unknown> = {};
  if (process.env.REPLICATE_EXTRA_INPUTS) {
    try {
      extraInputs = JSON.parse(process.env.REPLICATE_EXTRA_INPUTS);
    } catch {
      throw new Error('REPLICATE_EXTRA_INPUTS must be valid JSON');
    }
  }

  if (!token) throw new Error('Missing REPLICATE_API_TOKEN');
  return { token, model, version, imageKey, scaleKey, scaleFormat, extraInputs };
}

async function resolveLatestVersionId(token: string, model: string) {
  const [owner, name] = model.split('/');
  if (!owner || !name) return '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const res = await fetch(
    `https://api.replicate.com/v1/models/${owner}/${name}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    }
  );
  clearTimeout(timeout);
  if (!res.ok) return '';
  const json = (await res.json().catch(() => ({}))) as {
    latest_version?: { id?: string };
  };
  return json?.latest_version?.id ?? '';
}

async function uploadInputToSupabase(
  id: string,
  bytes: Uint8Array,
  mime: string,
  ext: string
): Promise<{ inputPath: string; inputUrl: string }> {
  const sb = supabaseServer();
  const inputPath = `inputs/${id}.${ext}`;

  const up = await sb.storage.from(BUCKET).upload(inputPath, bytes, {
    contentType: mime,
    upsert: true,
  });
  if (up.error) throw new Error(up.error.message);

  if (isBucketPublic()) {
    const { data } = sb.storage.from(BUCKET).getPublicUrl(inputPath);
    const inputUrl = data?.publicUrl ?? '';
    if (!inputUrl) throw new Error('Failed to get public URL');
    return { inputPath, inputUrl };
  }

  const { data, error } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(inputPath, 60 * 60);
  if (error) throw new Error(error.message);
  const inputUrl = data?.signedUrl ?? '';
  if (!inputUrl) throw new Error('Failed to get signed URL');
  return { inputPath, inputUrl };
}

async function uploadOutputToSupabase(
  id: string,
  ext: string,
  outputUrl: string
): Promise<string> {
  const resp = await fetch(outputUrl, { cache: 'no-store' });
  if (!resp.ok) throw new Error('Failed to download enhanced image');
  const buf = new Uint8Array(await resp.arrayBuffer());

  const sb = supabaseServer();
  const outputPath = `outputs/${id}.${ext}`;

  const up = await sb.storage.from(BUCKET).upload(outputPath, buf, {
    contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    upsert: true,
  });
  if (up.error) throw new Error(up.error.message);

  return outputPath;
}

function extFromMime(mime: string) {
  if (mime.includes('png')) return 'png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('bmp')) return 'bmp';
  return 'png';
}

export async function createReplicateJob({
  id,
  dataUrl,
  scale,
}: CreateJobInput): Promise<CreateJobResult> {
  const {
    token,
    model,
    version,
    imageKey,
    scaleKey,
    scaleFormat,
    extraInputs,
  } = getReplicateConfig();

  const m = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!m) throw new Error('Bad dataUrl');
  const mime = m[1];
  const bytes = Uint8Array.from(Buffer.from(m[2], 'base64'));
  const ext = extFromMime(mime);

  const { inputPath, inputUrl } = await uploadInputToSupabase(
    id,
    bytes,
    mime,
    ext
  );

  const input: Record<string, unknown> = {
    [imageKey]: inputUrl,
    [scaleKey]: scaleFormat === 'nx' ? `${scale}x` : scale,
  };
  Object.assign(input, extraInputs);

  const body: Record<string, unknown> = { input };
  let versionId = version;
  if (!versionId) {
    versionId = await resolveLatestVersionId(token, model);
  }
  if (!versionId) {
    throw new Error(
      'Missing REPLICATE_MODEL_VERSION and could not resolve latest version'
    );
  }
  body.version = versionId;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=60',
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  const pred = (await res.json().catch(() => ({}))) as ReplicatePrediction;
  if (!res.ok) {
    const msg = pred?.error || `Replicate request failed (${res.status})`;
    throw new Error(msg);
  }

  if (pred.status !== 'succeeded') {
    const msg = pred.error || `Replicate status: ${pred.status}`;
    throw new Error(msg);
  }

  let outputUrl = '';
  if (Array.isArray(pred.output)) {
    outputUrl = pred.output[pred.output.length - 1] || '';
  } else {
    outputUrl = pred.output || '';
  }
  if (!outputUrl) throw new Error('Replicate response missing output URL');

  const outputPath = await uploadOutputToSupabase(id, ext, outputUrl);

  return {
    inputPath,
    outputPath,
    mime: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  };
}
