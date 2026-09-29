/** @format */

import { HttpErrorResponse } from "@angular/common/http";

const messages: Record<string, string> = {
  team_frozen: "Состав команды зафиксирован после сдачи проекта.",
  already_in_program_team: "Пользователь уже состоит в другой команде этой программы.",
  team_min_size: "Для сдачи проекта в команде недостаточно участников.",
  team_max_size: "В команде нет свободных мест. Ожидающие приглашения резервируют места.",
  program_context_required: "У проекта несколько программ. Откройте проект из нужной программы.",
  invalid_program_context: "Контекст программы изменился. Обновите страницу проекта.",
  not_program_member: "Участник должен быть зарегистрирован в программе.",
  duplicate_pending_invite: "Этому пользователю уже отправлено приглашение.",
  invite_already_processed: "Приглашение уже обработано. Обновите список приглашений.",
  not_project_team_manager: "Управлять командой может только руководитель проекта.",
  leader_cannot_leave: "Перед выходом передайте права руководителя другому участнику.",
  collaborator_not_found: "Участник уже отсутствует в команде. Обновите страницу.",
  already_project_member: "Пользователь уже состоит в команде проекта.",
  already_project_leader: "Пользователь уже является руководителем проекта.",
};

/** Выводим только известные коды; произвольный ответ сервера не попадает в UI. */
export function teamOperationErrorMessage(error: unknown): string | undefined {
  if (!(error instanceof HttpErrorResponse) || ![403, 409, 422].includes(error.status)) {
    return undefined;
  }
  const code: unknown = error.error?.code;
  return typeof code === "string" && Object.prototype.hasOwnProperty.call(messages, code)
    ? messages[code]
    : undefined;
}
