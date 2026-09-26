/** @format */
/** Каноническая строка поиска: пробелы не меняют результат и не создают повторные запросы. */
export function normalizeMemberSearch(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}
