/** @format */

import { Inject, Injectable, Optional } from "@angular/core";

/**
 * Уровни логирования
 */
enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Сервис логирования с поддержкой уровней и форматирования
 *
 * Особенности:
 * - DEBUG логи пишутся только в development режиме
 * - Все логи включают timestamp и уровень логирования
 * - Поддержка дополнительного контекста (метаданные)
 * - Форматированный вывод для лучшей читаемости
 */
@Injectable({ providedIn: "root" })
export class LoggerService {
  private isDev = this.isDevMode();

  constructor(
    @Optional()
    @Inject("PRODUCTION")
    private production?: boolean
  ) {
    // Если PRODUCTION inject предоставлен, используем его, иначе проверяем окружение
    if (this.production !== undefined) {
      this.isDev = !this.production;
    }
  }

  /**
   * Логирование на уровне DEBUG
   * Видно только в development режиме
   *
   * @param message - сообщение логирования
   * @param data - дополнительные данные/контекст
   */
  // eslint-disable-next-line no-console
  debug(message: string, data?: unknown): void {
    if (this.isDev) {
      console.debug(this.formatLog(LogLevel.DEBUG, message, data));
    }
  }

  /**
   * Логирование на уровне INFO
   * Видно в обоих режимах
   *
   * @param message - сообщение логирования
   * @param data - дополнительные данные/контекст
   */
  // eslint-disable-next-line no-console
  info(message: string, data?: unknown): void {
    console.info(this.formatLog(LogLevel.INFO, message, data));
  }

  /**
   * Логирование на уровне WARN
   * Видно в обоих режимах
   *
   * @param message - сообщение логирования
   * @param data - дополнительные данные/контекст
   */
  // eslint-disable-next-line no-console
  warn(message: string, data?: unknown): void {
    console.warn(this.formatLog(LogLevel.WARN, message, data));
  }

  /**
   * Логирование на уровне ERROR
   * Видно в обоих режимах
   *
   * @param message - сообщение логирования
   * @param error - объект ошибки или дополнительные данные
   */
  // eslint-disable-next-line no-console
  error(message: string, error?: unknown): void {
    console.error(this.formatLog(LogLevel.ERROR, message, error));
  }

  /**
   * Форматирует лог с временем, уровнем и метаданными
   *
   * Формат:
   * [HH:MM:SS.sss] [LEVEL] Message: { data }
   */
  private formatLog(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = this.getTimestamp();
    const dataStr = data ? ` ${JSON.stringify(data)}` : "";
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  /**
   * Возвращает текущее время в формате HH:MM:SS.sss
   */
  private getTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ms = String(now.getMilliseconds()).padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  /**
   * Проверяет, находимся ли мы в development режиме
   */
  private isDevMode(): boolean {
    return !this.isProduction();
  }

  /**
   * Проверяет, находимся ли мы в production режиме
   */
  private isProduction(): boolean {
    // Проверяем разные способы определения production
    return (
      typeof process !== "undefined" && process.env && process.env["NODE_ENV"] === "production"
    );
  }
}
