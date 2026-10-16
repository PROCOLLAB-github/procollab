/** @format */
import { normalizeMemberSearch } from "./member-search";

export const MEMBER_FILTER_KEYS = [
  "fullname",
  "skills__contains",
  "speciality__icontains",
  "age",
  "is_mospolytech_student",
] as const;

/** Один контракт URL для resolver, формы и пагинации. Неизвестные параметры не уходят в API. */
export function memberFiltersFromUrl(params: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of MEMBER_FILTER_KEYS.slice(0, 3)) {
    const value = normalizeMemberSearch(params[key]);
    if (value) result[key] = value;
  }
  const age = params["age"];
  if (typeof age === "string" && /^\d+,\d+$/.test(age)) {
    const [min, max] = age.split(",").map(Number);
    if (Number.isSafeInteger(min) && Number.isSafeInteger(max) && min <= max) {
      result["age"] = `${min},${max}`;
    }
  }
  const student = params["is_mospolytech_student"];
  if (student === "true" || student === "false") result["is_mospolytech_student"] = student;
  return result;
}

export function memberFiltersKey(params: Record<string, string>): string {
  return JSON.stringify(MEMBER_FILTER_KEYS.map(key => params[key] ?? null));
}

/** null удаляет ключ при queryParamsHandling: merge, сохраняя чужие параметры URL. */
export function memberFilterQueryParams(
  params: Record<string, string>,
): Record<string, string | null> {
  return Object.fromEntries(MEMBER_FILTER_KEYS.map(key => [key, params[key] ?? null]));
}
