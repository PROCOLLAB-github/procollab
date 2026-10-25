/** @format */
import {
  CERTIFICATE_ELEMENTS,
  CertificateBox,
  CertificateDraft,
  CertificateElement,
} from "@domain/program/program-certificates.model";
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export function certificatePage(orientation: CertificateDraft["orientation"] = "landscape") {
  return orientation === "portrait"
    ? { widthMm: 210, heightMm: 297, widthPx: 793.7, heightPx: 1122 }
    : { widthMm: 297, heightMm: 210, widthPx: 1122, heightPx: 793.7 };
}
export function moveCertificateBox(
  box: CertificateBox,
  dx: number,
  dy: number,
  snap = true,
): CertificateBox {
  let x = clamp(box.x + dx, 0, 100 - box.width);
  let y = clamp(box.y + dy, 0, 100 - box.height);
  if (snap && Math.abs(x + box.width / 2 - 50) < 1) x = 50 - box.width / 2;
  if (snap && Math.abs(y + box.height / 2 - 50) < 1) y = 50 - box.height / 2;
  return { ...box, x, y };
}
export function resizeCertificateBox(
  box: CertificateBox,
  dw: number,
  dh: number,
  imageRatio?: number,
  orientation: CertificateDraft["orientation"] = "landscape",
): CertificateBox {
  let width = clamp(box.width + dw, 2, 100 - box.x);
  let height = clamp(box.height + dh, 1, 100 - box.y);
  if (imageRatio) {
    const page = certificatePage(orientation);
    const aspect = page.widthMm / page.heightMm;
    const verticalWidth = (dh * imageRatio) / aspect;
    const delta = Math.abs(verticalWidth) > Math.abs(dw) ? verticalWidth : dw;
    const minWidth = Math.max(2, imageRatio / aspect);
    const maxWidth = Math.min(100 - box.x, ((100 - box.y) * imageRatio) / aspect);
    // Extreme image ratios use a valid box; object-fit: contain preserves the image itself.
    if (minWidth <= maxWidth) {
      width = clamp(box.width + delta, minWidth, maxWidth);
      height = clamp((width * aspect) / imageRatio, 1, 100 - box.y);
    } else {
      width = clamp(box.width + delta, 2, 100 - box.x);
    }
  }
  return { ...box, width, height };
}

/** Grow the text area with the requested type size instead of silently shrinking the type. */
export function sizeCertificateText(
  value: string,
  box: CertificateBox,
  fontSize: number,
  measure: (text: string) => number,
  orientation: CertificateDraft["orientation"] = "landscape",
): CertificateBox {
  const page = certificatePage(orientation);
  const fit = fitCertificateText(value, { ...box, height: 100, fontSize }, measure, orientation);
  const height = Math.min(
    100,
    Math.max(box.height, ((fit.lines.length * fontSize * 1.3 + 2.1) / page.heightPx) * 100),
  );
  return { ...box, fontSize, height, y: clamp(box.y - (height - box.height) / 2, 0, 100 - height) };
}

export function hiddenCertificateElements(
  draft: CertificateDraft,
): Exclude<CertificateElement, "name">[] {
  const hidden = new Set<CertificateElement>(draft.hiddenElements ?? []);
  if (!draft.showText) {
    hidden.add("title");
    hidden.add("subtitle");
  }
  return CERTIFICATE_ELEMENTS.filter(
    (key): key is Exclude<CertificateElement, "name"> => key !== "name" && hidden.has(key),
  );
}

export function normalizeCertificateDraft(draft: CertificateDraft): CertificateDraft {
  return {
    ...draft,
    orientation: draft.orientation ?? "landscape",
    showText: true,
    hiddenElements: hiddenCertificateElements(draft),
  };
}

/** Тот же перенос и поиск размера, что у PDF renderer. measure возвращает ширину Mont 1000px. */
export function fitCertificateText(
  value: string,
  box: CertificateBox,
  measure: (text: string) => number,
  orientation: CertificateDraft["orientation"] = "landscape",
): { fontSize: number; lines: string[] } {
  const page = certificatePage(orientation);
  const width = Math.max(1, (box.width * page.widthPx) / 100 - 2),
    height = Math.max(1, (box.height * page.heightPx) / 100 - 2);
  const linesAt = (size: number): string[] => {
    const fits = (text: string) => (measure(text) / 1000) * size * 1.02 <= width;
    const lines: string[] = [];
    for (const paragraph of value.split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const candidate = (line + " " + word).trimStart();
        if (fits(candidate)) {
          line = candidate;
          continue;
        }
        if (line) {
          lines.push(line);
          line = "";
        }
        for (const char of Array.from(word)) {
          if (line && !fits(line + char)) {
            lines.push(line);
            line = "";
          }
          line += char;
        }
      }
      lines.push(line);
    }
    return lines;
  };
  let low = 0.5,
    high = box.fontSize;
  for (let i = 0; i < 18; i++) {
    const size = (low + high) / 2;
    if (linesAt(size).length * size * 1.3 <= height) low = size;
    else high = size;
  }
  return { fontSize: Math.min(box.fontSize, low), lines: linesAt(low) };
}
