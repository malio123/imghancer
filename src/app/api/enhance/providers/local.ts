import { supabaseServer, BUCKET } from '../supabase-server';
import type { CreateJobInput, CreateJobResult } from './types';
import { bytesFromBase64, extFromMime, parseDataUrl } from './utils';

export async function createLocalJob({
  id,
  dataUrl,
}: CreateJobInput): Promise<CreateJobResult> {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) throw new Error('Bad dataUrl');

  const mime = parsed.mime;
  const ext = extFromMime(mime);

  const bytes = bytesFromBase64(parsed.b64);

  const sb = supabaseServer();

  const inputPath = `inputs/${id}.${ext}`;
  const outputPath = `outputs/${id}.${ext}`;

  const up1 = await sb.storage.from(BUCKET).upload(inputPath, bytes, {
    contentType: mime,
    upsert: true,
  });
  if (up1.error) throw new Error(up1.error.message);

  const up2 = await sb.storage.from(BUCKET).upload(outputPath, bytes, {
    contentType: mime,
    upsert: true,
  });
  if (up2.error) throw new Error(up2.error.message);

  return { inputPath, outputPath, mime };
}
