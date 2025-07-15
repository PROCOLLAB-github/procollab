/** @format */

export const stripNullish = <T extends object>(obj: T): Partial<T> =>
  (Object.entries(obj) as [keyof T, any][])
    .filter(([_, v]) => {
      if (v == null) return false;
      if (typeof v === "string" && v.trim() === "") return false;
      return true;
    })
    .reduce((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {} as Partial<T>);
