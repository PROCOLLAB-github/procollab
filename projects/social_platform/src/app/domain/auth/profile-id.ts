/**
 * Сообщение для контролируемой ошибки при попытке обновить профиль без ID.
 *
 * @format
 */

export const INVALID_PROFILE_ID_MESSAGE =
  "Не указан корректный идентификатор пользователя для обновления профиля";

/**
 * Проверяет, что идентификатор можно безопасно использовать в URL профиля.
 */
export function isValidProfileId(profileId: unknown): profileId is number {
  return typeof profileId === "number" && Number.isInteger(profileId) && profileId > 0;
}
