/** @format */
import { describe, expect, it } from "vitest";
import {
  fitCertificateText,
  moveCertificateBox,
  resizeCertificateBox,
  sizeCertificateText,
} from "./certificate-layout";
const box = { x: 10, y: 20, width: 30, height: 15, fontSize: 18 };
describe("Certificate layout geometry", () => {
  it("makes a requested size visible in both orientations and keeps the grown box on the sheet", () => {
    const value = "Александра Константиновна Добровольская";
    const measure = (text: string) => Array.from(text).length * 550;
    for (const orientation of ["portrait", "landscape"] as const) {
      const resized = sizeCertificateText(
        value,
        { ...box, y: 98, height: 2, width: 80 },
        48,
        measure,
        orientation,
      );
      expect(resized.y + resized.height).toBeLessThanOrEqual(100);
      expect(fitCertificateText(value, resized, measure, orientation).fontSize).toBeCloseTo(48, 2);
    }
  });
  it("keeps dragged elements inside the page at every edge", () => {
    expect(moveCertificateBox(box, -100, -100)).toMatchObject({ x: 0, y: 0 });
    expect(moveCertificateBox(box, 100, 100)).toMatchObject({ x: 70, y: 85 });
  });
  it("snaps near the center without changing its size", () => {
    expect(moveCertificateBox(box, 24.5, 0)).toEqual({ ...box, x: 35 });
  });
  it("lets keyboard movement leave the center and snaps a drag to the vertical center", () => {
    expect(moveCertificateBox({ ...box, x: 35, y: 42.5 }, 0.25, 0.25, false)).toMatchObject({
      x: 35.25,
      y: 42.75,
    });
    expect(moveCertificateBox(box, 0, 22)).toMatchObject({ y: 42.5 });
  });
  it("fits a long name by actual line height rather than clipping its second line", () => {
    const value = "Александра Константиновна Добровольская";
    const fitted = fitCertificateText(
      value,
      { ...box, width: 70, height: 12, fontSize: 40 },
      text => Array.from(text).length * 550,
    );
    expect(fitted.lines.join(" ")).toBe(value);
    expect(fitted.lines.length * fitted.fontSize * 1.3).toBeLessThanOrEqual(12 * 7.937 - 2);
    for (const line of fitted.lines)
      expect(line.length * 0.55 * fitted.fontSize * 1.02).toBeLessThanOrEqual(70 * 11.22 - 2);
  });
  it("preserves the actual signature ratio on landscape A4", () => {
    const resized = resizeCertificateBox(box, 20, 80, 3);
    expect((resized.width * (297 / 210)) / resized.height).toBeCloseTo(3);
    expect(resized.height + resized.y).toBeLessThanOrEqual(100);
  });
  it("preserves signature proportions and page bounds on portrait A4", () => {
    const resized = resizeCertificateBox(box, 20, 80, 3, "portrait");
    expect((resized.width * (210 / 297)) / resized.height).toBeCloseTo(3);
    expect(resized.height + resized.y).toBeLessThanOrEqual(100);
    expect(resized.width + resized.x).toBeLessThanOrEqual(100);
  });
  it("fits a long name into portrait A4 using the portrait dimensions", () => {
    const value = "Александра Константиновна Добровольская";
    const fitted = fitCertificateText(
      value,
      { ...box, width: 70, height: 12, fontSize: 40 },
      text => Array.from(text).length * 550,
      "portrait",
    );
    expect(fitted.lines.join(" ")).toBe(value);
    expect(fitted.lines.length * fitted.fontSize * 1.3).toBeLessThanOrEqual(12 * 11.22 - 2);
    for (const line of fitted.lines)
      expect(line.length * 0.55 * fitted.fontSize * 1.02).toBeLessThanOrEqual(70 * 7.937 - 2);
  });
  it("limits a tall signature by remaining height without stretching", () => {
    const resized = resizeCertificateBox({ ...box, y: 80 }, 100, 0, 0.5);
    expect(resized.height).toBe(20);
    expect((resized.width * (297 / 210)) / resized.height).toBeCloseTo(0.5);
  });
  it("resizes a signature vertically as well as horizontally", () => {
    const initial = resizeCertificateBox(box, 0, 0, 3);
    const resized = resizeCertificateBox(initial, 0, 2, 3);
    expect(resized.height).toBeCloseTo(initial.height + 2);
    expect((resized.width * (297 / 210)) / resized.height).toBeCloseTo(3);
  });
  it("keeps extreme signature ratios valid for the API while the image uses contain", () => {
    for (const ratio of [0.005, 200]) {
      const resized = resizeCertificateBox(box, 0, 0, ratio);
      expect(resized.width).toBeGreaterThanOrEqual(2);
      expect(resized.height).toBeGreaterThanOrEqual(1);
      expect(resized.x + resized.width).toBeLessThanOrEqual(100);
      expect(resized.y + resized.height).toBeLessThanOrEqual(100);
    }
  });
  it("clamps text resizing and never mutates the saved layout", () => {
    expect(resizeCertificateBox(box, -100, -100)).toMatchObject({ width: 2, height: 1 });
    expect(box).toEqual({ x: 10, y: 20, width: 30, height: 15, fontSize: 18 });
  });
});
