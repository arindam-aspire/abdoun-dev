/**
 * S3 asset URLs must not go through `/_next/image` — the optimizer fetches server-side and
 * gets 403/timeout on private buckets; presigned query strings also break when re-encoded.
 */
export function shouldBypassNextImageOptimization(src: string): boolean {
  if (!src?.trim()) return false;
  try {
    const host = new URL(src).hostname.toLowerCase();
    if (!host.includes("amazonaws.com")) return false;
    return host.includes(".s3.") || host.startsWith("s3.");
  } catch {
    return false;
  }
}
