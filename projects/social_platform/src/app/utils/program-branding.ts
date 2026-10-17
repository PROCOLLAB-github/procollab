/** @format */

import {
  ProgramImageFrame,
  ProgramImageFraming,
  ProgramImageKey,
} from "@domain/program/program-image-framing.model";

export const PROGRAM_LOGO_SIZES = { desktop: 123, mobile: 105 } as const;
export const PROGRAM_DEFAULT_COVER = "/assets/images/office/profile/detail/cover.png";

export const DEFAULT_IMAGE_FRAME: Readonly<ProgramImageFrame> = { x: 50, y: 50, zoom: 1 };

export function programImageFraming(
  value?: ProgramImageFraming | null,
): Record<ProgramImageKey, ProgramImageFrame> {
  return {
    cover: { ...DEFAULT_IMAGE_FRAME, ...value?.cover },
    mobileCover: { ...DEFAULT_IMAGE_FRAME, ...value?.mobileCover },
    logo: { ...DEFAULT_IMAGE_FRAME, ...value?.logo },
  };
}
