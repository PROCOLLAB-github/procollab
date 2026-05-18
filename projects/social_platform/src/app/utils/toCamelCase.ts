/** @format */

export const toCamelCase = (text: string) => {
  return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
};
