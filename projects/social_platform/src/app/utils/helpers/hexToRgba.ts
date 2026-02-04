/** @format */

export const hexToRgba = (hex: string, alpha: number): string => {
  const [r, g, b] = hex
    .replace(/^#/, "")
    .match(/.{1,2}/g)!
    .map(x => parseInt(x, 16));

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
