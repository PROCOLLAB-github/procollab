/** @format */

import { ManagementProject } from "@domain/program/program-management.model";

export function evaluationLabel(project: ManagementProject): string {
  switch (project.evaluationStatus) {
    case "evaluated":
      return "Оценено";
    case "partially_evaluated":
      return `Частично · ${project.assignmentsCompleted}/${project.assignmentsTotal}`;
    case "awaiting_evaluation":
      return "Не оценено";
    case "not_applicable":
      return "Не применяется";
    default:
      return "—";
  }
}

/** datetime-local не содержит зоны; календарь программы явно работает по Москве. */
export function toMoscowInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isFinite(date.valueOf())
    ? new Date(date.valueOf() + 3 * 3600_000).toISOString().slice(0, 16)
    : "";
}
export function fromMoscowInput(value: string): string | null {
  return value ? new Date(`${value}:00+03:00`).toISOString() : null;
}
