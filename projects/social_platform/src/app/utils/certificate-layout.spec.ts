/** @format */
import { describe, expect, it } from "vitest";
import { moveCertificateBox, resizeCertificateBox } from "./certificate-layout";
const box = { x: 10, y: 20, width: 30, height: 15, fontSize: 18 };
describe("Certificate layout geometry", () => {
  it("keeps dragged elements inside the page at every edge", () => {
    expect(moveCertificateBox(box, -100, -100)).toMatchObject({ x: 0, y: 0 });
    expect(moveCertificateBox(box, 100, 100)).toMatchObject({ x: 70, y: 85 });
  });
  it("snaps near the center without changing its size", () => {
    expect(moveCertificateBox(box, 24.5, 0)).toEqual({ ...box, x: 35 });
  });
  it("preserves the actual signature ratio on landscape A4", () => {
    const resized = resizeCertificateBox(box, 20, 80, 3);
    expect((resized.width * (297 / 210)) / resized.height).toBeCloseTo(3);
    expect(resized.height + resized.y).toBeLessThanOrEqual(100);
  });
  it("limits a tall signature by remaining height without stretching", () => {
    const resized = resizeCertificateBox({ ...box, y: 80 }, 100, 0, 0.5);
    expect(resized.height).toBe(20);
    expect((resized.width * (297 / 210)) / resized.height).toBeCloseTo(0.5);
  });
  it("clamps text resizing and never mutates the saved layout", () => {
    expect(resizeCertificateBox(box, -100, -100)).toMatchObject({ width: 2, height: 1 });
    expect(box).toEqual({ x: 10, y: 20, width: 30, height: 15, fontSize: 18 });
  });
});
