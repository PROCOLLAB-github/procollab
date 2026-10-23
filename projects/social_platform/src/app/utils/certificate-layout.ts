/** @format */
import { CertificateBox } from "@domain/program/program-certificates.model";
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export function moveCertificateBox(box: CertificateBox, dx: number, dy: number): CertificateBox {
  let x = clamp(box.x + dx, 0, 100 - box.width);
  if (Math.abs(x + box.width / 2 - 50) < 1) x = 50 - box.width / 2;
  return { ...box, x, y: clamp(box.y + dy, 0, 100 - box.height) };
}
export function resizeCertificateBox(
  box: CertificateBox,
  dw: number,
  dh: number,
  imageRatio?: number,
): CertificateBox {
  let width = clamp(box.width + dw, 2, 100 - box.x);
  let height = clamp(box.height + dh, 1, 100 - box.y);
  if (imageRatio) {
    height = (width * (297 / 210)) / imageRatio;
    if (height > 100 - box.y) {
      height = 100 - box.y;
      width = (height * imageRatio) / (297 / 210);
    }
  }
  return { ...box, width, height };
}
