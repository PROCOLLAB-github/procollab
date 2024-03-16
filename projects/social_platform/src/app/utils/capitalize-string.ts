/** @format */

export function capitalizeString(string: string): string {
  const stringArray = string.split(" ");
  if (stringArray.length === 1) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  return stringArray
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
