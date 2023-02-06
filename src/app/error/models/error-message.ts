/** @format */

export enum ErrorMessage {
  AUTH_EMAIL_EXIST = "Аккаунт с таким email уже зарегистрирован",
  AUTH_WRONG_AUTH = "Неправильный логин или пароль",
  AUTH_WRONG_PASSWORD = "Неправильный пароль",
  AUTH_EMAIL_NOT_EXIST = "Аккаунт с таким email не зарегистрирован",

  VALIDATION_TOO_LONG = "Максимальная длинна:",
  VALIDATION_TOO_SHORT = "Минимальная длинна:",
  VALIDATION_REQUIRED = "Обязательное поле",
  MINIMAL_AGE = "Минимальный возраст",
  INVALID_DATE = "Неправильный формат даты",
  VALIDATION_EMAIL = "Введенное значение не соответствует формату email",
  VALIDATION_PASSWORD_UNMATCH = "Пароли не совпадают",
}
