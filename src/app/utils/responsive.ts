/** @format */

export const containerSm = 680;
export const containerMd = 1280;

export const calcAppHeight = (): void => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
};
