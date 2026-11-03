/** @format */
import { ExpertRow } from "@domain/program/evaluation-workspace.model";

export function expertDialogBodyClass(kind: string | null): string {
  const variant =
    kind === "invite" || kind === "quota" || kind === "revoke"
      ? "compact"
      : kind === "scope"
        ? "scope"
        : kind === "project" || kind === "assignments"
          ? "assignments"
          : "wide";
  return `modal__body--no-flex experts-modal experts-modal--${variant}`;
}

export function expertStatusLabel(row: ExpertRow): string {
  if (row.status === "joined") return "Доступ предоставлен";
  if (row.status === "expired") return "Приглашение истекло";
  if (row.status === "revoked") return "Приглашение отозвано";
  return "Ожидает принятия";
}
export function expertStatusDescription(row: ExpertRow, assignmentLabel = "Проекты"): string {
  return row.status === "joined"
    ? `Эксперт добавлен в программу. ${assignmentLabel} для оценки назначаются отдельно.`
    : row.status === "pending"
      ? "Эксперт еще не принял приглашение. Статус отправки письма указан ниже."
      : row.status === "expired"
        ? "Срок приглашения истек. Его можно отправить повторно через меню действий."
        : "Приглашение отозвано организатором.";
}
export function expertDeliveryLabel(row: ExpertRow): string {
  if (row.status !== "pending") return "";
  if (row.deliveryStatus === "failed") return "Не удалось отправить письмо";
  if (row.deliveryStatus === "queued") return "Письмо в очереди";
  if (row.deliveryStatus === "sent") return "Письмо отправлено · ждем принятия";
  return "Статус отправки неизвестен";
}
export function expertInitials(row: ExpertRow): string {
  return (row.name || row.email)
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase();
}
export function expertScopeLabel(row: ExpertRow): string {
  return (row.allCases ?? true)
    ? "Все кейсы"
    : row.caseNames?.length
      ? row.caseNames.map(name => name ?? "Без выбранного кейса").join(", ")
      : "Кейсы не выбраны";
}
