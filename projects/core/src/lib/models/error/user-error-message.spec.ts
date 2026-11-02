/** @format */

import { userErrorMessage } from "./user-error-message";

describe("userErrorMessage", () => {
  const fallback = "Проверьте заполненные поля.";

  it.each([
    [
      "We couldn't find an account associated with that email. Please try a different e-mail address.",
      "Аккаунт с этой почтой не найден. Проверьте адрес электронной почты.",
    ],
    ["This field is required.", "Заполните обязательное поле."],
    ["This field may not be blank.", "Поле не должно быть пустым."],
    ["Enter a valid email address.", "Введите корректный адрес электронной почты."],
    ["No active account found with the given credentials", "Неверная почта или пароль."],
    [
      "Ensure this field has no more than 255 characters.",
      "Максимальное количество символов: 255.",
    ],
    ["Ensure this field has at least 8 characters.", "Минимальное количество символов: 8."],
    ["Ensure this value is greater than or equal to 0.", "Значение должно быть не меньше 0."],
    ["Ensure this value is less than or equal to 10.5.", "Значение должно быть не больше 10.5."],
  ])("переводит сообщение API: %s", (message, expected) => {
    expect(userErrorMessage(message, fallback)).toBe(expected);
  });

  it.each([
    undefined,
    null,
    0,
    false,
    {},
    "",
    "Unexpected server failure",
    "Project «Город» is unavailable.",
  ])("показывает русское пояснение вместо неизвестного ответа: %s", message =>
    expect(userErrorMessage(message, fallback)).toBe(fallback),
  );

  it("сохраняет русское пояснение и пользовательские названия, адреса и ссылки", () => {
    const message =
      "Не найден проект «Ёж Solution» для expert@example.test. Ссылка: https://example.test/file.pdf";
    expect(userErrorMessage(message, fallback)).toBe(message);
  });

  it("обрабатывает массив ошибок без объектов и повторяющихся технических сообщений", () => {
    expect(
      userErrorMessage(
        ["This field is required.", "Unexpected error", "Another error", {}],
        fallback,
      ),
    ).toBe(`Заполните обязательное поле. ${fallback}`);
  });
});
