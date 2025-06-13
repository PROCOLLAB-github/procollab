/** @format */

export const transformYearStringToNumber = (value: string) => {
  const yearString = value.toString().slice(0, 5);
  return Number(yearString);
};
