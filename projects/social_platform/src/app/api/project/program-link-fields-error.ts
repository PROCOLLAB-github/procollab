/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { ProgramLinkFieldsError } from "@domain/project/program-link-fields.model";

export function mapProgramLinkFieldsError(cause: unknown): ProgramLinkFieldsError {
  if (cause instanceof HttpErrorResponse) {
    if (cause.status === 0) return { kind: "network", cause };
    if (cause.status >= 500) return { kind: "server", cause };
    if (cause.status === 400) {
      if (cause.error?.detail === "Срок подачи проектов в программу завершён.") {
        return { kind: "submission_closed", cause };
      }
      if (
        cause.error?.detail === "Проект уже был сдан на проверку." ||
        cause.error?.detail ===
          "Нельзя изменять значения полей программы после сдачи проекта на проверку."
      ) {
        return { kind: "already_submitted", cause };
      }
      if (cause.error?.detail === "Программа не является конкурсной.") {
        return { kind: "not_competitive", cause };
      }
      if (cause.error?.detail === "Выберите кейс перед сдачей проекта.") {
        return { kind: "case_required", cause };
      }
      if (cause.error?.detail === "Выбранный кейс больше недоступен. Выберите актуальный кейс.") {
        return { kind: "case_unavailable", cause };
      }
    }
  }
  return { kind: "unknown", cause };
}

export function programLinkFieldsErrorMessage(error: ProgramLinkFieldsError): string {
  switch (error.kind) {
    case "submission_closed":
      return "Срок подачи проектов в программу завершён.";
    case "already_submitted":
      return "Проект уже был сдан на проверку.";
    case "not_competitive":
      return "Программа не является конкурсной. Сдача на проверку не требуется.";
    case "case_required":
      return "Выберите кейс перед сдачей проекта.";
    case "case_unavailable":
      return "Выбранный кейс больше недоступен. Выберите актуальный кейс.";
    case "network":
      return "Не удалось сохранить данные. Проверьте подключение и попробуйте ещё раз.";
    case "server":
      return "Не удалось сохранить дополнительные сведения. Попробуйте ещё раз позже.";
    default:
      return "Не удалось сохранить дополнительные сведения. Попробуйте ещё раз.";
  }
}
