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
  VALIDATION_LANGUAGE = "Используйте символы кириллического алфавита",
  VALIDATION_EMAIL = "Введенное значение не соответствует формату email",
  VALIDATION_PASSWORD_UNMATCH = "Пароли не совпадают",
  EMPTY_AVATAR = "*Выберите фото для профиля",

  // Project invitation
  USER_NOT_EXISTING = "По данной ссылке пользователь не найден",
  VALIDATION_PROFILE_LINK = "Введенное значение не соответствует формату ссылки на профиль",

  // Project rating
  VALIDATION_UNFILLED_CRITERIA = "Не все критерии заполнены",
}
