/** @format */

/**
 * Модели HTTP запросов и ответов для аутентификации
 *
 * Назначение: Определяет структуру данных для API запросов аутентификации
 * Принимает: Не принимает параметров (классы моделей)
 * Возвращает: Типизированные объекты для HTTP взаимодействия
 *
 * Функциональность:
 * - LoginResponse: ответ сервера при входе (токены)
 * - RefreshResponse: ответ при обновлении токенов
 * - RegisterResponse: ответ сервера при регистрации (наследует LoginResponse)
 */

export class LoginResponse {
  access!: string;
  refresh!: string;
}

export class RefreshResponse {
  access!: string;
  refresh!: string;
}

export class RegisterResponse extends LoginResponse {}
