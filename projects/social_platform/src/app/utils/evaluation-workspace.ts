/** @format */
import { HttpErrorResponse } from "@angular/common/http";
export function evaluationError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 403) return "У вас нет доступа к этому разделу.";
    if (error.status === 410)
      return "Приглашение истекло или отозвано. Попросите организатора отправить новое.";
    if (error.status === 404) return "Приглашение или программа не найдены.";
    const detail = error.error?.detail ?? error.error?.email ?? error.error?.nonFieldErrors;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.join(" ");
    if (error.status === 400 && error.error && typeof error.error === "object") {
      const messages = Object.values(error.error).flatMap(value =>
        typeof value === "string"
          ? [value]
          : Array.isArray(value)
            ? value.filter(v => typeof v === "string")
            : [],
      );
      if (messages.length) return messages.join(" ");
    }
    if (error.status === 409) return "Данные изменились. Обновите список и повторите действие.";
    if (error.status === 400) return "Проверьте заполненные поля и повторите действие.";
  }
  return "Не удалось выполнить действие. Попробуйте ещё раз.";
}
export function expertInvitationReturn(value: string | null | undefined): string | null {
  return value && /^\/expert-invitation\/[A-Za-z0-9_-]{20,100}$/.test(value) ? value : null;
}
