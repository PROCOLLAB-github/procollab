/** @format */
import {
  ProgramAnalyticsAssignment,
  ProgramAnalyticsAssignmentCriterion,
  ProgramAnalyticsAssignmentStatus,
  ProgramAnalyticsError,
} from "@domain/program/program-analytics.model";

/** Отображение authoritative статуса; UI не выводит статус из критериев или SLA. */
export const assignmentStatusLabels: Record<ProgramAnalyticsAssignmentStatus, string> = {
  not_ready: "Проект не сдан",
  pending: "Не начал оценивание",
  in_progress: "В процессе",
  completed: "Выполнено",
};

/** Backend фиксирует waitingSeconds на момент запроса; здесь только дни/часы, без таймера. */
export function formatAssignmentWaiting(
  seconds: number | null,
  status?: ProgramAnalyticsAssignmentStatus,
): string {
  if (seconds === null)
    return status === "not_ready" ? "Проект не сдан" : status === "completed" ? "—" : "Нет данных";
  const hours = Math.floor(seconds / 3600);
  if (hours < 1) return "< 1 ч";
  if (hours < 24) return `${hours} ч`;
  return `${Math.floor(hours / 24)} д ${hours % 24} ч`;
}

export function assignmentProgress(assignment: ProgramAnalyticsAssignment): string {
  if (assignment.status === "not_ready") return "—";
  if (!assignment.criteriaTotal) return "Нет критериев";
  return `${assignment.criteriaScored} из ${assignment.criteriaTotal} критериев`;
}

/** Наличие записи и её содержимое — разные состояния; числовые строки не агрегируются. */
export function assignmentCriterionValue(criterion: ProgramAnalyticsAssignmentCriterion): string {
  if (!criterion.isScored) return "Не оценено";
  if (criterion.value === null || criterion.value === "") return "Пустое значение";
  if (criterion.type === "bool") {
    if (criterion.value.toLowerCase() === "true") return "Да";
    if (criterion.value.toLowerCase() === "false") return "Нет";
  }
  return criterion.value;
}

/** Только контролируемые сообщения — никакой сырой backend/network ошибки в UI. */
export function analyticsRequestError(error: ProgramAnalyticsError | null): string {
  switch (error?.kind) {
    case "unauthorized":
      return "Авторизуйтесь заново, чтобы продолжить.";
    case "forbidden":
      return "У вас нет доступа к этим данным программы.";
    case "not_found":
      return "Программа или назначение не найдены.";
    default:
      return "Проверьте соединение и повторите попытку.";
  }
}
