export function parseDataUrl(dataUrl: string) {
  const m = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!m) return null;
  return { mime: m[1], b64: m[2] };
}

export function extFromMime(mime: string) {
  if (mime.includes('png')) return 'png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('bmp')) return 'bmp';
  return 'png';
}

export function bytesFromBase64(b64: string) {
  return Uint8Array.from(Buffer.from(b64, 'base64'));
}

export function isBucketPublic() {
  return (process.env.SUPABASE_BUCKET_PUBLIC ?? 'true') !== 'false';
}

export function maxBytesMB(mb: number) {
  return mb * 1024 * 1024;
}
