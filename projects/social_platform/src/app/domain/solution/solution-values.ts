/** @format */

export function hasSolutionAnswer(value: unknown): boolean {
  return value !== null && value !== undefined && !(typeof value === "string" && !value.trim());
}
