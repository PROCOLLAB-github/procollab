/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { mapInviteSendError } from "./map-invite-send-error";

describe("mapInviteSendError", () => {
  it.each([
    [
      "Пользователь уже является лидером проекта.",
      "already_leader",
      "Вы уже являетесь руководителем этого проекта.",
    ],
    [
      "Пользователь уже состоит в проекте.",
      "already_member",
      "Пользователь уже состоит в команде проекта.",
    ],
    [
      "У пользователя уже есть активное приглашение в этот проект.",
      "already_invited",
      "Этому пользователю уже отправлено приглашение.",
    ],
    [
      "Нельзя пригласить пользователя: проект относится к программе, а пользователь не является её участником.",
      "not_program_participant",
      "Пригласить можно только участника этой программы.",
    ],
    [
      'Invalid pk "999" - object does not exist.',
      "user_not_found",
      "Пользователь не найден. Проверьте ссылку на профиль.",
    ],
    [
      'Недопустимый первичный ключ "999" - объект не существует.',
      "user_not_found",
      "Пользователь не найден. Проверьте ссылку на профиль.",
    ],
  ])("maps expected user validation: %s", (message, kind, text) => {
    const result = mapInviteSendError(
      new HttpErrorResponse({ status: 400, error: { user: [message] } }),
    );
    expect(result).toEqual({ kind, message: text });
    expect(result).not.toHaveProperty("cause");
  });

  it.each([
    [401, "unauthorized", "Сессия истекла. Войдите в аккаунт снова."],
    [403, "forbidden", "Только руководитель проекта может приглашать участников."],
    [400, "validation", "Не удалось отправить приглашение. Проверьте данные и попробуйте ещё раз."],
    [422, "validation", "Не удалось отправить приглашение. Проверьте данные и попробуйте ещё раз."],
    [0, "network", "Не удалось отправить приглашение. Проверьте подключение и попробуйте ещё раз."],
    [500, "server", "Не удалось отправить приглашение. Попробуйте ещё раз позже."],
    [503, "server", "Не удалось отправить приглашение. Попробуйте ещё раз позже."],
    [404, "unknown", "Не удалось отправить приглашение. Попробуйте ещё раз позже."],
  ])("status %s ignores arbitrary backend body", (status, kind, message) => {
    expect(mapInviteSendError(new HttpErrorResponse({ status, error: "error" }))).toEqual({
      kind,
      message,
    });
  });

  it.each([
    { role: ["Ensure this field has no more than 100 characters."] },
    { specialization: ["Invalid pk - object does not exist."] },
    { user: ["Unknown English DRF error."] },
    { user: { nested: "Пользователь уже состоит в проекте." } },
    null,
  ])("unknown validation stays controlled: %j", error => {
    expect(mapInviteSendError(new HttpErrorResponse({ status: 400, error }))).toEqual({
      kind: "validation",
      message: "Не удалось отправить приглашение. Проверьте данные и попробуйте ещё раз.",
    });
  });

  it("does not interpret expected validation text in a server error", () => {
    expect(
      mapInviteSendError(
        new HttpErrorResponse({
          status: 500,
          error: { user: ["Пользователь уже состоит в проекте."] },
        }),
      ).kind,
    ).toBe("server");
  });

  it.each([new Error("raw sensitive error"), undefined, {}, "error"])(
    "unknown error is safe",
    error => {
      expect(mapInviteSendError(error)).toEqual({
        kind: "unknown",
        message: "Не удалось отправить приглашение. Попробуйте ещё раз позже.",
      });
    },
  );
});
