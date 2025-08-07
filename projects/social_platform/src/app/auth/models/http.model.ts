/** @format */

/**
 * Модели HTTP запросов и ответов для аутентификации
 *
 * Назначение: Определяет структуру данных для API запросов аутентификации
 * Принимает: Не принимает параметров (классы моделей)
 * Возвращает: Типизированные объекты для HTTP взаимодействия
 *
 * Функциональность:
 * - LoginRequest: данные для входа (email, пароль)
 * - LoginResponse: ответ сервера при входе (токены)
 * - RefreshResponse: ответ при обновлении токенов
 * - RegisterRequest: данные для регистрации (имя, фамилия, email, пароль)
 * - RegisterResponse: ответ сервера при регистрации (наследует LoginResponse)
 */

export class LoginRequest {
  email!: string;
  password!: string;
}

export class LoginResponse {
  access!: string;
  refresh!: string;
}

export class RefreshResponse {
  access!: string;
  refresh!: string;
}

export class RegisterRequest {
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
}

export class RegisterResponse extends LoginResponse {}
