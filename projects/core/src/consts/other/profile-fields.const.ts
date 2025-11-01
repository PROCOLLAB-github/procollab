/** @format */

/**
 * Конфигурация полей профиля пользователя
 * Определяет какие поля являются массивами, а какие строками
 * Используется для валидации и обработки данных профиля
 */
export const profileFields = [
  // Поля-массивы (содержат несколько элементов)
  { key: "education", type: "array" }, // Образование
  { key: "workExperience", type: "array" }, // Опыт работы
  { key: "userLanguages", type: "array" }, // Языки пользователя
  { key: "achievements", type: "array" }, // Достижения
  { key: "skills", type: "array" }, // Навыки

  // Строковые поля (одиночные значения)
  { key: "birthday", type: "string" }, // Дата рождения
  { key: "phoneNumber", type: "string" }, // Номер телефона
  { key: "speciality", type: "string" }, // Специальность
  { key: "aboutMe", type: "string" }, // О себе
  { key: "avatar", type: "string" }, // Аватар (URL)
  { key: "city", type: "string" }, // Город
  { key: "firstName", type: "string" }, // Имя
  { key: "lastName", type: "string" }, // Фамилия
];
