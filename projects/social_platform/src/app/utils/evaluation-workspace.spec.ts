/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { evaluationError } from "./evaluation-workspace";

describe("evaluationError", () => {
  it("локализует реальный ответ восстановления пароля из приглашения", () => {
    const body = {
      detail:
        "We couldn't find an account associated with that email. Please try a different e-mail address.",
      code: "account_not_found",
    };
    expect(evaluationError(new HttpErrorResponse({ status: 400, error: body }))).toBe(
      "Аккаунт с этой почтой не найден. Проверьте адрес электронной почты.",
    );
    expect(body.code).toBe("account_not_found");
    expect(body.detail).toContain("We couldn't");
  });

  it("локализует ошибки email и неизвестные поля, сохраняя русский серверный текст", () => {
    expect(
      evaluationError(
        new HttpErrorResponse({ status: 400, error: { email: ["Enter a valid email address."] } }),
      ),
    ).toBe("Введите корректный адрес электронной почты.");
    expect(
      evaluationError(
        new HttpErrorResponse({ status: 400, error: { field: ["Unexpected validation failure"] } }),
      ),
    ).toBe("Проверьте заполненные поля и повторите действие.");
    expect(
      evaluationError(
        new HttpErrorResponse({ status: 409, error: { detail: "Оценка уже сохранена." } }),
      ),
    ).toBe("Оценка уже сохранена.");
  });

  it("не показывает английский конфликт и сохраняет пояснение о перечитывании данных", () => {
    expect(
      evaluationError(
        new HttpErrorResponse({ status: 409, error: { detail: "Revision is stale" } }),
      ),
    ).toBe("Данные изменились. Обновите список и повторите действие.");
  });
});
