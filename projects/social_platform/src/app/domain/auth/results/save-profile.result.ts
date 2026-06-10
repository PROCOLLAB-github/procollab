/** @format */

/**
 * Тело ошибки валидации профиля от бэка.
 * Поля опциональны — сервер возвращает только те, что не прошли валидацию.
 */
export type SaveProfileError = {
  error?: {
    phone_number?: string[];
    language?: string;
    achievements?: string[];
    work_experience?: string[];
    first_name?: string[];
    last_name?: string[];
  };
};
