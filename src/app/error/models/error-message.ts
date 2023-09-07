/** @format */

export enum ErrorMessage {
  // Auth messages
  AUTH_EMAIL_EXIST = "Аккаунт с таким email уже зарегистрирован",
  AUTH_WRONG_AUTH = "Неправильный логин или пароль",
  AUTH_WRONG_PASSWORD = "Неправильный пароль",
  AUTH_EMAIL_NOT_EXIST = "Аккаунт с таким email не зарегистрирован",

  // FORM
  VALIDATION_TOO_LONG = "Максимальная длина:",
  VALIDATION_TOO_SHORT = "Минимальная длина:",
  VALIDATION_REQUIRED = "Обязательное поле",
  MINIMAL_AGE = "Минимальный возраст",
  INVALID_DATE = "Неправильный формат даты",
  VALIDATION_EMAIL = "Введенное значение не соответствует формату email",
  VALIDATION_PASSWORD_UNMATCH = "Пароли не совпадают",
  VALIDATION_LINK = "Введенное значение не соответствует формату ссылки",
  EMPTY_AVATAR = "*Выберите фото для профиля",
}
