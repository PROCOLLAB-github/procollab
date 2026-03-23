/** @format */

export function isHtmlTextTruncated(value: string | null | undefined, limit: number): boolean {
  if (!value) return false;

  return value.replace(/<[^>]*>/g, "").length > limit;
}
