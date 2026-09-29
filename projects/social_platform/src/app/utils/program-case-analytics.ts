/** @format */
import { saveAs } from "file-saver";
import {
  ProgramCaseError,
  ProgramCaseSelection,
} from "@domain/program/program-case-analytics.model";
import { analyticsRequestError } from "./program-analytics-assignment";

export function caseErrorMessage(error: ProgramCaseError | null): string {
  if (error?.kind === "unsupported")
    return "Детализация кейсов пока недоступна на сервере. Обновите страницу позже.";
  if (error?.kind === "invalid")
    return "Настройки кейса изменились. Закройте детализацию и обновите аналитику.";
  if (error?.kind === "not_found") return "Программа не найдена.";
  return analyticsRequestError(error ? { kind: error.kind } : null);
}

export function presentationHref(address: string | null): string | null {
  if (!address) return null;
  try {
    const url = new URL(address);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

/** Тот же base_name и NFKD sanitation, что у backend build_case_projects_export_file. */
export function caseExportFilename(
  programName: string,
  selection: ProgramCaseSelection,
  date = new Date(),
): string {
  const scope =
    selection.scope === "all"
      ? "all_cases"
      : selection.scope === "without_case"
        ? "without_case"
        : `case - ${selection.caseName}`;
  const day = date.toISOString().slice(0, 10).split("-").reverse();
  day[2] = day[2].slice(-2);
  const base = `projects_${scope} - ${programName || "program"} - ${day.join(".")}`;
  return (
    base
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N} ._-]/gu, "")
      .replace(/\s+/g, " ")
      .trim() + ".xlsx"
  );
}

export function saveCaseProjects(
  blob: Blob,
  programName: string,
  selection: ProgramCaseSelection,
): void {
  saveAs(blob, caseExportFilename(programName, selection));
}
