/** @format */

const VIDEO_FILE_EXTENSION_REGEX = /\.(mp4|webm|ogg|mov|m4v)(?:$|[?#])/i;
const HTTP_PROTOCOL_REGEX = /^https?:$/;
const PROVIDER_ID_REGEX = /^[A-Za-z0-9_-]{6,}$/;
const BLOCKED_FOR_IFRAME_HOSTS = new Set(["disk.yandex.ru", "yadi.sk"]);

const trimProviderPrefix = (hostname: string): string =>
  hostname.toLowerCase().replace(/^www\./, "");

const normalizeToUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const extractYoutubeId = (url: URL, host: string): string | null => {
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return PROVIDER_ID_REGEX.test(id) ? id : null;
  }

  if (host !== "youtube.com" && host !== "m.youtube.com") {
    return null;
  }

  const byQuery = url.searchParams.get("v");
  if (byQuery && PROVIDER_ID_REGEX.test(byQuery)) {
    return byQuery;
  }

  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (!pathSegments.length) {
    return null;
  }

  const [prefix, maybeId] = pathSegments;

  if (prefix === "embed" || prefix === "shorts" || prefix === "live") {
    return maybeId && PROVIDER_ID_REGEX.test(maybeId) ? maybeId : null;
  }

  return null;
};

const resolveRutubeEmbedUrl = (url: URL): string | null => {
  const host = trimProviderPrefix(url.hostname);
  if (host !== "rutube.ru") {
    return null;
  }

  const path = url.pathname;
  const embedMatch = path.match(/^\/play\/embed\/([A-Za-z0-9_-]+)\/?$/i);
  if (embedMatch?.[1]) {
    return `https://rutube.ru/play/embed/${embedMatch[1]}`;
  }

  const videoMatch = path.match(/^\/video\/([A-Za-z0-9_-]+)\/?$/i);
  if (videoMatch?.[1]) {
    return `https://rutube.ru/play/embed/${videoMatch[1]}`;
  }

  return null;
};

const resolveGoogleDriveEmbedUrl = (url: URL): string | null => {
  const host = trimProviderPrefix(url.hostname);
  if (host !== "drive.google.com") {
    return null;
  }

  const fileIdFromPath = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
  if (fileIdFromPath) {
    return `https://drive.google.com/file/d/${fileIdFromPath}/preview`;
  }

  const fileIdFromQuery = url.searchParams.get("id");
  if (fileIdFromQuery && (url.pathname === "/uc" || url.pathname === "/open")) {
    return `https://drive.google.com/file/d/${fileIdFromQuery}/preview`;
  }

  return null;
};

const resolveYoutubeEmbedUrl = (url: URL): string | null => {
  const host = trimProviderPrefix(url.hostname);
  const id = extractYoutubeId(url, host);
  if (!id) {
    return null;
  }

  return `https://www.youtube.com/embed/${id}`;
};

export const resolveVideoUrlForIframe = (value: string | null | undefined): string | null => {
  const raw = value?.trim();
  if (!raw) {
    return null;
  }

  const parsed = normalizeToUrl(raw);
  if (!parsed || !HTTP_PROTOCOL_REGEX.test(parsed.protocol)) {
    return null;
  }

  const host = trimProviderPrefix(parsed.hostname);
  if (BLOCKED_FOR_IFRAME_HOSTS.has(host)) {
    return null;
  }

  return (
    resolveRutubeEmbedUrl(parsed) ||
    resolveGoogleDriveEmbedUrl(parsed) ||
    resolveYoutubeEmbedUrl(parsed) ||
    (VIDEO_FILE_EXTENSION_REGEX.test(parsed.pathname) ? raw : null)
  );
};
