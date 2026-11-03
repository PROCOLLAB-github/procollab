/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { userErrorMessage } from "@core/lib/models/error/user-error-message";
import { PasswordError } from "@domain/auth/results/password.result";

const PASSWORD_VALIDATION_MESSAGE =
  "Пароль не соответствует требованиям. Проверьте его и повторите попытку.";

export function setPasswordError(error: unknown): PasswordError {
  if (!(error instanceof HttpErrorResponse)) return { kind: "unknown", cause: error };
  if (error.status === 0) return { kind: "network", status: 0, cause: "unknown" };
  if (error.status >= 500) return { kind: "server_error", status: 500 };

  const body = error.error && typeof error.error === "object" ? error.error : {};
  if (
    error.status === 404 ||
    error.status === 410 ||
    typeof body.token === "string" ||
    Array.isArray(body.token)
  )
    return { kind: "invalid_token" };

  const passwordErrors = body.password ?? body.newPassword ?? body.new_password;
  if (typeof passwordErrors === "string" || Array.isArray(passwordErrors)) {
    return {
      kind: "validation_error",
      messages: [userErrorMessage(passwordErrors, PASSWORD_VALIDATION_MESSAGE)],
    };
  }
  if (error.status === 400 || error.status === 422) return { kind: "bad_request", status: 400 };
  return { kind: "unknown" };
}

export function setPasswordErrorMessage(error: PasswordError): string {
  switch (error.kind) {
    case "invalid_token":
      return "Ссылка восстановления недействительна или истекла. Запросите новую ссылку.";
    case "validation_error":
      return error.messages.join(" ") || PASSWORD_VALIDATION_MESSAGE;
    case "network":
      return "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.";
    case "server_error":
      return "Не удалось сохранить новый пароль. Попробуйте позже.";
    case "bad_request":
      return "Не удалось установить новый пароль. Проверьте ссылку восстановления и требования к паролю.";
    default:
      return "Не удалось установить новый пароль. Повторите попытку или запросите новую ссылку.";
  }
}

export function resetPasswordErrorMessage(error: PasswordError): string {
  if (error.kind === "network")
    return "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.";
  if (error.kind === "bad_request")
    return "Не удалось отправить письмо. Проверьте адрес электронной почты.";
  return "Не удалось отправить письмо. Попробуйте позже.";
}
