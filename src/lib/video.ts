export function isYouTubeUrl(url?: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return /(^|\.)youtube\.com$/.test(parsed.hostname) || parsed.hostname === "youtu.be";
  } catch {
    return false;
  }
}

export function toYouTubeEmbedUrl(url: string): string | null {
  if (!isYouTubeUrl(url)) return null;
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.pathname.startsWith("/embed/")) {
      return url;
    }

    const videoId = parsed.searchParams.get("v");
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const shortsIndex = pathParts.indexOf("shorts");
    if (shortsIndex >= 0 && pathParts[shortsIndex + 1]) {
      return `https://www.youtube.com/embed/${pathParts[shortsIndex + 1]}`;
    }
  } catch {
    return null;
  }
  return null;
}
