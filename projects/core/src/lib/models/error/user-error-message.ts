/** @format */

const DEFAULT_MESSAGE = "Не удалось выполнить действие. Попробуйте еще раз.";

const TRANSLATIONS: ReadonlyArray<readonly [RegExp, string]> = [
  [
    /^we couldn['’]t find an account associated with (?:that|this) e-?mail\..*$/i,
    "Аккаунт с этой почтой не найден. Проверьте адрес электронной почты.",
  ],
  [/^this field is required\.?$/i, "Заполните обязательное поле."],
  [/^this field may not be (?:blank|null)\.?$/i, "Поле не должно быть пустым."],
  [
    /^(?:enter a valid|invalid) e-?mail(?: address)?\.?$/i,
    "Введите корректный адрес электронной почты.",
  ],
  [
    /^(?:a user with (?:that|this) (?:e-?mail|e-?mail address) already exists|a user is already registered with this e-?mail address)\.?$/i,
    "Аккаунт с этой почтой уже зарегистрирован.",
  ],
  [
    /^(?:no active account found with the given credentials|unable to log in with provided credentials|invalid (?:e-?mail|username) or password)\.?$/i,
    "Неверная почта или пароль.",
  ],
  [/^user account is disabled\.?$/i, "Аккаунт недоступен. Обратитесь в поддержку."],
  [/^authentication credentials were not provided\.?$/i, "Войдите в аккаунт, чтобы продолжить."],
  [/^you do not have permission to perform this action\.?$/i, "У вас нет прав для этого действия."],
  [/^not found\.?$/i, "Запрашиваемые данные не найдены."],
  [
    /^(?:the two password fields didn['’]t match|passwords do not match)\.?$/i,
    "Пароли не совпадают.",
  ],
  [
    /^(?:a valid (?:integer|number) is required|enter a (?:whole|valid) number)\.?$/i,
    "Введите корректное число.",
  ],
  [/^invalid value\.?$/i, "Проверьте введенное значение."],
  [/^this password is too common\.?$/i, "Этот пароль слишком распространен. Придумайте другой."],
  [/^this password is entirely numeric\.?$/i, "Пароль не должен состоять только из цифр."],
  [
    /^the password is too similar to the .+\.?$/i,
    "Пароль слишком похож на данные аккаунта. Придумайте другой.",
  ],
  [/^".*" is not a valid choice\.?$/i, "Выберите допустимый вариант из списка."],
  [/^invalid pk .*object does not exist\.?$/i, "Выбранный объект не найден. Обновите данные."],
];

/** Localizes display text only. Error codes, field paths and response metadata stay untouched. */
export function userErrorMessage(message: unknown, fallback = DEFAULT_MESSAGE): string {
  if (Array.isArray(message)) {
    const messages = message
      .filter((value): value is string => typeof value === "string" && !!value.trim())
      .map(value => userErrorMessage(value, fallback));
    return [...new Set(messages)].join(" ") || fallback;
  }
  if (typeof message !== "string" || !message.trim()) return fallback;
  const text = message.trim();
  const translation = TRANSLATIONS.find(([pattern]) => pattern.test(text));
  if (translation) return translation[1];

  const maxLength = text.match(/^ensure this field has no more than (\d+) characters\.?$/i);
  if (maxLength) return `Максимальное количество символов: ${maxLength[1]}.`;
  const minLength = text.match(/^ensure this field has at least (\d+) characters\.?$/i);
  if (minLength) return `Минимальное количество символов: ${minLength[1]}.`;
  const minPasswordLength = text.match(
    /^this password is too short\. it must contain at least (\d+) characters\.?$/i,
  );
  if (minPasswordLength)
    return `Пароль должен содержать не менее ${minPasswordLength[1]} символов.`;
  const minValue = text.match(
    /^ensure this value is greater than or equal to (-?\d+(?:\.\d+)?)\.?$/i,
  );
  if (minValue) return `Значение должно быть не меньше ${minValue[1]}.`;
  const maxValue = text.match(/^ensure this value is less than or equal to (-?\d+(?:\.\d+)?)\.?$/i);
  if (maxValue) return `Значение должно быть не больше ${maxValue[1]}.`;

  // A Russian object name quoted inside an English error is not translated prose.
  const prose = text
    .replace(/"[^"]*"|'[^']*'|«[^»]*»|“[^”]*”/g, "")
    .replace(/https?:\/\/\S+|\S+@\S+/g, "");
  return /[А-Яа-яЁё]/.test(prose) ? text : fallback;
}
