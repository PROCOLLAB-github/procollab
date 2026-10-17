/** @format */

export interface ProgramImageFrame {
  x: number;
  y: number;
  zoom: number;
}
export type ProgramImageKey = "cover" | "mobileCover" | "logo";
export type ProgramImageFraming = Partial<Record<ProgramImageKey, ProgramImageFrame>>;
