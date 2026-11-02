/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import {
  resetPasswordErrorMessage,
  setPasswordError,
  setPasswordErrorMessage,
} from "./password-error";

describe("Ошибки установки и сброса пароля", () => {
  it.each([404, 410])("отказ %s по ссылке не превращается в ошибку логина", status => {
    const error = setPasswordError(
      new HttpErrorResponse({ status, error: { detail: "Test-only invalid reset link" } }),
    );
    expect(error).toEqual({ kind: "invalid_token" });
    expect(setPasswordErrorMessage(error)).toBe(
      "Ссылка восстановления недействительна или истекла. Запросите новую ссылку.",
    );
  });
  it("отличает валидацию одноразовой ссылки от требований к новому паролю", () => {
    expect(
      setPasswordError(
        new HttpErrorResponse({ status: 400, error: { token: ["This field may not be blank."] } }),
      ),
    ).toEqual({ kind: "invalid_token" });
    const error = setPasswordError(
      new HttpErrorResponse({
        status: 400,
        error: {
          password: [
            "This password is too short. It must contain at least 12 characters.",
            "This password is too common.",
          ],
        },
      }),
    );
    expect(error).toEqual({
      kind: "validation_error",
      messages: [
        "Пароль должен содержать не менее 12 символов. Этот пароль слишком распространен. Придумайте другой.",
      ],
    });
  });
  it.each([0, 400, 401, 403, 404, 410, 422, 500, 503])(
    "не называет сбой сброса %s неправильным логином или паролем",
    status => {
      const error = setPasswordError(new HttpErrorResponse({ status }));
      expect(setPasswordErrorMessage(error)).not.toMatch(/неправильный логин|неверный пароль/i);
      expect(setPasswordErrorMessage(error)).toMatch(/[А-Яа-я]/);
    },
  );
  it("не переносит тело HTTP-ошибки с секретными полями в состояние формы", () => {
    const error = setPasswordError(
      new HttpErrorResponse({
        status: 404,
        error: {
          password: "unit-only-sensitive-value",
          token: "unit-only-sensitive-token",
        },
      }),
    );
    expect(JSON.stringify(error)).not.toContain("unit-only-sensitive");
  });
  it("ошибка сервера запроса письма не объявляет аккаунт незарегистрированным", () => {
    expect(resetPasswordErrorMessage({ kind: "server_error", status: 500 })).toBe(
      "Не удалось отправить письмо. Попробуйте позже.",
    );
  });
});
