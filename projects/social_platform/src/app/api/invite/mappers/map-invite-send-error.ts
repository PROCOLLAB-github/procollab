/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { InviteSendError } from "@domain/invite/invite-send-error";

const messages: Record<InviteSendError["kind"], string> = {
  user_not_found: "Пользователь не найден. Проверьте ссылку на профиль.",
  already_leader: "Вы уже являетесь руководителем этого проекта.",
  already_member: "Пользователь уже состоит в команде проекта.",
  already_invited: "Этому пользователю уже отправлено приглашение.",
  not_program_participant: "Пригласить можно только участника этой программы.",
  unauthorized: "Сессия истекла. Войдите в аккаунт снова.",
  forbidden: "Только руководитель проекта может приглашать участников.",
  validation: "Не удалось отправить приглашение. Проверьте данные и попробуйте ещё раз.",
  network: "Не удалось отправить приглашение. Проверьте подключение и попробуйте ещё раз.",
  server: "Не удалось отправить приглашение. Попробуйте ещё раз позже.",
  unknown: "Не удалось отправить приглашение. Попробуйте ещё раз позже.",
};

const userErrors = new Map<string, InviteSendError["kind"]>([
  ["Пользователь уже является лидером проекта.", "already_leader"],
  ["Пользователь уже состоит в проекте.", "already_member"],
  ["У пользователя уже есть активное приглашение в этот проект.", "already_invited"],
  [
    "Нельзя пригласить пользователя: проект относится к программе, а пользователь не является её участником.",
    "not_program_participant",
  ],
]);

function mapped(kind: InviteSendError["kind"]): InviteSendError {
  return { kind, message: messages[kind] };
}

/** Recognizes only expected user validation errors; all other bodies stay private. */
export function mapInviteSendError(error: unknown): InviteSendError {
  if (!(error instanceof HttpErrorResponse)) return mapped("unknown");
  if (error.status === 0) return mapped("network");
  if (error.status === 401) return mapped("unauthorized");
  if (error.status === 403) return mapped("forbidden");
  if (error.status >= 500) return mapped("server");
  if (error.status !== 400 && error.status !== 422) return mapped("unknown");

  const body: unknown = error.error;
  const user = body && typeof body === "object" && "user" in body ? body.user : undefined;
  if (Array.isArray(user)) {
    for (const message of user) {
      if (typeof message !== "string") continue;
      const kind = userErrors.get(message);
      if (kind) return mapped(kind);
      // DRF PrimaryKeyRelatedField, English and Russian translations, user field only.
      if (
        /invalid pk|object does not exist|недопустимый первичный ключ|объект.*не существует/i.test(
          message,
        )
      ) {
        return mapped("user_not_found");
      }
    }
  }
  return mapped("validation");
}
