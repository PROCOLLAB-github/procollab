/** @format */

export function getFormattedFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];

  if (bytes === 0) return "0 Byte";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = Math.round(bytes / Math.pow(1024, i)).toFixed(1);

  return `${size} ${sizes[i]}`;
}
